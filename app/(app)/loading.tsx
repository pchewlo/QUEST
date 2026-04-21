export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI row skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-quest-surface-muted" />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="h-80 rounded-lg bg-quest-surface-muted" />
      {/* Table skeleton */}
      <div className="h-64 rounded-lg bg-quest-surface-muted" />
    </div>
  )
}
