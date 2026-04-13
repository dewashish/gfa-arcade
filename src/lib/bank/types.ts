/**
 * Bank-specific row shape.
 * The auto-generated Supabase types don't yet include the template columns
 * added by `supabase-bank.sql` (is_template, subject, topic, year_level,
 * difficulty, description), so we hand-type the bank query result here.
 */

import type { ActivityConfig } from "@/lib/game-engine/types";
import type { SubjectKey } from "./imagery";

export interface BankActivity {
  id: string;
  title: string;
  game_type: string;
  description: string | null;
  subject: SubjectKey | string | null;
  topic: string | null;
  year_level: string | null;
  difficulty: string | null;
  config_json: ActivityConfig;
  created_at: string;
}

export const GAME_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  quiz: { label: "Quiz", emoji: "❓" },
  "spin-wheel": { label: "Spin Wheel", emoji: "🎡" },
  "match-up": { label: "Match Up", emoji: "🔗" },
  flashcards: { label: "Flash Cards", emoji: "🃏" },
  "speaking-cards": { label: "Speaking", emoji: "🎤" },
  "group-sort": { label: "Group Sort", emoji: "🗂️" },
  "complete-sentence": { label: "Sentence", emoji: "📝" },
  halving: { label: "Halving", emoji: "✂️" },
};

export function countActivityItems(config: ActivityConfig): number {
  switch (config.type) {
    case "quiz":
      return config.questions.length;
    case "spin-wheel":
      return config.segments.length;
    case "match-up":
      return config.pairs.length;
    case "flashcards":
      return config.cards.length;
    case "speaking-cards":
      return config.cards.length;
    case "group-sort":
      return config.groups.length;
    case "complete-sentence":
      return config.sentences.length;
    case "halving":
      return config.questions.length;
  }
}
