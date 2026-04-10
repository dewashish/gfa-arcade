import type { GameType } from "./types";

const BASE_SCORES: Record<GameType, number> = {
  "spin-wheel": 0, // Score comes from wheel segments
  "match-up": 100,
  quiz: 1000,
  flashcards: 0, // No competitive scoring
  "speaking-cards": 0, // No competitive scoring
  "complete-sentence": 100,
  "group-sort": 100,
};

const TIME_BONUS_MAX = 500;
const STREAK_MULTIPLIERS = [1, 1.2, 1.5, 2, 2.5, 3];

export function calculateScore(params: {
  gameType: GameType;
  isCorrect: boolean;
  timeTakenMs: number;
  timeLimitMs: number;
  streak: number;
  segmentValue?: number; // For spin wheel
}): number {
  const { gameType, isCorrect, timeTakenMs, timeLimitMs, streak, segmentValue } = params;

  // Spin wheel uses segment value directly
  if (gameType === "spin-wheel") {
    return segmentValue ?? 0;
  }

  // Non-competitive games
  if (gameType === "flashcards" || gameType === "speaking-cards") {
    return 0;
  }

  if (!isCorrect) return 0;

  const baseScore = BASE_SCORES[gameType];

  // Time bonus: faster = more points (linear scale)
  const timeRatio = Math.max(0, 1 - timeTakenMs / timeLimitMs);
  const timeBonus = Math.round(timeRatio * TIME_BONUS_MAX);

  // Streak multiplier (capped at 3x)
  const streakIndex = Math.min(streak, STREAK_MULTIPLIERS.length - 1);
  const multiplier = STREAK_MULTIPLIERS[streakIndex];

  return Math.round((baseScore + timeBonus) * multiplier);
}
