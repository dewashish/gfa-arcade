/**
 * Session monitor skeleton — split view (game area + leaderboard
 * sidebar). Matches the real monitor-client layout so the teacher
 * doesn't see a blank screen while session + activity data load.
 */
export default function Loading() {
  return (
    <div className="animate-pulse h-full flex flex-col gap-4">
      {/* Status bar */}
      <div className="h-16 rounded-2xl bg-surface-container-lowest ambient-shadow" />

      {/* Split view: big game panel + sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 min-h-[600px]">
        <div className="rounded-[28px] bg-surface-container-lowest ambient-shadow" />
        <div className="rounded-[28px] bg-surface-container-lowest ambient-shadow" />
      </div>

      {/* Bottom actions */}
      <div className="flex justify-between gap-3">
        <div className="h-12 w-32 rounded-full bg-surface-container-low" />
        <div className="h-12 w-40 rounded-full bg-surface-container-low" />
      </div>
    </div>
  );
}
