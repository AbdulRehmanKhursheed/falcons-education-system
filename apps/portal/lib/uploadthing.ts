/**
 * UploadThing helper — central env detection so the Uploader component can
 * gracefully degrade to a plain URL input when no UploadThing token is set
 * (dev / first-run / self-hosted dev environments).
 *
 * The SDK reads `UPLOADTHING_TOKEN` from `process.env`; we mirror that here so
 * a single import determines whether the widget should render.
 */

/**
 * `true` when the SDK has the configuration it needs to upload. We only check
 * for the token because that's the one secret-bearing variable — everything
 * else has sensible defaults.
 *
 * IMPORTANT: this is evaluated at module-evaluation time on the *server*. On
 * the client the value is replaced via Next's NEXT_PUBLIC inlining (we expose
 * the boolean below as a public constant so it survives the bundle).
 */
export const uploadthingEnabled: boolean =
  typeof process !== 'undefined' &&
  typeof process.env?.UPLOADTHING_TOKEN === 'string' &&
  process.env.UPLOADTHING_TOKEN.length > 0;

/**
 * The set of endpoints we ship — keep in sync with `app/api/uploadthing/core.ts`.
 * Used by the `<Uploader>` component for a typed prop.
 */
export type UploadEndpoint = 'studentPhoto' | 'applicationDocument';
