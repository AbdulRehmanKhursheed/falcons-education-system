/**
 * `/(app)/` segment loading skeleton. The auth-guarded layout (sidebar +
 * topbar) is already painted by the time this renders, so we only sketch
 * the inner content area: PageHeader + KPI strip + body.
 */
export default function AppLoading() {
  return (
    <div className="animate-pulse">
      {/* PageHeader */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="min-w-0 flex-1">
          <div className="h-3 w-20 bg-surface-3 rounded-xs mb-3" />
          <div className="h-9 w-72 bg-surface-3 rounded-sm" />
          <div className="mt-3 h-3.5 w-[28rem] max-w-full bg-surface-3 rounded-xs" />
        </div>
        <div className="shrink-0 h-9 w-28 bg-surface-3 rounded-sm" />
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

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-line bg-surface rounded-lg p-5 h-96">
          <div className="h-4 w-32 bg-surface-3 rounded-xs mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-3 w-full bg-surface-3 rounded-xs" />
            ))}
          </div>
        </div>
        <div className="border border-line bg-surface rounded-lg p-5 h-96">
          <div className="h-4 w-24 bg-surface-3 rounded-xs mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3 w-full bg-surface-3 rounded-xs" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
