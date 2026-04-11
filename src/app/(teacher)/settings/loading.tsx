/**
 * Settings skeleton — profile form fields + danger zone.
 */
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 w-56 rounded-lg bg-surface-container-low" />
        <div className="h-4 w-72 rounded-md bg-surface-container-low" />
      </div>

      {/* Profile card */}
      <div className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-6 space-y-5">
        <div className="h-5 w-32 rounded bg-surface-container-low" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 rounded bg-surface-container-low" />
            <div className="h-12 rounded-xl bg-surface-container-low" />
          </div>
        ))}
        <div className="h-12 w-40 rounded-full bg-surface-container-low" />
      </div>

      {/* Danger zone */}
      <div className="rounded-[28px] bg-surface-container-lowest ambient-shadow p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-surface-container-low" />
        <div className="h-12 w-48 rounded-full bg-surface-container-low" />
      </div>
    </div>
  );
}
