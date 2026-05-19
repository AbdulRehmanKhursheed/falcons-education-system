/**
 * UploadThing file router for the staff portal.
 *
 * Two endpoints:
 *   - `studentPhoto`         — small image used as the student's avatar
 *   - `applicationDocument`  — image or PDF attached to an admission application
 *
 * Auth: every endpoint requires a signed-in user. The middleware reads the
 * NextAuth session — we don't have anonymous uploads anywhere in the portal.
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { requireSession } from '@/lib/auth-helpers';

const f = createUploadthing();

export const ourFileRouter = {
  studentPhoto: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await requireSession();
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // The client receives `{ url, name, size, type }` automatically — we
      // return the userId so it surfaces in webhooks for auditing.
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  applicationDocument: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
    pdf: { maxFileSize: '8MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await requireSession();
      if (!session?.user?.id) {
        throw new UploadThingError('Unauthorized');
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
