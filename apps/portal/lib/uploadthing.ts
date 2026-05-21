/**
 * UploadThing helper — central env detection so the Uploader component can
 * gracefully degrade to a plain URL input when no UploadThing token is set
 * (dev / first-run / self-hosted dev environments).
 *
 * The SDK reads `UPLOADTHING_TOKEN` from `process.env`; we mirror that here so
 * a single import determines whether the widget should render.
 */

/**
 * `true` when the SDK has the configuration it needs to upload.
 *
 * IMPORTANT: this constant is referenced by `<Uploader>` which renders on the
 * client. `UPLOADTHING_TOKEN` is a *server-only* env var (no `NEXT_PUBLIC_`
 * prefix), so reading it directly in a module that ships to the client makes
 * the value always `false` in the browser bundle — the widget would never
 * show. We instead read `NEXT_PUBLIC_UPLOADTHING_ENABLED`, which gets inlined
 * into the client bundle by Next.js at build time. The deploy environment
 * should set this to "1" / "true" whenever `UPLOADTHING_TOKEN` is also set.
 *
 * On the server we additionally honour the token's presence, so a dev who
 * forgot to set the public flag but did set the token still gets the widget
 * server-side (it just won't render client-side without the public flag).
 */
function readFlag(): boolean {
  const pub = process.env.NEXT_PUBLIC_UPLOADTHING_ENABLED;
  if (typeof pub === 'string' && pub.length > 0 && pub !== '0' && pub.toLowerCase() !== 'false') {
    return true;
  }
  // Server-side fallback: presence of the token is enough.
  if (typeof window === 'undefined') {
    return (
      typeof process.env.UPLOADTHING_TOKEN === 'string' &&
      process.env.UPLOADTHING_TOKEN.length > 0
    );
  }
  return false;
}

export const uploadthingEnabled: boolean = readFlag();

/**
 * The set of endpoints we ship — keep in sync with `app/api/uploadthing/core.ts`.
 * Used by the `<Uploader>` component for a typed prop.
 */
export type UploadEndpoint = 'studentPhoto' | 'applicationDocument';
