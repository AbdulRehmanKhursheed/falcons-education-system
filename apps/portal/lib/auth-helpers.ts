import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export type AppRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'TEACHER'
  | 'PARENT'
  | 'ACCOUNTANT';

export async function requireSession() {
  const session = await auth();
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(allowed: AppRole[]) {
  const session = await auth();
  if (!session) redirect('/login');
  if (!allowed.includes(session.user.role as AppRole)) redirect('/dashboard');
  return session;
}
