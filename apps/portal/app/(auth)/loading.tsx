/**
 * `/(auth)/` segment loading state. The auth pages are simple centered
 * cards, so the skeleton is intentionally restrained.
 */
export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-pulse">
        <div className="border border-line bg-surface rounded-md px-8 py-14">
          <div className="h-3 w-16 bg-surface-3 rounded-xs mb-3 mx-auto" />
          <div className="h-8 w-48 bg-surface-3 rounded-sm mx-auto" />
          <div className="mt-8 space-y-4">
            <div className="h-10 w-full bg-surface-3 rounded-sm" />
            <div className="h-10 w-full bg-surface-3 rounded-sm" />
            <div className="h-10 w-full bg-ink/10 rounded-sm mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
