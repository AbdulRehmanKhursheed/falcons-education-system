/**
 * Next.js App Router handler — wires the file router defined in `./core`
 * into a GET/POST endpoint at /api/uploadthing.
 *
 * If `UPLOADTHING_TOKEN` is unset the SDK will refuse to process uploads at
 * runtime (returning a 500). The Uploader component side-steps that by not
 * sending requests at all when `uploadthingEnabled === false` — it falls back
 * to a plain URL input.
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
