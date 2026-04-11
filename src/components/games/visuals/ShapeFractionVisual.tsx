"use client";

import { motion } from "framer-motion";

/**
 * Draws a single shape (circle, square, rectangle, pizza, chocolate bar)
 * with a specific cut pattern. Used as a CONTEXT visual above a text
 * question — the shape is decorative/representative; the correct
 * answer lives in the quiz text options.
 *
 * All shapes are drawn in a 200×200 viewBox centred at (100,100) so
 * they render at the same optical size regardless of the underlying
 * primitive.
 *
 * Idle animation: a gentle breathing scale + soft rotation so the
 * card feels alive without distracting from the question.
 */

type Shape = "circle" | "square" | "rectangle" | "pizza" | "chocolate";
type Pattern =
  | "whole"
  | "half-v"
  | "half-h"
  | "half-diag"
  | "quarter"
  | "uneven-2"
  | "thirds";

interface Props {
  shape: Shape;
  pattern: Pattern;
  /** Highlight colour for the "shaded" piece. */
  highlight?: string;
  /** When true, this visual is one cell of a 2x2 option grid — skip
   *  idle animation to keep the grid calm. */
  compact?: boolean;
  /** Width/height (px). Defaults to 200. */
  size?: number;
}

export function ShapeFractionVisual({
  shape,
  pattern,
  highlight = "#FEB700",
  compact = false,
  size = 200,
}: Props) {
  const body = renderShape(shape, pattern, highlight);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      animate={
        compact
          ? { scale: 1 }
          : { scale: [1, 1.04, 1], rotate: [-1, 1, -1] }
      }
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.12))" }}
    >
      {body}
    </motion.svg>
  );
}

// ============================================================
// Shape drawing helpers
// ============================================================

function renderShape(shape: Shape, pattern: Pattern, highlight: string) {
  switch (shape) {
    case "circle":
      return <CircleShape pattern={pattern} highlight={highlight} />;
    case "square":
      return <SquareShape pattern={pattern} highlight={highlight} />;
    case "rectangle":
      return <RectangleShape pattern={pattern} highlight={highlight} />;
    case "pizza":
      return <PizzaShape pattern={pattern} highlight={highlight} />;
    case "chocolate":
      return <ChocolateBarShape pattern={pattern} highlight={highlight} />;
  }
}

function CircleShape({ pattern, highlight }: { pattern: Pattern; highlight: string }) {
  const base = "#2E97E6";
  const stroke = "#0b4d82";
  const cx = 100;
  const cy = 100;
  const r = 78;

  if (pattern === "whole") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-v") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
          fill={highlight}
        />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-h") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
          fill={highlight}
        />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-diag") {
    // Diagonal half (top-right)
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx - r * 0.707} ${cy - r * 0.707} A ${r} ${r} 0 0 1 ${cx + r * 0.707} ${cy + r * 0.707} L ${cx - r * 0.707} ${cy + r * 0.707} Z`}
          fill={highlight}
          opacity="0.9"
        />
        <line
          x1={cx - r * 0.707}
          y1={cy - r * 0.707}
          x2={cx + r * 0.707}
          y2={cy + r * 0.707}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  if (pattern === "quarter") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
          fill={highlight}
        />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={stroke} strokeWidth="4" />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "uneven-2") {
    // Roughly 1/3 on top
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx - r * 0.94} ${cy - r * 0.34} A ${r} ${r} 0 0 1 ${cx + r * 0.94} ${cy - r * 0.34} L ${cx + r * 0.94} ${cy - r * 0.34} Z`}
          fill={highlight}
        />
        <line
          x1={cx - r * 0.94}
          y1={cy - r * 0.34}
          x2={cx + r * 0.94}
          y2={cy - r * 0.34}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  if (pattern === "thirds") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={base} stroke={stroke} strokeWidth="4" />
        <path
          d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * 0.866} ${cy + r * 0.5} Z`}
          fill={highlight}
        />
        <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke={stroke} strokeWidth="4" />
        <line
          x1={cx}
          y1={cy}
          x2={cx + r * 0.866}
          y2={cy + r * 0.5}
          stroke={stroke}
          strokeWidth="4"
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx - r * 0.866}
          y2={cy + r * 0.5}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={r} fill={base} />;
}

function SquareShape({ pattern, highlight }: { pattern: Pattern; highlight: string }) {
  const base = "#00A396";
  const stroke = "#004D47";
  const x = 24;
  const y = 24;
  const w = 152;
  const h = 152;
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (pattern === "whole") {
    return <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />;
  }
  if (pattern === "half-v") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <rect x={x} y={y} width={w / 2} height={h} fill={highlight} />
        <line x1={cx} y1={y} x2={cx} y2={y + h} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-h") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <rect x={x} y={y} width={w} height={h / 2} fill={highlight} />
        <line x1={x} y1={cy} x2={x + w} y2={cy} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-diag") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} Z`} fill={highlight} />
        <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "quarter") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <rect x={x} y={y} width={w / 2} height={h / 2} fill={highlight} />
        <line x1={cx} y1={y} x2={cx} y2={y + h} stroke={stroke} strokeWidth="4" />
        <line x1={x} y1={cy} x2={x + w} y2={cy} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "uneven-2") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <rect x={x} y={y} width={w * 0.35} height={h} fill={highlight} />
        <line
          x1={x + w * 0.35}
          y1={y}
          x2={x + w * 0.35}
          y2={y + h}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  if (pattern === "thirds") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="8" />
        <rect x={x} y={y} width={w / 3} height={h} fill={highlight} />
        <line x1={x + w / 3} y1={y} x2={x + w / 3} y2={y + h} stroke={stroke} strokeWidth="4" />
        <line
          x1={x + (2 * w) / 3}
          y1={y}
          x2={x + (2 * w) / 3}
          y2={y + h}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  return <rect x={x} y={y} width={w} height={h} fill={base} rx="8" />;
}

function RectangleShape({ pattern, highlight }: { pattern: Pattern; highlight: string }) {
  const base = "#FF7043";
  const stroke = "#BF360C";
  const x = 12;
  const y = 58;
  const w = 176;
  const h = 84;
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (pattern === "whole") {
    return <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />;
  }
  if (pattern === "half-v") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <rect x={x} y={y} width={w / 2} height={h} fill={highlight} />
        <line x1={cx} y1={y} x2={cx} y2={y + h} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-h") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <rect x={x} y={y} width={w} height={h / 2} fill={highlight} />
        <line x1={x} y1={cy} x2={x + w} y2={cy} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "half-diag") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} Z`} fill={highlight} />
        <line x1={x} y1={y} x2={x + w} y2={y + h} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "quarter") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <rect x={x} y={y} width={w / 2} height={h / 2} fill={highlight} />
        <line x1={cx} y1={y} x2={cx} y2={y + h} stroke={stroke} strokeWidth="4" />
        <line x1={x} y1={cy} x2={x + w} y2={cy} stroke={stroke} strokeWidth="4" />
      </g>
    );
  }
  if (pattern === "uneven-2") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <rect x={x} y={y} width={w * 0.3} height={h} fill={highlight} />
        <line
          x1={x + w * 0.3}
          y1={y}
          x2={x + w * 0.3}
          y2={y + h}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  if (pattern === "thirds") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="10" />
        <rect x={x} y={y} width={w / 3} height={h} fill={highlight} />
        <line x1={x + w / 3} y1={y} x2={x + w / 3} y2={y + h} stroke={stroke} strokeWidth="4" />
        <line
          x1={x + (2 * w) / 3}
          y1={y}
          x2={x + (2 * w) / 3}
          y2={y + h}
          stroke={stroke}
          strokeWidth="4"
        />
      </g>
    );
  }
  return <rect x={x} y={y} width={w} height={h} fill={base} rx="10" />;
}

function PizzaShape({ pattern, highlight }: { pattern: Pattern; highlight: string }) {
  const base = "#FDD835";
  const crust = "#8D6E63";
  const topping = "#E53935";
  const cx = 100;
  const cy = 100;
  const r = 78;

  const Base = () => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={crust} />
      <circle cx={cx} cy={cy} r={r - 6} fill={base} />
      {/* Pepperoni */}
      {[
        [80, 80],
        [120, 82],
        [78, 118],
        [122, 120],
        [100, 100],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={topping} />
      ))}
    </g>
  );

  if (pattern === "whole") return <Base />;

  const overlay = (pattern: Pattern) => {
    if (pattern === "half-v") {
      return (
        <path
          d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
          fill={highlight}
          fillOpacity="0.55"
        />
      );
    }
    if (pattern === "half-h") {
      return (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
          fill={highlight}
          fillOpacity="0.55"
        />
      );
    }
    if (pattern === "quarter") {
      return (
        <path
          d={`M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
          fill={highlight}
          fillOpacity="0.55"
        />
      );
    }
    if (pattern === "uneven-2") {
      return (
        <path
          d={`M ${cx - r * 0.94} ${cy - r * 0.34} A ${r} ${r} 0 0 1 ${cx + r * 0.94} ${cy - r * 0.34} Z`}
          fill={highlight}
          fillOpacity="0.55"
        />
      );
    }
    if (pattern === "thirds") {
      return (
        <path
          d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * 0.866} ${cy + r * 0.5} Z`}
          fill={highlight}
          fillOpacity="0.55"
        />
      );
    }
    return null;
  };

  const lines = (pattern: Pattern) => {
    if (pattern === "half-v") {
      return <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={crust} strokeWidth="4" />;
    }
    if (pattern === "half-h") {
      return <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={crust} strokeWidth="4" />;
    }
    if (pattern === "quarter") {
      return (
        <g>
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={crust} strokeWidth="4" />
          <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={crust} strokeWidth="4" />
        </g>
      );
    }
    if (pattern === "uneven-2") {
      return (
        <line
          x1={cx - r * 0.94}
          y1={cy - r * 0.34}
          x2={cx + r * 0.94}
          y2={cy - r * 0.34}
          stroke={crust}
          strokeWidth="4"
        />
      );
    }
    if (pattern === "thirds") {
      return (
        <g>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke={crust} strokeWidth="4" />
          <line
            x1={cx}
            y1={cy}
            x2={cx + r * 0.866}
            y2={cy + r * 0.5}
            stroke={crust}
            strokeWidth="4"
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx - r * 0.866}
            y2={cy + r * 0.5}
            stroke={crust}
            strokeWidth="4"
          />
        </g>
      );
    }
    return null;
  };

  return (
    <g>
      <Base />
      {overlay(pattern)}
      {lines(pattern)}
    </g>
  );
}

function ChocolateBarShape({ pattern, highlight }: { pattern: Pattern; highlight: string }) {
  const base = "#6D4C41";
  const stroke = "#3E2723";
  const x = 16;
  const y = 50;
  const w = 168;
  const h = 100;

  // Draw the 2x4 grid of chocolate squares (8 pieces)
  const cellW = w / 4;
  const cellH = h / 2;

  const Base = () => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={base} stroke={stroke} strokeWidth="4" rx="6" />
      {Array.from({ length: 4 }, (_, i) =>
        Array.from({ length: 2 }, (_, j) => (
          <rect
            key={`${i}-${j}`}
            x={x + i * cellW + 3}
            y={y + j * cellH + 3}
            width={cellW - 6}
            height={cellH - 6}
            fill="#795548"
            rx="3"
          />
        ))
      )}
    </g>
  );

  const highlightCells = (indices: Array<[number, number]>) => (
    <g fill={highlight} fillOpacity="0.72">
      {indices.map(([i, j]) => (
        <rect
          key={`h-${i}-${j}`}
          x={x + i * cellW + 3}
          y={y + j * cellH + 3}
          width={cellW - 6}
          height={cellH - 6}
          rx="3"
        />
      ))}
    </g>
  );

  if (pattern === "whole") return <Base />;
  if (pattern === "half-v") {
    return (
      <g>
        <Base />
        {highlightCells([
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ])}
      </g>
    );
  }
  if (pattern === "half-h") {
    return (
      <g>
        <Base />
        {highlightCells([
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
        ])}
      </g>
    );
  }
  if (pattern === "quarter") {
    return (
      <g>
        <Base />
        {highlightCells([
          [0, 0],
          [1, 0],
        ])}
      </g>
    );
  }
  if (pattern === "uneven-2") {
    return (
      <g>
        <Base />
        {highlightCells([[0, 0]])}
      </g>
    );
  }
  if (pattern === "thirds") {
    return (
      <g>
        <Base />
        {highlightCells([
          [0, 0],
          [0, 1],
          [1, 0],
        ])}
      </g>
    );
  }
  return <Base />;
}
