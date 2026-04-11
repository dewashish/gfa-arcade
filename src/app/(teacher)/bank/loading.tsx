/**
 * Activity Bank skeleton — mirrors the real grid so the transition
 * from skeleton → live cards feels continuous: headline, two filter
 * chip rows, 3-column card grid with 6 placeholder cards.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero headline */}
      <div className="space-y-3">
        <div className="h-12 w-96 rounded-lg bg-surface-container-low" />
        <div className="h-5 w-[32rem] max-w-full rounded-md bg-surface-container-low" />
      </div>

      {/* Subject filter row */}
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-surface-container-low" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-11 w-32 rounded-full bg-surface-container-lowest ambient-shadow"
            />
          ))}
        </div>
      </div>

      {/* Game type filter row */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-surface-container-low" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-28 rounded-full bg-surface-container-lowest ambient-shadow"
            />
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-[28px] bg-surface-container-lowest ambient-shadow overflow-hidden flex flex-col"
          >
            <div className="h-48 bg-surface-container-low" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 rounded bg-surface-container-low" />
              <div className="h-4 w-full rounded bg-surface-container-low" />
              <div className="h-4 w-2/3 rounded bg-surface-container-low" />
              <div className="flex gap-2 pt-3">
                <div className="h-11 flex-1 rounded-full bg-surface-container-low" />
                <div className="h-11 flex-[2] rounded-full bg-surface-container-low" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
