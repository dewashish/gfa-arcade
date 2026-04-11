/**
 * Student play skeleton — full-screen game area shimmer so tablets
 * don't flash a blank white screen between join and first question.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-12 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg bg-surface-container-low" />
        <div className="h-[480px] rounded-[28px] bg-surface-container-lowest ambient-shadow" />
        <div className="flex gap-3 justify-center">
          <div className="h-14 w-40 rounded-full bg-surface-container-low" />
          <div className="h-14 w-40 rounded-full bg-surface-container-low" />
        </div>
      </div>
    </div>
  );
}
