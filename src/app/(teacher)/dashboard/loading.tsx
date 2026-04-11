/**
 * Dashboard skeleton — renders instantly while the server component
 * fetches teacher stats + recent sessions. Mirrors the real page:
 * bento KPIs row, "Today's Pick" card, recent sessions list.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero headline */}
      <div className="space-y-3">
        <div className="h-10 w-80 rounded-lg bg-surface-container-low" />
        <div className="h-4 w-64 rounded-md bg-surface-container-low" />
      </div>

      {/* Bento KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 rounded-[28px] bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>

      {/* Today's Pick */}
      <div className="h-56 rounded-[28px] bg-surface-container-lowest ambient-shadow" />

      {/* Recent sessions */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded-md bg-surface-container-low" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>
    </div>
  );
}
