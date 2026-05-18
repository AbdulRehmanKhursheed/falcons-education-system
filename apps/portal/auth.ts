import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/schemas/auth';
import {
  LOGIN_RATE_LIMIT,
  ipFromHeaders,
  loginRateLimitKey,
  peekRateLimit,
  rateLimit,
  resetRateLimit,
} from '@/lib/rate-limit';

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: string } & DefaultSession['user'];
  }
  interface User {
    role?: string;
  }
}

/**
 * Best-effort audit log write. We never let an audit failure block a real
 * auth decision — log the error and move on.
 */
async function writeAuthAudit(args: {
  action: 'auth.login.success' | 'auth.login.failure';
  actorId: string | null;
  entityId: string;
  email: string;
  ip: string;
  userAgent: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: args.actorId,
        action: args.action,
        entityType: 'User',
        entityId: args.entityId,
        diff: { email: args.email },
        ip: args.ip,
        userAgent: args.userAgent,
      },
    });
  } catch (err) {
    // Don't crash auth on audit write failure (DB outage, etc.).
    console.error('[auth] audit log write failed', err);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const headers = request?.headers ?? new Headers();
        const ip = ipFromHeaders(headers);
        const userAgent = headers.get('user-agent') ?? 'unknown';
        const rlKey = loginRateLimitKey(ip);

        // Defense-in-depth: re-check rate limit here in case the request
        // bypassed middleware (e.g. server-side signIn(), tests).
        const peek = peekRateLimit(rlKey, LOGIN_RATE_LIMIT);
        if (!peek.allowed) return null;

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          rateLimit(rlKey, LOGIN_RATE_LIMIT);
          await writeAuthAudit({
            action: 'auth.login.failure',
            actorId: null,
            entityId: 'unknown',
            email:
              typeof credentials?.email === 'string' ? credentials.email : 'unknown',
            ip,
            userAgent,
          });
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            active: true,
          },
        });

        const passwordOk =
          user && user.passwordHash
            ? await bcrypt.compare(parsed.data.password, user.passwordHash)
            : false;

        if (!user || !user.active || !user.passwordHash || !passwordOk) {
          rateLimit(rlKey, LOGIN_RATE_LIMIT);
          await writeAuthAudit({
            action: 'auth.login.failure',
            actorId: null,
            entityId: user?.id ?? 'unknown',
            email: parsed.data.email,
            ip,
            userAgent,
          });
          return null;
        }

        // Successful login — clear the bucket so legitimate users aren't
        // penalised for past typos.
        resetRateLimit(rlKey);
        await writeAuthAudit({
          action: 'auth.login.success',
          actorId: user.id,
          entityId: user.id,
          email: user.email,
          ip,
          userAgent,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
