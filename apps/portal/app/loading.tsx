/**
 * Root-level loading skeleton. Shown while the auth-guarded `/(app)/`
 * tree is hydrating before its own segment loader takes over. Mirrors
 * the broad page silhouette: page header + KPI strip + main content.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-surface-2 px-5 sm:px-7 lg:px-10 py-8 lg:py-10">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-3 w-20 bg-surface-3 rounded-xs mb-3" />
          <div className="h-10 w-72 bg-surface-3 rounded-sm" />
          <div className="mt-3 h-3.5 w-96 bg-surface-3 rounded-xs" />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-line bg-surface rounded-lg p-5">
              <div className="h-3 w-16 bg-surface-3 rounded-xs mb-3" />
              <div className="h-7 w-24 bg-surface-3 rounded-xs" />
              <div className="mt-3 h-3 w-20 bg-surface-3 rounded-xs" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 border border-line bg-surface rounded-lg p-5 h-80">
            <div className="h-4 w-32 bg-surface-3 rounded-xs mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 w-full bg-surface-3 rounded-xs" />
              ))}
            </div>
          </div>
          <div className="border border-line bg-surface rounded-lg p-5 h-80">
            <div className="h-4 w-24 bg-surface-3 rounded-xs mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 w-full bg-surface-3 rounded-xs" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
