/**
 * Reports skeleton — KPI bento + StatBars + SessionRow list.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-56 rounded-lg bg-surface-container-low" />
        <div className="h-4 w-80 rounded-md bg-surface-container-low" />
      </div>

      {/* KPI bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-[28px] bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>

      {/* Stat bars */}
      <div className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-surface-container-low" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-full bg-surface-container-low" />
        ))}
      </div>

      {/* Session rows */}
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>
    </div>
  );
}
