import type { GameType } from "./types";

/**
 * Scoring formula (v2):
 *
 *   Correct:   100 base + up to 50 time bonus = max 150 per question
 *   Attempted: 20 participation points (no negatives)
 *   Skipped:   0
 *
 * No streak multiplier — streaks are purely visual.
 * Tiebreaker: faster answers earn more via the time bonus.
 */

const BASE_CORRECT = 100;
const BASE_ATTEMPT = 20;
const TIME_BONUS_MAX = 50;

export function calculateScore(params: {
  gameType: GameType;
  isCorrect: boolean;
  timeTakenMs: number;
  timeLimitMs: number;
  streak: number;
  segmentValue?: number;
}): number {
  const { gameType, isCorrect, timeTakenMs, timeLimitMs, segmentValue } = params;

  // Spin wheel uses segment value directly
  if (gameType === "spin-wheel") {
    return segmentValue ?? 0;
  }

  // Non-competitive games
  if (gameType === "flashcards" || gameType === "speaking-cards") {
    return 0;
  }

  // Attempted but wrong — participation points
  if (!isCorrect) return BASE_ATTEMPT;

  // Correct answer: base + time bonus
  const timeRatio = Math.max(0, 1 - timeTakenMs / timeLimitMs);
  const timeBonus = Math.round(timeRatio * TIME_BONUS_MAX);

  return BASE_CORRECT + timeBonus;
}
