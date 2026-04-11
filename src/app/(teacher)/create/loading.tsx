/**
 * Create skeleton — game type selector grid.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-64 rounded-lg bg-surface-container-low" />
        <div className="h-4 w-80 rounded-md bg-surface-container-low" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-52 rounded-[28px] bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>
    </div>
  );
}
