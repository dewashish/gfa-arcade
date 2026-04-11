/**
 * My Library skeleton — matches the real page: headline, sort toggle,
 * vertical list of teacher-created activity rows.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-72 rounded-lg bg-surface-container-low" />
          <div className="h-4 w-56 rounded-md bg-surface-container-low" />
        </div>
        <div className="h-11 w-36 rounded-full bg-surface-container-lowest ambient-shadow" />
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-surface-container-lowest ambient-shadow"
          />
        ))}
      </div>
    </div>
  );
}
