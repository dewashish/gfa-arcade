"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createGameSession } from "@/lib/game-engine/session-manager";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { SpinWheelConfig, MatchUpConfig, QuizConfig, FlashCardsConfig, SpeakingCardsConfig, GroupSortConfig } from "@/lib/game-engine/types";

interface Props {
  gameType: string;
}

const GAME_INFO: Record<string, { title: string; icon: string; color: string }> = {
  "spin-wheel": { title: "Spin the Wheel", icon: "casino", color: "#2E97E6" },
  "match-up": { title: "Match Up", icon: "compare_arrows", color: "#00A396" },
  quiz: { title: "Quiz", icon: "quiz", color: "#FFB800" },
  flashcards: { title: "Flash Cards", icon: "style", color: "#FF8A80" },
  "speaking-cards": { title: "Speaking Cards", icon: "record_voice_over", color: "#E040FB" },
  "group-sort": { title: "Group Sort", icon: "category", color: "#7C5800" },
};

export function ActivityEditorClient({ gameType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playId = searchParams.get("play");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [launching, setLaunching] = useState(!!playId);
  const info = GAME_INFO[gameType] ?? { title: "Game", icon: "extension", color: "#707882" };

  // ===== Quick-launch via ?play=<activityId> =====
  // Loads the activity, creates a session, and routes straight to the monitor.
  useEffect(() => {
    if (!playId) return;
    let cancelled = false;

    const id = playId;
    async function launch() {
      try {
        const supabase = createClient();
        const { data: activity, error } = await supabase
          .from("activities")
          .select("id")
          .eq("id", id)
          .maybeSingle();
        if (error || !activity) {
          console.error("Activity not found", error);
          if (!cancelled) {
            setLaunching(false);
            router.push("/dashboard");
          }
          return;
        }
        const session = await createGameSession(supabase, activity.id);
        if (!cancelled) {
          router.push(`/session/${session.id}`);
        }
      } catch (e) {
        console.error("Quick launch failed", e);
        if (!cancelled) setLaunching(false);
      }
    }

    launch();
    return () => {
      cancelled = true;
    };
  }, [playId, router]);

  if (launching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-headline text-xl text-on-surface-variant">
          Starting your game...
        </p>
      </div>
    );
  }

  // Spin Wheel state
  const [segments, setSegments] = useState([
    { label: "100", value: 100 },
    { label: "250", value: 250 },
    { label: "500", value: 500 },
    { label: "750", value: 750 },
    { label: "1000", value: 1000 },
    { label: "X2", value: 0, special: "x2" as const },
    { label: "0", value: 0 },
    { label: "BANKRUPT", value: 0, special: "bankrupt" as const },
  ]);
  const [rounds, setRounds] = useState(10);

  // Match Up state
  const [pairs, setPairs] = useState([
    { term: "", definition: "" },
    { term: "", definition: "" },
    { term: "", definition: "" },
  ]);

  // Quiz state
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct_index: 0, time_limit_seconds: 20 },
  ]);

  // Flash Cards state
  const [cards, setCards] = useState([
    { front: "", back: "" },
    { front: "", back: "" },
    { front: "", back: "" },
  ]);

  // Speaking Cards state
  const [prompts, setPrompts] = useState([
    { prompt: "" },
    { prompt: "" },
    { prompt: "" },
  ]);

  // Group Sort state
  const [groups, setGroups] = useState([
    { name: "", items: ["", ""] },
    { name: "", items: ["", ""] },
  ]);

  function buildConfig() {
    switch (gameType) {
      case "spin-wheel":
        return { type: "spin-wheel", segments, rounds } as SpinWheelConfig;
      case "match-up":
        return {
          type: "match-up",
          pairs: pairs.filter((p) => p.term && p.definition),
          time_limit_seconds: 60,
        } as MatchUpConfig;
      case "quiz":
        return {
          type: "quiz",
          questions: questions.filter((q) => q.question && q.options.some(Boolean)),
        } as QuizConfig;
      case "flashcards":
        return {
          type: "flashcards",
          cards: cards.filter((c) => c.front && c.back),
        } as FlashCardsConfig;
      case "speaking-cards":
        return {
          type: "speaking-cards",
          cards: prompts.filter((p) => p.prompt).map((p) => ({ prompt: p.prompt })),
        } as SpeakingCardsConfig;
      case "group-sort":
        return {
          type: "group-sort",
          groups: groups.filter((g) => g.name).map((g) => ({
            name: g.name,
            items: g.items.filter(Boolean),
          })),
        } as GroupSortConfig;
      default:
        return { type: gameType } as never;
    }
  }

  async function handleSaveAndPlay() {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const config = buildConfig();

      // Create activity
      const { data: activity, error } = await supabase
        .from("activities")
        .insert({
          teacher_id: user.id,
          title: title.trim(),
          game_type: gameType,
          config_json: config as unknown as Record<string, unknown>,
        })
        .select()
        .single();

      if (error || !activity) throw error;

      // Create game session with PIN
      const session = await createGameSession(supabase, activity.id);
      setPinCode(session.pin_code);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  // If we have a PIN, show the session start screen
  if (pinCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">
            celebration
          </span>
          <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">
            Game Ready!
          </h1>
          <p className="text-on-surface-variant font-body">
            Share this PIN with your students
          </p>
        </div>

        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-sm text-on-surface-variant font-body mb-2">Game PIN</p>
          <p className="font-headline text-6xl font-bold text-primary tracking-widest">
            {pinCode}
          </p>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            icon="monitor"
            onClick={() => {
              // Find the session ID from Supabase
              const supabase = createClient();
              supabase
                .from("game_sessions")
                .select("id")
                .eq("pin_code", pinCode)
                .maybeSingle()
                .then(({ data }) => {
                  if (data) router.push(`/session/${data.id}`);
                });
            }}
          >
            Open Teacher Monitor
          </Button>
          <Button variant="ghost" size="lg" icon="content_copy" onClick={() => navigator.clipboard.writeText(pinCode)}>
            Copy PIN
          </Button>
        </div>

        <p className="text-sm text-on-surface-variant font-body">
          Students join at <strong className="text-primary">/play</strong> and enter this PIN
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: info.color + "20" }}
        >
          <span className="material-symbols-outlined text-3xl" style={{ color: info.color }}>
            {info.icon}
          </span>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">{info.title}</h1>
          <p className="text-on-surface-variant font-body">Create your activity content</p>
        </div>
      </div>

      {/* Activity Title */}
      <Input
        label="Activity Title"
        icon="title"
        placeholder="e.g., Phonics Match Up, Addition Spin"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Game-specific editor */}
      {gameType === "spin-wheel" && (
        <SpinWheelEditor
          segments={segments}
          setSegments={setSegments}
          rounds={rounds}
          setRounds={setRounds}
        />
      )}

      {gameType === "match-up" && (
        <MatchUpEditor pairs={pairs} setPairs={setPairs} />
      )}

      {gameType === "quiz" && (
        <QuizEditor questions={questions} setQuestions={setQuestions} />
      )}

      {gameType === "flashcards" && (
        <FlashCardsEditor cards={cards} setCards={setCards} />
      )}

      {gameType === "speaking-cards" && (
        <SpeakingCardsEditor prompts={prompts} setPrompts={setPrompts} />
      )}

      {gameType === "group-sort" && (
        <GroupSortEditor groups={groups} setGroups={setGroups} />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="primary"
          size="lg"
          icon="play_arrow"
          loading={saving}
          onClick={handleSaveAndPlay}
          disabled={!title.trim()}
        >
          Save & Start Game
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ===== Spin Wheel Editor =====
function SpinWheelEditor({
  segments,
  setSegments,
  rounds,
  setRounds,
}: {
  segments: SpinWheelConfig["segments"];
  setSegments: (s: SpinWheelConfig["segments"]) => void;
  rounds: number;
  setRounds: (r: number) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Wheel Segments</h3>
      <p className="text-sm text-on-surface-variant font-body">
        Customize the values on each wheel segment.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="Label"
              value={seg.label}
              onChange={(e) => {
                const updated = [...segments];
                updated[i] = { ...seg, label: e.target.value };
                setSegments(updated);
              }}
            />
            <Input
              type="number"
              placeholder="Points"
              value={String(seg.value)}
              onChange={(e) => {
                const updated = [...segments];
                updated[i] = { ...seg, value: parseInt(e.target.value) || 0 };
                setSegments(updated);
              }}
              className="w-24"
            />
          </div>
        ))}
      </div>
      <Input
        label="Number of Rounds"
        type="number"
        value={String(rounds)}
        onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
      />
    </Card>
  );
}

// ===== Match Up Editor =====
function MatchUpEditor({
  pairs,
  setPairs,
}: {
  pairs: MatchUpConfig["pairs"];
  setPairs: (p: MatchUpConfig["pairs"]) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Term & Definition Pairs</h3>
      <div className="space-y-3">
        {pairs.map((pair, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1">
              <Input
                placeholder="Term"
                value={pair.term}
                onChange={(e) => {
                  const updated = [...pairs];
                  updated[i] = { ...pair, term: e.target.value };
                  setPairs(updated);
                }}
              />
            </div>
            <span className="material-symbols-outlined text-outline-variant mt-3">
              arrow_forward
            </span>
            <div className="flex-1">
              <Input
                placeholder="Definition"
                value={pair.definition}
                onChange={(e) => {
                  const updated = [...pairs];
                  updated[i] = { ...pair, definition: e.target.value };
                  setPairs(updated);
                }}
              />
            </div>
            {pairs.length > 2 && (
              <button
                onClick={() => setPairs(pairs.filter((_, idx) => idx !== i))}
                className="mt-3 text-error"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        icon="add"
        onClick={() => setPairs([...pairs, { term: "", definition: "" }])}
      >
        Add Pair
      </Button>
    </Card>
  );
}

// ===== Quiz Editor =====
function QuizEditor({
  questions,
  setQuestions,
}: {
  questions: Array<{ question: string; options: string[]; correct_index: number; time_limit_seconds: number }>;
  setQuestions: (q: Array<{ question: string; options: string[]; correct_index: number; time_limit_seconds: number }>) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Questions</h3>
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-3 pb-4 border-b border-surface-high last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-headline font-semibold text-primary">
                Q{qi + 1}
              </span>
              <div className="flex-1">
                <Input
                  placeholder="Enter your question..."
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qi] = { ...q, question: e.target.value };
                    setQuestions(updated);
                  }}
                />
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => setQuestions(questions.filter((_, idx) => idx !== qi))}
                  className="text-error"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pl-8">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = [...questions];
                      updated[qi] = { ...q, correct_index: oi };
                      setQuestions(updated);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      q.correct_index === oi
                        ? "bg-tertiary-container text-on-tertiary-container"
                        : "bg-surface-high text-on-surface-variant"
                    }`}
                  >
                    {String.fromCharCode(65 + oi)}
                  </button>
                  <Input
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...questions];
                      const opts = [...q.options];
                      opts[oi] = e.target.value;
                      updated[qi] = { ...q, options: opts };
                      setQuestions(updated);
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant pl-8 font-body">
              Click the letter to mark the correct answer (highlighted in green)
            </p>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        icon="add"
        onClick={() =>
          setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], correct_index: 0, time_limit_seconds: 20 },
          ])
        }
      >
        Add Question
      </Button>
    </Card>
  );
}

// ===== Flash Cards Editor =====
function FlashCardsEditor({
  cards,
  setCards,
}: {
  cards: Array<{ front: string; back: string }>;
  setCards: (c: Array<{ front: string; back: string }>) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Flash Cards</h3>
      <p className="text-sm text-on-surface-variant font-body">Front = question, Back = answer</p>
      <div className="space-y-3">
        {cards.map((card, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1">
              <Input
                placeholder="Front (question)"
                value={card.front}
                onChange={(e) => {
                  const updated = [...cards];
                  updated[i] = { ...card, front: e.target.value };
                  setCards(updated);
                }}
              />
            </div>
            <span className="material-symbols-outlined text-outline-variant mt-3">sync_alt</span>
            <div className="flex-1">
              <Input
                placeholder="Back (answer)"
                value={card.back}
                onChange={(e) => {
                  const updated = [...cards];
                  updated[i] = { ...card, back: e.target.value };
                  setCards(updated);
                }}
              />
            </div>
            {cards.length > 2 && (
              <button onClick={() => setCards(cards.filter((_, idx) => idx !== i))} className="mt-3 text-error">
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" icon="add" onClick={() => setCards([...cards, { front: "", back: "" }])}>
        Add Card
      </Button>
    </Card>
  );
}

// ===== Speaking Cards Editor =====
function SpeakingCardsEditor({
  prompts,
  setPrompts,
}: {
  prompts: Array<{ prompt: string }>;
  setPrompts: (p: Array<{ prompt: string }>) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Speaking Prompts</h3>
      <p className="text-sm text-on-surface-variant font-body">Each card shows a prompt for the student to read aloud</p>
      <div className="space-y-3">
        {prompts.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-sm font-headline font-semibold text-primary w-6">{i + 1}</span>
            <div className="flex-1">
              <Input
                placeholder="e.g., Tell me about your favourite animal"
                value={p.prompt}
                onChange={(e) => {
                  const updated = [...prompts];
                  updated[i] = { prompt: e.target.value };
                  setPrompts(updated);
                }}
              />
            </div>
            {prompts.length > 2 && (
              <button onClick={() => setPrompts(prompts.filter((_, idx) => idx !== i))} className="text-error">
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" icon="add" onClick={() => setPrompts([...prompts, { prompt: "" }])}>
        Add Prompt
      </Button>
    </Card>
  );
}

// ===== Group Sort Editor =====
function GroupSortEditor({
  groups,
  setGroups,
}: {
  groups: Array<{ name: string; items: string[] }>;
  setGroups: (g: Array<{ name: string; items: string[] }>) => void;
}) {
  return (
    <Card variant="flat" padding="md" className="space-y-4">
      <h3 className="font-headline font-semibold text-on-surface">Groups & Items</h3>
      <p className="text-sm text-on-surface-variant font-body">Create 2-4 groups, then add items that belong in each group</p>
      <div className="space-y-6">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-2 pb-4 border-b border-surface-high last:border-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Group ${gi + 1} name (e.g., Fruits)`}
                value={group.name}
                onChange={(e) => {
                  const updated = [...groups];
                  updated[gi] = { ...group, name: e.target.value };
                  setGroups(updated);
                }}
                icon="category"
              />
              {groups.length > 2 && (
                <button onClick={() => setGroups(groups.filter((_, idx) => idx !== gi))} className="text-error">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
            <div className="pl-6 space-y-2">
              {group.items.map((item, ii) => (
                <div key={ii} className="flex gap-2 items-center">
                  <Input
                    placeholder={`Item ${ii + 1}`}
                    value={item}
                    onChange={(e) => {
                      const updated = [...groups];
                      const items = [...group.items];
                      items[ii] = e.target.value;
                      updated[gi] = { ...group, items };
                      setGroups(updated);
                    }}
                  />
                  {group.items.length > 1 && (
                    <button
                      onClick={() => {
                        const updated = [...groups];
                        updated[gi] = { ...group, items: group.items.filter((_, idx) => idx !== ii) };
                        setGroups(updated);
                      }}
                      className="text-error"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                icon="add"
                onClick={() => {
                  const updated = [...groups];
                  updated[gi] = { ...group, items: [...group.items, ""] };
                  setGroups(updated);
                }}
              >
                Add Item
              </Button>
            </div>
          </div>
        ))}
      </div>
      {groups.length < 4 && (
        <Button
          variant="ghost"
          size="sm"
          icon="add"
          onClick={() => setGroups([...groups, { name: "", items: ["", ""] }])}
        >
          Add Group
        </Button>
      )}
    </Card>
  );
}
