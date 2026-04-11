"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { createGameSession } from "@/lib/game-engine/session-manager";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { GAME_TYPE_LABELS } from "@/lib/bank/types";
import { EMPTY_STATE_IMAGES } from "@/lib/bank/imagery";
import { STAGGER, SPRING } from "@/lib/design/motion";
import type { Database } from "@/lib/supabase/types";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

interface Props {
  activities: Activity[];
}

const GAME_TYPE_COLOR: Record<string, string> = {
  quiz: "#FFB800",
  "spin-wheel": "#2E97E6",
  "match-up": "#00A396",
  flashcards: "#FF8A80",
  "speaking-cards": "#E040FB",
  "group-sort": "#7C5800",
  "complete-sentence": "#00629E",
};

export function LibraryClient({ activities }: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<"recent" | "alpha">("recent");
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const arr = [...activities];
    if (sort === "alpha") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      arr.sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
          new Date(a.updated_at ?? a.created_at ?? 0).getTime()
      );
    }
    return arr;
  }, [activities, sort]);

  async function handleUse(activity: Activity) {
    setLaunchingId(activity.id);
    setLaunchError(null);
    try {
      const supabase = createClient();
      const session = await createGameSession(supabase, activity.id);
      router.push(`/session/${session.id}`);
    } catch (e) {
      setLaunchError(
        e instanceof Error ? e.message : "Couldn't start the game. Please try again."
      );
      setLaunchingId(null);
    }
  }

  // Empty state
  if (activities.length === 0) {
    const img = EMPTY_STATE_IMAGES.library;
    return (
      <div className="space-y-6">
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          My Library
        </KineticHeadline>
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <Image
            src={img.url}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className="w-48 h-48 mx-auto mb-6 object-contain drop-shadow-lg"
            priority
          />
          <p className="font-headline font-bold text-2xl text-on-surface mb-2">
            Your library is empty
          </p>
          <p className="text-on-surface-variant font-body mb-6 max-w-md mx-auto">
            Build your own activity from scratch, or browse the Activity Bank for ready-made
            content aligned to the Year 1 curriculum.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/bank"
              className="focus-ring h-12 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                backpack
              </span>
              Browse Activity Bank
            </Link>
            <Link
              href="/create"
              className="focus-ring h-12 px-6 rounded-full bg-surface-container-lowest text-primary font-headline font-bold inline-flex items-center gap-2 ambient-shadow"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                add_circle
              </span>
              Create New
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
            My <span className="text-primary-container">Library</span>
          </KineticHeadline>
          <p className="text-on-surface-variant font-body mt-2 text-lg">
            {activities.length} activit{activities.length === 1 ? "y" : "ies"} you&apos;ve built
          </p>
        </div>

        {/* Sort toggle */}
        <div
          role="radiogroup"
          aria-label="Sort order"
          className="flex bg-surface-container-low rounded-full p-1 ambient-shadow"
        >
          {[
            { key: "recent", label: "Recent" },
            { key: "alpha", label: "A–Z" },
          ].map((opt) => (
            <button
              key={opt.key}
              role="radio"
              aria-checked={sort === opt.key}
              onClick={() => setSort(opt.key as "recent" | "alpha")}
              className={`focus-ring h-10 px-5 rounded-full font-headline font-bold text-sm transition-colors ${sort === opt.key ? "bg-primary text-white" : "text-on-surface-variant hover:text-primary"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Launch error */}
      {launchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="bg-error-container text-on-error-container rounded-xl p-4 flex items-start gap-3"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            error
          </span>
          <p className="flex-1 text-sm font-body">{launchError}</p>
          <button
            onClick={() => setLaunchError(null)}
            aria-label="Dismiss"
            className="focus-ring rounded-full p-1 hover:bg-white/20"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.map((activity, idx) => {
          const gameInfo = GAME_TYPE_LABELS[activity.game_type] ?? {
            label: activity.game_type,
            emoji: "🎮",
          };
          const color = GAME_TYPE_COLOR[activity.game_type] ?? "#707882";
          const isLaunching = launchingId === activity.id;
          return (
            <motion.article
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...SPRING.bouncy,
                delay: Math.min(idx * STAGGER.fast, 0.3),
              }}
              whileHover={{ y: -6 }}
              className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden flex flex-col"
            >
              <div
                className="h-32 flex items-center justify-center text-7xl relative"
                style={{
                  background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                }}
                aria-hidden="true"
              >
                {gameInfo.emoji}
                <div
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase"
                  style={{ color }}
                >
                  {gameInfo.label}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="font-headline font-black text-lg text-on-surface line-clamp-2">
                  {activity.title}
                </h3>
                <div className="flex gap-2 mt-auto pt-3">
                  <Link
                    href={`/create/${activity.game_type}?edit=${activity.id}`}
                    className="focus-ring flex-1 h-11 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-sm inline-flex items-center justify-center transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleUse(activity)}
                    disabled={isLaunching}
                    aria-label={`Use ${activity.title} in class`}
                    className="focus-ring flex-[2] h-11 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold text-sm shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {isLaunching ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin" aria-hidden="true">
                          progress_activity
                        </span>
                        Starting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base" aria-hidden="true">
                          play_arrow
                        </span>
                        Use in class
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
