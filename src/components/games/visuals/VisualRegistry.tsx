"use client";

import type { QuestionVisual } from "@/lib/game-engine/types";
import { ShapeFractionVisual } from "./ShapeFractionVisual";
import { ShapeOptionGridVisual } from "./ShapeOptionGridVisual";
import { CountedObjectsVisual } from "./CountedObjectsVisual";
import { MagnetObjectVisual } from "./MagnetObjectVisual";
import { PhonicsWordVisual } from "./PhonicsWordVisual";

/**
 * Dispatches on `question.visual.kind` and renders the matching
 * primitive. Used by `Quiz.tsx` to render per-question visuals above
 * the question text.
 *
 * Keeping all visual primitives behind this registry means the
 * seed script just writes a plain JSON `visual` object into the
 * question, and the renderer picks the right component at runtime.
 */

interface Props {
  visual: QuestionVisual;
}

export function VisualRegistry({ visual }: Props) {
  switch (visual.kind) {
    case "shape-fraction":
      return (
        <ShapeFractionVisual
          shape={visual.shape}
          pattern={visual.pattern}
          highlight={visual.highlight}
        />
      );
    case "shape-option-grid":
      return (
        <ShapeOptionGridVisual shape={visual.shape} patterns={visual.patterns} />
      );
    case "counted-objects":
      return (
        <CountedObjectsVisual
          object={visual.object}
          count={visual.count}
          divider={visual.divider}
        />
      );
    case "magnet-object":
      return <MagnetObjectVisual object={visual.object} />;
    case "phonics-word":
      return (
        <PhonicsWordVisual word={visual.word} illustration={visual.illustration} />
      );
  }
}
