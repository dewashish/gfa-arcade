// ===== Game Types =====

export type GameType = "spin-wheel" | "match-up" | "quiz" | "flashcards" | "speaking-cards" | "complete-sentence" | "group-sort";

export type GamePhase = "waiting" | "playing" | "round_result" | "finished";

// ===== Activity Config (discriminated union per game type) =====

export type SpinWheelConfig = {
  type: "spin-wheel";
  segments: Array<{
    label: string;
    value: number;
    color?: string;
    special?: "x2" | "bankrupt";
    /** Optional emoji to render in the segment (decorative). */
    emoji?: string;
  }>;
  rounds: number;
};

export type MatchUpConfig = {
  type: "match-up";
  pairs: Array<{
    term: string;
    definition: string;
    image_url?: string;
    /** Optional emoji rendered inside the term card to make pairs
     *  more visually distinct for Year 1 readers. */
    emoji?: string;
  }>;
  time_limit_seconds?: number;
};

/**
 * Per-question visual that renders above the question text. A
 * discriminated union so each visual gets its own typed props. The
 * `VisualRegistry` component dispatches on `kind`.
 *
 * Visuals are descriptive/representative — they never reveal the
 * answer. The correct option lives only in `correct_index`.
 */
export type QuestionVisual =
  /** One shape (circle, square, rect, pizza, chocolate bar) cut into
   *  a specific pattern, used as a context image above text options.
   *  Animates with a gentle pulse + idle sway. */
  | {
      kind: "shape-fraction";
      shape: "circle" | "square" | "rectangle" | "pizza" | "chocolate";
      /** Which cut pattern to draw. "half-v" = vertical half,
       *  "half-h" = horizontal half, "quarter" = 4 equal quarters,
       *  "uneven-2" = 2 unequal pieces, "thirds" = 3 equal thirds. */
      pattern:
        | "whole"
        | "half-v"
        | "half-h"
        | "half-diag"
        | "quarter"
        | "uneven-2"
        | "thirds";
      /** Optional highlight colour for the "shaded" piece. */
      highlight?: string;
    }
  /** Grid of 4 shape variants labelled A/B/C/D — student picks which
   *  one matches the question. Each variant has its own cut pattern. */
  | {
      kind: "shape-option-grid";
      shape: "circle" | "square" | "rectangle" | "pizza" | "chocolate";
      patterns: Array<"whole" | "half-v" | "half-h" | "half-diag" | "quarter" | "uneven-2" | "thirds">;
    }
  /** A row/grid of N identical countable objects (apples, smiles,
   *  stars, dots) used for counting and "half of a quantity" questions. */
  | {
      kind: "counted-objects";
      object: "apple" | "smile" | "star" | "dot" | "heart" | "cookie" | "balloon";
      count: number;
      /** If set, splits the row with a thin divider at this index to
       *  visually show the "half" or "quarter" split. Never reveals
       *  the answer because the divider is always at the midpoint for
       *  "find half of N" questions, not the correct pick. */
      divider?: number;
    }
  /** A magnet next to a household item with a subtle gravitational
   *  wobble between them. Used for magnetic/non-magnetic questions. */
  | {
      kind: "magnet-object";
      /** Which everyday item to show alongside the magnet. */
      object:
        | "nail"
        | "spoon"
        | "fork"
        | "paper"
        | "plastic-toy"
        | "wood-block"
        | "rubber-band"
        | "key"
        | "coin"
        | "scissors"
        | "sponge"
        | "glass"
        | "fridge"
        | "paperclip"
        | "eraser";
    }
  /** A simple illustrated word (boy, bird, shirt, flower, boot) paired
   *  with its emoji/cartoon, used for phonics recognition. */
  | {
      kind: "phonics-word";
      word: string;
      /** Which mini cartoon to render next to the word. */
      illustration:
        | "boy"
        | "toy"
        | "coin"
        | "oil"
        | "bird"
        | "girl"
        | "shirt"
        | "skirt"
        | "blue"
        | "glue"
        | "rescue"
        | "statue"
        | "saw"
        | "straw"
        | "paw"
        | "yawn"
        // sh / ch / th digraph illustrations (added for mixed phonics review)
        | "fish"
        | "ship"
        | "chip"
        | "chair"
        | "cherry"
        | "thumb"
        | "moth"
        | "bath";
    };

export type QuizConfig = {
  type: "quiz";
  questions: Array<{
    question: string;
    options: string[];
    correct_index: number;
    image_url?: string;
    visual?: QuestionVisual;
    time_limit_seconds?: number;
  }>;
};

export type FlashCardsConfig = {
  type: "flashcards";
  cards: Array<{
    front: string;
    back: string;
    image_url?: string;
    /** Optional emoji rendered on the front of the card alongside
     *  the text — gives Year 1 readers a visual anchor. */
    emoji?: string;
  }>;
};

export type SpeakingCardsConfig = {
  type: "speaking-cards";
  cards: Array<{
    prompt: string;
    audio_url?: string;
  }>;
};

export type CompleteSentenceConfig = {
  type: "complete-sentence";
  sentences: Array<{
    text: string;
    blanks: Array<{
      position: number;
      answer: string;
      distractors: string[];
    }>;
  }>;
};

export type GroupSortConfig = {
  type: "group-sort";
  groups: Array<{
    name: string;
    items: string[];
    /** Optional emoji to render as the bucket icon. */
    emoji?: string;
  }>;
  /** Optional map of item text → emoji for decorating draggable items.
   *  Kept as a parallel map so legacy string-only item arrays stay
   *  compatible with the existing seeded activities. */
  itemIcons?: Record<string, string>;
  time_limit_seconds?: number;
};

export type ActivityConfig =
  | SpinWheelConfig
  | MatchUpConfig
  | QuizConfig
  | FlashCardsConfig
  | SpeakingCardsConfig
  | CompleteSentenceConfig
  | GroupSortConfig;

// ===== Class Plan / Pacing =====

export type TimerMode = "per-question" | "overall" | "none";

export interface ActivityPacingConfig {
  timer_mode: TimerMode;
  /** Seconds — per-question when mode is "per-question", total when "overall" */
  timer_seconds: number;
  /** Auto-advance to next question when timer expires */
  auto_advance: boolean;
  /** Teacher can skip ahead if all students answered */
  teacher_can_skip: boolean;
}

export interface ClassPlanActivity {
  activity_id: string;
  pacing: ActivityPacingConfig;
  order: number;
}

export interface ClassPlan {
  id: string;
  teacher_id: string;
  name: string;
  activities: ClassPlanActivity[];
  created_at: string;
  updated_at: string;
}

/** Default pacing for a game type when first added to a class plan. */
export function defaultPacing(gameType: string): ActivityPacingConfig {
  const perQ = ["quiz", "spin-wheel"];
  return {
    timer_mode: perQ.includes(gameType) ? "per-question" : "overall",
    timer_seconds: perQ.includes(gameType) ? 25 : 90,
    auto_advance: true,
    teacher_can_skip: true,
  };
}

// ===== Realtime Events =====

export type GameEvent =
  | { type: "game:start" }
  | { type: "game:spin"; angle: number; segmentIndex: number }
  | { type: "game:next_question"; questionIndex: number }
  | { type: "game:round_result"; results: Record<string, number> }
  | { type: "game:end" }
  | { type: "game:join"; studentId: string; studentName: string; avatarId: string }
  | { type: "game:answer"; studentId: string; questionIndex: number; answer: unknown }
  | { type: "game:next_activity"; sessionId: string; activityTitle: string; order: number }
  | { type: "game:timer_sync"; remaining: number; total: number }
  | { type: "game:streak"; studentName: string; streak: number };

// ===== Leaderboard Entry =====

export type LeaderboardEntry = {
  student_id: string;
  student_name: string;
  avatar_id: string;
  total_score: number;
  rank: number;
};

// ===== Game Component Interface =====

export interface GameComponentProps {
  config: ActivityConfig;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  sessionId: string;
  studentId?: string;
  isTeacher: boolean;
  onAnswer: (answer: unknown) => void;
}

// ===== Avatar =====

export type AvatarOption = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export const AVATARS: AvatarOption[] = [
  { id: "cat", name: "Cat", emoji: "🐱", color: "#FFB800" },
  { id: "dog", name: "Dog", emoji: "🐶", color: "#2E97E6" },
  { id: "penguin", name: "Penguin", emoji: "🐧", color: "#00A396" },
  { id: "bunny", name: "Bunny", emoji: "🐰", color: "#FF8A80" },
  { id: "bear", name: "Bear", emoji: "🐻", color: "#A1887F" },
  { id: "owl", name: "Owl", emoji: "🦉", color: "#7C5800" },
  { id: "fox", name: "Fox", emoji: "🦊", color: "#FF6D00" },
  { id: "panda", name: "Panda", emoji: "🐼", color: "#424242" },
  { id: "lion", name: "Lion", emoji: "🦁", color: "#FDD835" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄", color: "#E040FB" },
  { id: "dragon", name: "Dragon", emoji: "🐉", color: "#00C853" },
  { id: "robot", name: "Robot", emoji: "🤖", color: "#00629E" },
  { id: "astronaut", name: "Astronaut", emoji: "🧑‍🚀", color: "#6200EA" },
  { id: "superhero", name: "Superhero", emoji: "🦸", color: "#D50000" },
  { id: "star", name: "Star", emoji: "⭐", color: "#FFD600" },
  { id: "rocket", name: "Rocket", emoji: "🚀", color: "#00B8D4" },
];
