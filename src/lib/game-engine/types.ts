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
  }>;
  rounds: number;
};

export type MatchUpConfig = {
  type: "match-up";
  pairs: Array<{
    term: string;
    definition: string;
    image_url?: string;
  }>;
  time_limit_seconds?: number;
};

export type QuizConfig = {
  type: "quiz";
  questions: Array<{
    question: string;
    options: string[];
    correct_index: number;
    image_url?: string;
    time_limit_seconds?: number;
  }>;
};

export type FlashCardsConfig = {
  type: "flashcards";
  cards: Array<{
    front: string;
    back: string;
    image_url?: string;
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
  }>;
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

// ===== Realtime Events =====

export type GameEvent =
  | { type: "game:start" }
  | { type: "game:spin"; angle: number; segmentIndex: number }
  | { type: "game:next_question"; questionIndex: number }
  | { type: "game:round_result"; results: Record<string, number> }
  | { type: "game:end" }
  | { type: "game:join"; studentId: string; studentName: string; avatarId: string }
  | { type: "game:answer"; studentId: string; questionIndex: number; answer: unknown };

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
