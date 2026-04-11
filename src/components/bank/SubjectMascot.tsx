"use client";

import type { SubjectKey } from "@/lib/bank/imagery";

/**
 * Inline SVG character mascots for each Activity Bank subject.
 *
 * Why inline SVG instead of the old Stitch-extracted PNGs:
 *  - We need the mascot to "pop out" above the card on hover (Framer
 *    Motion translates it up, parent card has overflow-visible). PNGs
 *    with baked-in shadows or gradients didn't sell the effect.
 *  - SVG scales perfectly, stays crisp at any density, weighs ~1 KB
 *    each, and the `currentColor` + `accent` CSS variable lets us
 *    theme them against the subject gradient without extra files.
 *  - Pure React output — no new runtime dep, no image loader, no CLS.
 *
 * Each mascot is drawn on a 180 x 180 canvas, anchored so that the
 * head/top is near y=0 (so when the parent translates it negative Y,
 * the head pokes above the card cleanly). Shadows are drawn as a
 * separate ellipse at the bottom so we can keep them inside the
 * gradient hero stage while the character pops above it.
 */

interface SubjectMascotProps {
  subject: SubjectKey;
  className?: string;
}

export function SubjectMascot({ subject, className }: SubjectMascotProps) {
  const Mascot = MASCOTS[subject] ?? MASCOTS.maths;
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ground shadow — stays at the bottom of the hero stage. */}
      <ellipse cx="90" cy="168" rx="46" ry="6" fill="rgba(0,0,0,0.18)" />
      <Mascot />
    </svg>
  );
}

// ============================================================
// Individual mascots. Each is a simple functional component
// returning SVG children (not the <svg> wrapper). The parent
// SubjectMascot handles sizing + the shared ground shadow.
// ============================================================

function MathsMascot() {
  // Smiling number "7" juggling counting blocks + sparkles.
  return (
    <g>
      {/* back sparkle */}
      <g transform="translate(20 36)">
        <path
          d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
          fill="#FFF176"
        />
      </g>
      <g transform="translate(146 20)">
        <path
          d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </g>

      {/* counting block (left, tossed) */}
      <g transform="translate(14 82) rotate(-14)">
        <rect width="26" height="26" rx="6" fill="#FF7043" />
        <rect x="3" y="3" width="20" height="20" rx="4" fill="#FF8A65" />
        <circle cx="9" cy="13" r="2" fill="#fff" />
        <circle cx="17" cy="13" r="2" fill="#fff" />
      </g>
      {/* counting block (right, tossed) */}
      <g transform="translate(140 90) rotate(12)">
        <rect width="26" height="26" rx="6" fill="#66BB6A" />
        <rect x="3" y="3" width="20" height="20" rx="4" fill="#81C784" />
        <circle cx="9" cy="13" r="2" fill="#fff" />
        <circle cx="17" cy="13" r="2" fill="#fff" />
      </g>

      {/* Big blue number 7 body */}
      <path
        d="M44 30 L134 30 L134 54 L102 156 L66 156 L100 56 L44 56 Z"
        fill="#0b4d82"
      />
      <path
        d="M50 36 L128 36 L128 48 L96 152 L72 152 L104 50 L50 50 Z"
        fill="#2e97e6"
      />

      {/* Face on the 7's vertical stroke */}
      <ellipse cx="89" cy="108" rx="18" ry="14" fill="#ffffff" />
      <circle cx="82" cy="105" r="3" fill="#1a1c1e" />
      <circle cx="96" cy="105" r="3" fill="#1a1c1e" />
      <circle cx="81" cy="104" r="1" fill="#fff" />
      <circle cx="95" cy="104" r="1" fill="#fff" />
      {/* smile */}
      <path
        d="M80 112 Q89 120 98 112"
        stroke="#1a1c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* cheek blush */}
      <circle cx="77" cy="112" r="2" fill="#FF8A80" fillOpacity="0.7" />
      <circle cx="101" cy="112" r="2" fill="#FF8A80" fillOpacity="0.7" />
    </g>
  );
}

function PhonicsMascot() {
  // Cheerful golden open book with floating letters A B C.
  return (
    <g>
      {/* Floating letters above */}
      <g transform="translate(28 12)">
        <rect width="26" height="28" rx="6" fill="#ffffff" />
        <text
          x="13"
          y="22"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="18"
          fill="#7c5800"
        >
          A
        </text>
      </g>
      <g transform="translate(78 2)">
        <rect width="26" height="28" rx="6" fill="#ffffff" />
        <text
          x="13"
          y="22"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="18"
          fill="#d50000"
        >
          B
        </text>
      </g>
      <g transform="translate(126 14)">
        <rect width="26" height="28" rx="6" fill="#ffffff" />
        <text
          x="13"
          y="22"
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="18"
          fill="#006a61"
        >
          C
        </text>
      </g>

      {/* Book base */}
      <path
        d="M20 70 Q90 54 160 70 L160 158 Q90 142 20 158 Z"
        fill="#c28800"
      />
      <path
        d="M22 74 Q90 58 158 74 L158 152 Q90 136 22 152 Z"
        fill="#feb700"
      />
      {/* Page split */}
      <path
        d="M90 62 L90 148"
        stroke="#c28800"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Page lines */}
      <path
        d="M32 92 L80 84 M32 106 L80 98 M32 120 L80 112"
        stroke="#ffffff"
        strokeOpacity="0.8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M100 84 L148 92 M100 98 L148 106 M100 112 L148 120"
        stroke="#ffffff"
        strokeOpacity="0.8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Face on the book's spine area */}
      <circle cx="72" cy="80" r="3" fill="#1a1c1e" />
      <circle cx="108" cy="80" r="3" fill="#1a1c1e" />
      <path
        d="M78 90 Q90 100 102 90"
        stroke="#1a1c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function ScienceMascot() {
  // Smiling green sprout in a terracotta pot with sunglasses + bee.
  return (
    <g>
      {/* Bee buddy top-right */}
      <g transform="translate(138 24)">
        <ellipse cx="14" cy="12" rx="14" ry="10" fill="#FDD835" />
        <rect x="8" y="4" width="4" height="16" fill="#1a1c1e" />
        <rect x="16" y="4" width="4" height="16" fill="#1a1c1e" />
        <ellipse cx="10" cy="6" rx="7" ry="4" fill="#ffffff" fillOpacity="0.85" />
        <ellipse cx="18" cy="6" rx="7" ry="4" fill="#ffffff" fillOpacity="0.85" />
        <circle cx="6" cy="12" r="1.6" fill="#1a1c1e" />
      </g>

      {/* Leaves (back) */}
      <path
        d="M90 36 Q60 40 58 74 Q78 74 90 54 Z"
        fill="#2e7d32"
      />
      <path
        d="M90 36 Q120 40 122 74 Q102 74 90 54 Z"
        fill="#2e7d32"
      />
      {/* Leaves (front, lighter) */}
      <path
        d="M90 42 Q68 46 66 78 Q82 78 90 58 Z"
        fill="#66bb6a"
      />
      <path
        d="M90 42 Q112 46 114 78 Q98 78 90 58 Z"
        fill="#66bb6a"
      />

      {/* Stem face */}
      <rect x="78" y="62" width="24" height="44" rx="12" fill="#81c784" />
      {/* Sunglasses */}
      <rect x="74" y="72" width="32" height="10" rx="4" fill="#1a1c1e" />
      <circle cx="82" cy="77" r="4" fill="#1a1c1e" />
      <circle cx="98" cy="77" r="4" fill="#1a1c1e" />
      <circle cx="81" cy="76" r="1.2" fill="#ffffff" />
      <circle cx="97" cy="76" r="1.2" fill="#ffffff" />
      {/* smile */}
      <path
        d="M82 92 Q90 100 98 92"
        stroke="#1a1c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Terracotta pot */}
      <path
        d="M50 108 L130 108 L122 158 L58 158 Z"
        fill="#bf4f2d"
      />
      <rect x="46" y="104" width="88" height="12" rx="3" fill="#e06a47" />
      {/* pot highlight */}
      <path
        d="M60 118 L58 150"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  );
}

function GeographyMascot() {
  // Bouncy globe character with red airplane orbiting.
  return (
    <g>
      {/* Airplane orbit dots */}
      <circle cx="30" cy="40" r="2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="152" cy="54" r="2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="20" cy="108" r="2" fill="#ffffff" fillOpacity="0.7" />

      {/* Airplane */}
      <g transform="translate(128 10) rotate(20)">
        <path
          d="M0 8 L28 4 L34 0 L40 4 L44 6 L44 12 L34 12 L24 18 L18 14 L14 18 L8 14 L0 12 Z"
          fill="#e53935"
        />
        <rect x="20" y="5" width="6" height="4" fill="#ffffff" />
        <rect x="28" y="5" width="4" height="4" fill="#ffffff" />
      </g>

      {/* Globe body */}
      <circle cx="90" cy="98" r="58" fill="#1976d2" />
      <circle cx="90" cy="98" r="58" fill="url(#globeShine)" />
      {/* Continents (abstract blobs) */}
      <path
        d="M54 76 Q64 66 78 72 Q82 82 72 92 Q62 92 54 88 Z"
        fill="#43a047"
      />
      <path
        d="M98 68 Q118 72 120 92 Q112 100 100 92 Q96 82 98 68 Z"
        fill="#43a047"
      />
      <path
        d="M68 110 Q82 108 92 118 Q88 134 72 132 Q60 124 68 110 Z"
        fill="#43a047"
      />
      <path
        d="M112 116 Q126 118 128 130 Q120 138 110 132 Z"
        fill="#43a047"
      />
      {/* Meridian lines */}
      <ellipse
        cx="90"
        cy="98"
        rx="58"
        ry="18"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <ellipse
        cx="90"
        cy="98"
        rx="22"
        ry="58"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />

      {/* Face */}
      <circle cx="78" cy="94" r="3" fill="#1a1c1e" />
      <circle cx="102" cy="94" r="3" fill="#1a1c1e" />
      <circle cx="77" cy="93" r="1" fill="#ffffff" />
      <circle cx="101" cy="93" r="1" fill="#ffffff" />
      <path
        d="M78 104 Q90 114 102 104"
        stroke="#1a1c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <radialGradient id="globeShine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}

function HistoryMascot() {
  // Purple castle with a grinning face + floating golden crown.
  return (
    <g>
      {/* Floating crown */}
      <g transform="translate(64 6)">
        <path
          d="M2 22 L0 4 L14 16 L26 2 L38 16 L52 4 L50 22 Z"
          fill="#feb700"
        />
        <rect x="4" y="22" width="46" height="6" rx="1" fill="#feb700" />
        <circle cx="8" cy="10" r="3" fill="#e53935" />
        <circle cx="26" cy="8" r="3" fill="#43a047" />
        <circle cx="44" cy="10" r="3" fill="#1976d2" />
      </g>

      {/* Back towers */}
      <rect x="34" y="56" width="26" height="96" fill="#4527a0" />
      <rect x="120" y="56" width="26" height="96" fill="#4527a0" />
      {/* Battlements */}
      <path
        d="M34 56 L34 46 L40 46 L40 52 L46 52 L46 46 L52 46 L52 52 L58 52 L58 46 L60 46 L60 56 Z"
        fill="#4527a0"
      />
      <path
        d="M120 56 L120 46 L126 46 L126 52 L132 52 L132 46 L138 46 L138 52 L144 52 L144 46 L146 46 L146 56 Z"
        fill="#4527a0"
      />

      {/* Main body */}
      <rect x="50" y="74" width="80" height="78" fill="#6200ea" />
      {/* Central tower */}
      <rect x="72" y="46" width="36" height="36" fill="#7c4dff" />
      <path
        d="M72 46 L72 36 L78 36 L78 42 L84 42 L84 36 L96 36 L96 42 L102 42 L102 36 L108 36 L108 46 Z"
        fill="#7c4dff"
      />
      {/* Flag */}
      <rect x="88" y="22" width="2" height="16" fill="#1a1c1e" />
      <path d="M90 22 L104 26 L90 30 Z" fill="#e040fb" />

      {/* Face on main wall */}
      <circle cx="78" cy="96" r="3" fill="#1a1c1e" />
      <circle cx="102" cy="96" r="3" fill="#1a1c1e" />
      <path
        d="M76 108 Q90 120 104 108"
        stroke="#1a1c1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="72" cy="108" r="2" fill="#FF8A80" fillOpacity="0.6" />
      <circle cx="108" cy="108" r="2" fill="#FF8A80" fillOpacity="0.6" />

      {/* Door arch */}
      <path
        d="M78 130 Q78 124 90 124 Q102 124 102 130 L102 152 L78 152 Z"
        fill="#4527a0"
      />
      <circle cx="96" cy="138" r="1.5" fill="#feb700" />
    </g>
  );
}

function PsheMascot() {
  // Two friendly hands holding a glowing red heart with rainbow.
  return (
    <g>
      {/* Rainbow arc behind */}
      <path
        d="M18 90 Q90 10 162 90"
        stroke="#e53935"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M26 94 Q90 22 154 94"
        stroke="#fb8c00"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M34 98 Q90 34 146 98"
        stroke="#fdd835"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M42 102 Q90 46 138 102"
        stroke="#43a047"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 106 Q90 58 130 106"
        stroke="#1e88e5"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left hand */}
      <g transform="translate(24 92)">
        <rect x="0" y="10" width="30" height="38" rx="10" fill="#f4a988" />
        <rect x="4" y="0" width="6" height="16" rx="3" fill="#f4a988" />
        <rect x="12" y="-4" width="6" height="20" rx="3" fill="#f4a988" />
        <rect x="20" y="-2" width="6" height="18" rx="3" fill="#f4a988" />
        <rect x="-4" y="18" width="10" height="20" rx="5" fill="#f4a988" />
      </g>
      {/* Right hand (mirrored) */}
      <g transform="translate(126 92) scale(-1 1)">
        <rect x="0" y="10" width="30" height="38" rx="10" fill="#f4a988" />
        <rect x="4" y="0" width="6" height="16" rx="3" fill="#f4a988" />
        <rect x="12" y="-4" width="6" height="20" rx="3" fill="#f4a988" />
        <rect x="20" y="-2" width="6" height="18" rx="3" fill="#f4a988" />
        <rect x="-4" y="18" width="10" height="20" rx="5" fill="#f4a988" />
      </g>

      {/* Heart with face */}
      <g transform="translate(54 74)">
        <path
          d="M36 8 C28 -6 0 -2 0 22 C0 44 36 60 36 60 C36 60 72 44 72 22 C72 -2 44 -6 36 8 Z"
          fill="#e53935"
        />
        <path
          d="M36 12 C30 4 8 4 8 22 C8 40 36 54 36 54 C36 54 64 40 64 22 C64 4 42 4 36 12 Z"
          fill="#ff5252"
        />
        <circle cx="26" cy="22" r="3" fill="#1a1c1e" />
        <circle cx="46" cy="22" r="3" fill="#1a1c1e" />
        <circle cx="25" cy="21" r="1" fill="#ffffff" />
        <circle cx="45" cy="21" r="1" fill="#ffffff" />
        <path
          d="M26 30 Q36 38 46 30"
          stroke="#1a1c1e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </g>
  );
}

const MASCOTS: Record<SubjectKey, () => React.ReactElement> = {
  maths: MathsMascot,
  phonics: PhonicsMascot,
  science: ScienceMascot,
  geography: GeographyMascot,
  history: HistoryMascot,
  pshe: PsheMascot,
};
