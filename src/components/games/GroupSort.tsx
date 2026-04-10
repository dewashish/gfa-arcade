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
        onAnswer(sortedCount, true, Date.now() - startTime);

        if (sortedCount + 1 === totalItems) {
          fireworks();
          play("confetti");
        }
      } else {
        setWrongItem(itemName);
        play("wrong");
        onAnswer(sortedCount, false, Date.now() - startTime);
        setTimeout(() => setWrongItem(null), 800);
      }
    },
    [allItems, sortedCount, totalItems, onAnswer, play, fireworks, startTime]
  );

  const allSorted = sortedCount === totalItems;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="font-headline text-3xl md:text-4xl font-black text-primary origin-left"
          >
            Sort into groups!
          </motion.h2>
          <span className="text-on-surface-variant font-body font-bold text-lg">
            {sortedCount} / {totalItems}
          </span>
        </div>

        {/* Group buckets */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${config.groups.length}, 1fr)` }}>
          {config.groups.map((group) => (
            <GroupBucket
              key={group.name}
              name={group.name}
              sortedItems={Object.entries(sorted)
                .filter(([, g]) => g === group.name)
                .map(([item]) => item)}
            />
          ))}
        </div>

        {/* Unsorted items pool */}
        {!allSorted && (
          <div className="bg-surface-low rounded-2xl p-4">
            <p className="text-sm text-on-surface-variant font-body mb-3 font-medium">
              Drag each item to its correct group:
            </p>
            <div className="flex flex-wrap gap-3">
              {allItems
                .filter((i) => !sorted[i.item])
                .map((item) => (
                  <DraggableItem
                    key={item.item}
                    name={item.item}
                    isWrong={wrongItem === item.item}
                  />
                ))}
            </div>
          </div>
        )}

        {allSorted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center mt-4"
          >
            <p className="font-headline text-3xl font-bold text-tertiary">
              All Sorted! Amazing! 🎉
            </p>
          </motion.div>
        )}
      </div>
    </DndContext>
  );
}

function DraggableItem({ name, isWrong }: { name: string; isWrong: boolean }) {
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
      className={`
        px-4 py-3 rounded-xl font-body text-base
        cursor-grab active:cursor-grabbing select-none touch-manipulation
        transition-all
        ${isDragging
          ? "bg-primary-container text-on-primary-container shadow-lg scale-110 z-50"
          : isWrong
            ? "bg-error-container text-on-error-container"
            : "bg-surface-lowest text-on-surface ambient-shadow"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg opacity-50">drag_indicator</span>
        {name}
      </div>
    </motion.div>
  );
}

function GroupBucket({ name, sortedItems }: { name: string; sortedItems: string[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: name });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl p-4 min-h-[160px] transition-all
        ${isOver
          ? "bg-primary-container/15 ring-2 ring-primary-container scale-[1.02]"
          : "bg-surface-container border-2 border-dashed border-outline-variant"
        }
      `}
    >
      <h3 className="font-headline font-semibold text-on-surface text-center mb-3">
        {name}
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {sortedItems.map((item) => (
            <motion.div
              key={item}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="px-3 py-2 rounded-lg bg-tertiary-container/20 text-tertiary text-sm font-body flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
