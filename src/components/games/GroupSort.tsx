"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSound } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import type { GroupSortConfig } from "@/lib/game-engine/types";

interface GroupSortProps {
  config: GroupSortConfig;
  onAnswer: (itemIndex: number, correct: boolean, timeTakenMs: number) => void;
}

/**
 * GroupSort — Phase 2 enrichment.
 *
 * Changes vs. the original:
 *  - Renders optional `group.emoji` as the bucket icon and looks up
 *    `itemIcons[itemText]` for each draggable item so Year 1 readers
 *    have visual anchors.
 *  - Buckets get a dramatic glow when a draggable is over them.
 *  - Sorted items bounce in with a bigger spring + rotate.
 *  - Responsive grid: group buckets auto-fit instead of hard-coding
 *    `repeat(N, 1fr)` — prevents overflow on phones with 4+ groups.
 *  - Progress bar visualises completion alongside the counter.
 *  - Completion banner gets the same big celebration treatment as
 *    MatchUp + FlashCards.
 */
export function GroupSort({ config, onAnswer }: GroupSortProps) {
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const [wrongItem, setWrongItem] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const { play } = useSound();
  const { burst, fireworks } = useConfetti();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  // Build flat list of all items with their correct group
  const [allItems] = useState(() => {
    const items: Array<{ item: string; group: string }> = [];
    config.groups.forEach((g) => {
      g.items.forEach((item) => items.push({ item, group: g.name }));
    });
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });

  const totalItems = allItems.length;
  const sortedCount = Object.keys(sorted).length;
  const itemIcons = config.itemIcons ?? {};

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const itemName = active.id as string;
      const groupName = over.id as string;

      const itemData = allItems.find((i) => i.item === itemName);
      if (!itemData) return;

      const isCorrect = itemData.group === groupName;

      if (isCorrect) {
        setSorted((prev) => ({ ...prev, [itemName]: groupName }));
        play("correct");
        play("ding");
        onAnswer(sortedCount, true, Date.now() - startTime);

        if (sortedCount + 1 === totalItems) {
          fireworks();
          burst();
          play("confetti");
          play("tada");
        }
      } else {
        setWrongItem(itemName);
        play("wrong");
        onAnswer(sortedCount, false, Date.now() - startTime);
        setTimeout(() => setWrongItem(null), 800);
      }
    },
    [allItems, sortedCount, totalItems, onAnswer, play, fireworks, burst, startTime]
  );

  const allSorted = sortedCount === totalItems;
  const progressPct = totalItems > 0 ? (sortedCount / totalItems) * 100 : 0;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header + progress bar */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-3">
            <motion.h2
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="font-headline text-2xl md:text-4xl font-black text-primary origin-left"
            >
              Sort into groups!
            </motion.h2>
            <span className="font-headline font-black text-lg md:text-xl text-on-surface shrink-0">
              {sortedCount} / {totalItems}
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-tertiary-container"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
            />
          </div>
        </div>

        {/* Group buckets — auto-fit so they reflow on narrow viewports */}
        <div
          className="grid gap-4 mb-6"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
          }}
        >
          {config.groups.map((group) => (
            <GroupBucket
              key={group.name}
              name={group.name}
              emoji={group.emoji}
              itemIcons={itemIcons}
              sortedItems={Object.entries(sorted)
                .filter(([, g]) => g === group.name)
                .map(([item]) => item)}
            />
          ))}
        </div>

        {/* Unsorted items pool */}
        {!allSorted && (
          <div className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-headline font-black text-on-surface-variant mb-3">
              Drag each item to its correct group:
            </p>
            <div className="flex flex-wrap gap-3">
              {allItems
                .filter((i) => !sorted[i.item])
                .map((item) => (
                  <DraggableItem
                    key={item.item}
                    name={item.item}
                    emoji={itemIcons[item.item]}
                    isWrong={wrongItem === item.item}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Completion banner */}
        <AnimatePresence>
          {allSorted && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="text-center mt-8"
            >
              <p className="font-headline text-4xl md:text-5xl font-black text-tertiary">
                🎉 All Sorted! 🎉
              </p>
              <p className="font-body text-lg text-on-surface-variant mt-2">
                Every item is where it belongs.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
}

function DraggableItem({
  name,
  emoji,
  isWrong,
}: {
  name: string;
  emoji?: string;
  isWrong: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: name,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      animate={
        isWrong
          ? { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } }
          : {}
      }
      whileHover={!isDragging ? { y: -2 } : undefined}
      className={`
        px-4 py-3 rounded-2xl font-body text-base
        cursor-grab active:cursor-grabbing select-none touch-manipulation
        transition-colors
        ${
          isDragging
            ? "bg-primary-container text-on-primary-container shadow-2xl scale-110 z-50 ring-4 ring-primary/30"
            : isWrong
              ? "bg-error-container text-on-error-container ring-4 ring-error/40"
              : "bg-surface-container-lowest text-on-surface ambient-shadow hover:shadow-lg"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg opacity-50 shrink-0">
          drag_indicator
        </span>
        {emoji && (
          <motion.span
            className="text-2xl md:text-3xl shrink-0"
            animate={isDragging ? { rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.6, repeat: isDragging ? Infinity : 0 }}
            aria-hidden="true"
          >
            {emoji}
          </motion.span>
        )}
        <span className="font-headline font-bold">{name}</span>
      </div>
    </motion.div>
  );
}

function GroupBucket({
  name,
  emoji,
  itemIcons,
  sortedItems,
}: {
  name: string;
  emoji?: string;
  itemIcons: Record<string, string>;
  sortedItems: string[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: name });

  return (
    <motion.div
      ref={setNodeRef}
      animate={
        isOver
          ? {
              scale: 1.04,
              boxShadow: "0 0 0 4px var(--primary), 0 20px 50px rgba(0,98,158,0.25)",
            }
          : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`
        rounded-[28px] p-4 md:p-5 min-h-[180px] transition-colors
        ${
          isOver
            ? "bg-primary-container/15"
            : "bg-surface-container border-2 border-dashed border-outline-variant/50"
        }
      `}
    >
      {/* Bucket header with optional emoji */}
      <div className="flex flex-col items-center gap-2 mb-3">
        {emoji && (
          <motion.span
            className="text-4xl md:text-5xl select-none"
            animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            {emoji}
          </motion.span>
        )}
        <h3 className="font-headline font-black text-on-surface text-center text-base md:text-lg">
          {name}
        </h3>
      </div>

      {/* Sorted items */}
      <div className="space-y-2">
        <AnimatePresence>
          {sortedItems.map((item) => (
            <motion.div
              key={item}
              initial={{ scale: 0, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 16 }}
              className="px-3 py-2 rounded-xl bg-tertiary-container/25 text-tertiary text-sm font-body flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm shrink-0">
                check_circle
              </span>
              {itemIcons[item] && (
                <span className="text-lg" aria-hidden="true">
                  {itemIcons[item]}
                </span>
              )}
              <span className="font-headline font-bold">{item}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
