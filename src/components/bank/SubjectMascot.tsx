"use client";

import { motion, type Variants } from "framer-motion";
import type { SubjectKey } from "@/lib/bank/imagery";

/**
 * Character mascots for the Activity Bank with rich, subject-specific
 * hover animations.
 *
 * Each mascot has two states:
 *  - **idle** → subtle always-on loop (~3% motion) so the grid feels
 *    alive without stealing attention.
 *  - **hover** → full cinematic explosion unique to the subject.
 *    Triggered by the parent card passing `hover={true}`.
 *
 * The component renders its own <svg> wrapper at 180x180 and composes
 * the mascot art with decorative animation layers (sparkles, orbiting
 * airplanes, flying letters, etc.). Everything is pure motion transforms
 * so it stays GPU-accelerated even on Year 1 tablets.
 *
 * Respect `prefers-reduced-motion`: framer-motion already honours it
 * globally via ReducedMotionProvider.
 */

interface SubjectMascotProps {
  subject: SubjectKey;
  hover: boolean;
  className?: string;
}

export function SubjectMascot({ subject, hover, className }: SubjectMascotProps) {
  const Mascot = MASCOTS[subject] ?? MASCOTS.maths;
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      // Allow child animation layers to draw outside the box (sparkles
      // flying out of the frame, orbiting airplane, etc.)
      style={{ overflow: "visible" }}
    >
      <Mascot hover={hover} />
      {/* Ground shadow — stays at the bottom of the hero stage, pulses
          gently on hover to sell the "character leapt up" feeling. */}
      <motion.ellipse
        cx="90"
        cy="170"
        rx="46"
        ry="6"
        fill="rgba(0,0,0,0.22)"
        animate={hover ? { rx: 52, ry: 4, opacity: 0.35 } : { rx: 46, ry: 6, opacity: 0.22 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      />
    </svg>
  );
}

// ============================================================
// Shared variant helpers
// ============================================================

/** Hard-coded framer-motion transition presets used across mascots. */
const SPRING_BOUNCY = { type: "spring" as const, stiffness: 260, damping: 18 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 120, damping: 16 };

// ============================================================
// 1. MATHS — The smiling number 7
// ============================================================
// Idle: gentle bob
// Hover: the 7 cartwheels 360°, counting blocks arc upward and rain
// back down, sparkles burst radially, background numbers 1-2-3 rise.
// ============================================================
function MathsMascot({ hover }: { hover: boolean }) {
  // Radial sparkle positions (8 points around the 7's center at 90,108)
  const sparkles = [
    { angle: 0, color: "#FFF176" },
    { angle: 45, color: "#FFE082" },
    { angle: 90, color: "#FFFFFF" },
    { angle: 135, color: "#FFD54F" },
    { angle: 180, color: "#FFF59D" },
    { angle: 225, color: "#FFFFFF" },
    { angle: 270, color: "#FFF176" },
    { angle: 315, color: "#FFE082" },
  ];

  const backgroundNumberVariants: Variants = {
    idle: { y: 10, opacity: 0 },
    hover: (i: number) => ({
      y: [-10, -70],
      opacity: [0, 0.7, 0],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        delay: i * 0.25,
        ease: "easeOut",
      },
    }),
  };

  return (
    <g>
      {/* Background floating numbers — only visible on hover */}
      {["1", "2", "3"].map((n, i) => (
        <motion.text
          key={n}
          x={30 + i * 50}
          y={160}
          textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontWeight="900"
          fontSize="28"
          fill="#ffffff"
          fillOpacity="0.5"
          custom={i}
          variants={backgroundNumberVariants}
          animate={hover ? "hover" : "idle"}
          initial="idle"
        >
          {n}
        </motion.text>
      ))}

      {/* Counting block — left, arcs up on hover */}
      <motion.g
        animate={
          hover
            ? {
                x: [-8, -20, -12],
                y: [0, -50, 0],
                rotate: [-14, -180, -340],
              }
            : { x: 0, y: [0, -2, 0], rotate: -14 }
        }
        transition={
          hover
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "27px 95px" }}
      >
        <g transform="translate(14 82)">
          <rect width="26" height="26" rx="6" fill="#FF7043" />
          <rect x="3" y="3" width="20" height="20" rx="4" fill="#FF8A65" />
          <circle cx="9" cy="13" r="2" fill="#fff" />
          <circle cx="17" cy="13" r="2" fill="#fff" />
        </g>
      </motion.g>

      {/* Counting block — right, arcs up on hover (opposite direction) */}
      <motion.g
        animate={
          hover
            ? {
                x: [8, 22, 12],
                y: [0, -46, 0],
                rotate: [12, 200, 380],
              }
            : { x: 0, y: [0, -2, 0], rotate: 12 }
        }
        transition={
          hover
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
        }
        style={{ transformOrigin: "153px 103px" }}
      >
        <g transform="translate(140 90)">
          <rect width="26" height="26" rx="6" fill="#66BB6A" />
          <rect x="3" y="3" width="20" height="20" rx="4" fill="#81C784" />
          <circle cx="9" cy="13" r="2" fill="#fff" />
          <circle cx="17" cy="13" r="2" fill="#fff" />
        </g>
      </motion.g>

      {/* The 7 — cartwheels on hover */}
      <motion.g
        animate={
          hover
            ? { rotate: [0, 360], scale: [1, 1.08, 1] }
            : { rotate: 0, scale: 1, y: [0, -3, 0] }
        }
        transition={
          hover
            ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "89px 95px" }}
      >
        <path
          d="M44 30 L134 30 L134 54 L102 156 L66 156 L100 56 L44 56 Z"
          fill="#0b4d82"
        />
        <path
          d="M50 36 L128 36 L128 48 L96 152 L72 152 L104 50 L50 50 Z"
          fill="#2e97e6"
        />
        {/* Face */}
        <ellipse cx="89" cy="108" rx="18" ry="14" fill="#ffffff" />
        <circle cx="82" cy="105" r="3" fill="#1a1c1e" />
        <circle cx="96" cy="105" r="3" fill="#1a1c1e" />
        <circle cx="81" cy="104" r="1" fill="#fff" />
        <circle cx="95" cy="104" r="1" fill="#fff" />
        <path
          d="M80 112 Q89 120 98 112"
          stroke="#1a1c1e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="77" cy="112" r="2" fill="#FF8A80" fillOpacity="0.7" />
        <circle cx="101" cy="112" r="2" fill="#FF8A80" fillOpacity="0.7" />
      </motion.g>

      {/* Radial sparkle burst — explodes outward on hover */}
      {sparkles.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * 80;
        const dy = Math.sin(rad) * 80;
        return (
          <motion.g
            key={i}
            animate={
              hover
                ? {
                    x: [0, dx],
                    y: [0, dy],
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.2, 0.6],
                  }
                : { x: 0, y: 0, opacity: 0, scale: 0.4 }
            }
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeOut",
            }}
          >
            <g transform="translate(90 95)">
              <path
                d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"
                fill={s.color}
              />
            </g>
          </motion.g>
        );
      })}
    </g>
  );
}

// ============================================================
// 2. PHONICS — Cheerful golden open book with flying letters
// ============================================================
// Idle: book breathes (subtle scale), letters drift up slowly
// Hover: book opens wider, letters A/B/C burst upward in a wave,
// new letters drop from above, page lines flash yellow sequentially.
// ============================================================
function PhonicsMascot({ hover }: { hover: boolean }) {
  const letters = [
    { ch: "A", x: 28, fill: "#7c5800", delay: 0 },
    { ch: "B", x: 78, fill: "#d50000", delay: 0.1 },
    { ch: "C", x: 126, fill: "#006a61", delay: 0.2 },
  ];

  return (
    <g>
      {/* Flying letters */}
      {letters.map((l, i) => (
        <motion.g
          key={l.ch}
          animate={
            hover
              ? {
                  y: [0, -34, 0],
                  rotate: [0, -10, 0],
                  scale: [1, 1.15, 1],
                }
              : { y: [0, -4, 0], rotate: 0, scale: 1 }
          }
          transition={
            hover
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: l.delay,
                }
              : {
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }
          }
        >
          <g transform={`translate(${l.x} ${hover ? 0 : 12})`}>
            <rect width="26" height="28" rx="6" fill="#ffffff" />
            <text
              x="13"
              y="22"
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="900"
              fontSize="18"
              fill={l.fill}
            >
              {l.ch}
            </text>
          </g>
        </motion.g>
      ))}

      {/* Extra letters raining down on hover (D, E, F) */}
      {hover &&
        ["D", "E", "F"].map((ch, i) => (
          <motion.g
            key={`drop-${ch}`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeIn",
            }}
          >
            <g transform={`translate(${40 + i * 40} 20)`}>
              <rect width="22" height="24" rx="5" fill="#FFECB3" />
              <text
                x="11"
                y="18"
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                fontWeight="900"
                fontSize="14"
                fill="#7c5800"
              >
                {ch}
              </text>
            </g>
          </motion.g>
        ))}

      {/* Book — breathes subtly at rest, opens wider on hover */}
      <motion.g
        animate={hover ? { scaleX: 1.06, scaleY: 1.03 } : { scaleX: [1, 1.01, 1], scaleY: 1 }}
        transition={
          hover
            ? SPRING_BOUNCY
            : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "90px 120px" }}
      >
        {/* Book base */}
        <path d="M20 70 Q90 54 160 70 L160 158 Q90 142 20 158 Z" fill="#c28800" />
        <path d="M22 74 Q90 58 158 74 L158 152 Q90 136 22 152 Z" fill="#feb700" />
        {/* Page split */}
        <path d="M90 62 L90 148" stroke="#c28800" strokeWidth="3" strokeLinecap="round" />

        {/* Left page lines — flash on hover */}
        {[92, 106, 120].map((y, i) => (
          <motion.path
            key={`left-${y}`}
            d={`M32 ${y} L80 ${y - 8}`}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={hover ? { strokeOpacity: [0.4, 1, 0.4] } : { strokeOpacity: 0.8 }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
        {/* Right page lines */}
        {[84, 98, 112].map((y, i) => (
          <motion.path
            key={`right-${y}`}
            d={`M100 ${y} L148 ${y + 8}`}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={hover ? { strokeOpacity: [0.4, 1, 0.4] } : { strokeOpacity: 0.8 }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 + 0.4 }}
          />
        ))}

        {/* Face on the book's spine area */}
        <circle cx="72" cy="80" r="3" fill="#1a1c1e" />
        <circle cx="108" cy="80" r="3" fill="#1a1c1e" />
        <motion.path
          d="M78 90 Q90 100 102 90"
          stroke="#1a1c1e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={hover ? { d: "M76 88 Q90 106 104 88" } : { d: "M78 90 Q90 100 102 90" }}
          transition={SPRING_BOUNCY}
        />
      </motion.g>
    </g>
  );
}

// ============================================================
// 3. SCIENCE — Smiling sprout with sunglasses, bee buddy
// ============================================================
// Idle: plant sways like a gentle breeze
// Hover: sprout grows taller, bee flies figure-8 around it, sun rays
// burst radially from behind, water drops fall onto the plant.
// ============================================================
function ScienceMascot({ hover }: { hover: boolean }) {
  // Sun ray positions (radial, 8 beams around the plant)
  const sunRays = Array.from({ length: 8 }, (_, i) => ({
    angle: i * 45,
  }));

  return (
    <g>
      {/* Sun ray burst behind — fades in on hover */}
      {sunRays.map((r, i) => {
        const rad = (r.angle * Math.PI) / 180;
        return (
          <motion.line
            key={i}
            x1="90"
            y1="80"
            x2={90 + Math.cos(rad) * 60}
            y2={80 + Math.sin(rad) * 60}
            stroke="#FFD54F"
            strokeWidth="4"
            strokeLinecap="round"
            animate={
              hover
                ? { opacity: [0, 0.7, 0], pathLength: [0, 1, 1] }
                : { opacity: 0, pathLength: 0 }
            }
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.06,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Water drops falling on hover */}
      {hover &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={`drop-${i}`}
            cx={60 + i * 30}
            cy={0}
            r="3.5"
            fill="#4FC3F7"
            initial={{ cy: -10, opacity: 0 }}
            animate={{ cy: [0, 60], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeIn",
            }}
          />
        ))}

      {/* Plant — sways at rest, grows + stretches on hover */}
      <motion.g
        animate={
          hover
            ? { scaleY: 1.08, y: -6, rotate: 0 }
            : { scaleY: 1, y: 0, rotate: [-1.5, 1.5, -1.5] }
        }
        transition={
          hover
            ? SPRING_BOUNCY
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "90px 130px" }}
      >
        {/* Leaves (back) */}
        <path d="M90 36 Q60 40 58 74 Q78 74 90 54 Z" fill="#2e7d32" />
        <path d="M90 36 Q120 40 122 74 Q102 74 90 54 Z" fill="#2e7d32" />
        {/* Leaves (front, lighter) */}
        <path d="M90 42 Q68 46 66 78 Q82 78 90 58 Z" fill="#66bb6a" />
        <path d="M90 42 Q112 46 114 78 Q98 78 90 58 Z" fill="#66bb6a" />

        {/* Extra pop-out leaves on hover */}
        <motion.path
          d="M66 70 Q48 60 42 84 Q56 86 68 78 Z"
          fill="#81c784"
          animate={hover ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={SPRING_BOUNCY}
          style={{ transformOrigin: "54px 76px" }}
        />
        <motion.path
          d="M114 70 Q132 60 138 84 Q124 86 112 78 Z"
          fill="#81c784"
          animate={hover ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ ...SPRING_BOUNCY, delay: 0.08 }}
          style={{ transformOrigin: "126px 76px" }}
        />

        {/* Stem face */}
        <rect x="78" y="62" width="24" height="44" rx="12" fill="#81c784" />
        {/* Sunglasses */}
        <rect x="74" y="72" width="32" height="10" rx="4" fill="#1a1c1e" />
        <circle cx="82" cy="77" r="4" fill="#1a1c1e" />
        <circle cx="98" cy="77" r="4" fill="#1a1c1e" />
        <motion.circle
          cx="81"
          cy="76"
          r="1.2"
          fill="#ffffff"
          animate={hover ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.circle
          cx="97"
          cy="76"
          r="1.2"
          fill="#ffffff"
          animate={hover ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
        />
        {/* Smile */}
        <path
          d="M82 92 Q90 100 98 92"
          stroke="#1a1c1e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Terracotta pot */}
        <path d="M50 108 L130 108 L122 158 L58 158 Z" fill="#bf4f2d" />
        <rect x="46" y="104" width="88" height="12" rx="3" fill="#e06a47" />
        <path
          d="M60 118 L58 150"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Bee — flies figure-8 around plant on hover */}
      <motion.g
        animate={
          hover
            ? {
                x: [130, 30, 30, 130, 130],
                y: [20, 50, 90, 120, 20],
                rotate: [0, -20, 20, 0, 0],
              }
            : { x: 130, y: [20, 14, 20], rotate: 0 }
        }
        transition={
          hover
            ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <g transform="translate(0 0)">
          <ellipse cx="14" cy="12" rx="14" ry="10" fill="#FDD835" />
          <rect x="8" y="4" width="4" height="16" fill="#1a1c1e" />
          <rect x="16" y="4" width="4" height="16" fill="#1a1c1e" />
          <motion.ellipse
            cx="10"
            cy="6"
            rx="7"
            ry="4"
            fill="#ffffff"
            fillOpacity="0.85"
            animate={{ scaleY: [1, 0.6, 1] }}
            transition={{ duration: 0.12, repeat: Infinity }}
            style={{ transformOrigin: "10px 6px" }}
          />
          <motion.ellipse
            cx="18"
            cy="6"
            rx="7"
            ry="4"
            fill="#ffffff"
            fillOpacity="0.85"
            animate={{ scaleY: [1, 0.6, 1] }}
            transition={{ duration: 0.12, repeat: Infinity }}
            style={{ transformOrigin: "18px 6px" }}
          />
          <circle cx="6" cy="12" r="1.6" fill="#1a1c1e" />
        </g>
      </motion.g>
    </g>
  );
}

// ============================================================
// 4. GEOGRAPHY — Bouncy globe with orbiting airplane
// ============================================================
// Idle: globe drifts slightly
// Hover: globe spins 360°, airplane orbits full circle with dashed
// contrail, cloud puffs drift across the surface, sparkle dots pulse.
// ============================================================
function GeographyMascot({ hover }: { hover: boolean }) {
  return (
    <g>
      {/* Orbit path (dashed) — only visible on hover */}
      <motion.circle
        cx="90"
        cy="98"
        r="74"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        animate={hover ? { opacity: 0.6, rotate: 360 } : { opacity: 0, rotate: 0 }}
        transition={{
          opacity: { duration: 0.3 },
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
        }}
        style={{ transformOrigin: "90px 98px" }}
      />

      {/* Sparkle dots around orbit */}
      {[
        { cx: 30, cy: 40 },
        { cx: 152, cy: 54 },
        { cx: 20, cy: 108 },
        { cx: 150, cy: 130 },
      ].map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r="2.5"
          fill="#ffffff"
          animate={
            hover
              ? { opacity: [0.3, 1, 0.3], scale: [1, 1.6, 1] }
              : { opacity: 0.5, scale: 1 }
          }
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}

      {/* Globe — spins 360° on hover */}
      <motion.g
        animate={hover ? { rotate: 360 } : { rotate: [0, 8, 0] }}
        transition={
          hover
            ? { duration: 3.2, repeat: Infinity, ease: "linear" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "90px 98px" }}
      >
        <circle cx="90" cy="98" r="58" fill="#1976d2" />
        <circle cx="90" cy="98" r="58" fill="url(#globeShine)" />
        {/* Continents */}
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
        <path d="M112 116 Q126 118 128 130 Q120 138 110 132 Z" fill="#43a047" />
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
      </motion.g>

      {/* Face — counter-rotates so it always faces the viewer */}
      <g>
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
      </g>

      {/* Cloud puff — drifts across the globe surface on hover */}
      <motion.g
        animate={hover ? { x: [-30, 100], opacity: [0, 1, 0] } : { x: -30, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="70" cy="70" rx="14" ry="6" fill="#ffffff" fillOpacity="0.85" />
        <ellipse cx="78" cy="68" rx="10" ry="5" fill="#ffffff" fillOpacity="0.85" />
      </motion.g>

      {/* Airplane — orbits globe full circle on hover (arcs above at rest) */}
      <motion.g
        animate={
          hover
            ? { rotate: 360 }
            : { rotate: [0, 10, -4, 0] }
        }
        transition={
          hover
            ? { duration: 2.6, repeat: Infinity, ease: "linear" }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "90px 98px" }}
      >
        <g transform="translate(148 30) rotate(40)">
          <path
            d="M0 8 L28 4 L34 0 L40 4 L44 6 L44 12 L34 12 L24 18 L18 14 L14 18 L8 14 L0 12 Z"
            fill="#e53935"
          />
          <rect x="20" y="5" width="6" height="4" fill="#ffffff" />
          <rect x="28" y="5" width="4" height="4" fill="#ffffff" />
        </g>
      </motion.g>

      <defs>
        <radialGradient id="globeShine" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}

// ============================================================
// 5. HISTORY — Purple castle with rising crown
// ============================================================
// Idle: crown floats gently above the castle
// Hover: crown rises + bounces with sparkle trail, flag waves fast,
// trumpet notes ♪ ♫ float up from the battlements.
// ============================================================
function HistoryMascot({ hover }: { hover: boolean }) {
  const notes = [
    { x: 40, ch: "♪", delay: 0 },
    { x: 130, ch: "♫", delay: 0.4 },
    { x: 90, ch: "♪", delay: 0.8 },
  ];

  return (
    <g>
      {/* Musical notes floating up on hover */}
      {notes.map((n, i) => (
        <motion.text
          key={i}
          x={n.x}
          y={150}
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize="22"
          fontWeight="700"
          fill="#feb700"
          animate={
            hover
              ? { y: [150, 30], opacity: [0, 1, 0], x: [n.x, n.x + (i % 2 ? -8 : 8)] }
              : { y: 150, opacity: 0 }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: n.delay,
            ease: "easeOut",
          }}
        >
          {n.ch}
        </motion.text>
      ))}

      {/* Crown — rises higher on hover with a bounce + sparkles */}
      <motion.g
        animate={
          hover
            ? { y: -18, scale: 1.08, rotate: [-2, 2, -2] }
            : { y: [0, -3, 0], scale: 1, rotate: 0 }
        }
        transition={
          hover
            ? { ...SPRING_BOUNCY, rotate: { duration: 0.8, repeat: Infinity } }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ transformOrigin: "90px 22px" }}
      >
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

        {/* Sparkle trail around crown on hover */}
        {hover &&
          [0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const dx = Math.cos(rad) * 30;
            const dy = Math.sin(rad) * 18;
            return (
              <motion.path
                key={i}
                d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
                fill="#FFFFFF"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [90, 90 + dx],
                  y: [18, 18 + dy],
                  scale: [0.4, 1.2, 0.4],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.12,
                }}
              />
            );
          })}
      </motion.g>

      {/* Castle — static body */}
      <g>
        {/* Back towers */}
        <rect x="34" y="56" width="26" height="96" fill="#4527a0" />
        <rect x="120" y="56" width="26" height="96" fill="#4527a0" />
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

        {/* Face on main wall */}
        <circle cx="78" cy="96" r="3" fill="#1a1c1e" />
        <circle cx="102" cy="96" r="3" fill="#1a1c1e" />
        <motion.path
          d="M76 108 Q90 120 104 108"
          stroke="#1a1c1e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={hover ? { d: "M74 104 Q90 126 106 104" } : { d: "M76 108 Q90 120 104 108" }}
          transition={SPRING_BOUNCY}
        />
        <circle cx="72" cy="108" r="2" fill="#FF8A80" fillOpacity="0.6" />
        <circle cx="108" cy="108" r="2" fill="#FF8A80" fillOpacity="0.6" />

        {/* Door */}
        <path
          d="M78 130 Q78 124 90 124 Q102 124 102 130 L102 152 L78 152 Z"
          fill="#4527a0"
        />
        <circle cx="96" cy="138" r="1.5" fill="#feb700" />
      </g>

      {/* Flag — waves back and forth */}
      <g>
        <rect x="88" y="22" width="2" height="16" fill="#1a1c1e" />
        <motion.path
          d="M90 22 L104 26 L90 30 Z"
          fill="#e040fb"
          animate={
            hover
              ? { d: ["M90 22 L106 24 L90 30 Z", "M90 22 L102 28 L90 30 Z", "M90 22 L106 24 L90 30 Z"] }
              : { d: ["M90 22 L104 26 L90 30 Z", "M90 22 L102 27 L90 30 Z", "M90 22 L104 26 L90 30 Z"] }
          }
          transition={{
            duration: hover ? 0.5 : 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </g>
    </g>
  );
}

// ============================================================
// 6. PSHE — Rainbow hands holding a smiling heart
// ============================================================
// Idle: heart beats slowly
// Hover: heart beats fast, rainbow stripes shimmer in a colour wave,
// mini hearts float up around the big heart, hands wave gently.
// ============================================================
function PsheMascot({ hover }: { hover: boolean }) {
  const rainbowColors = ["#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5"];

  const miniHearts = [
    { x: 30, delay: 0 },
    { x: 60, delay: 0.4 },
    { x: 120, delay: 0.2 },
    { x: 150, delay: 0.6 },
    { x: 90, delay: 0.8 },
  ];

  return (
    <g>
      {/* Rainbow arcs — shimmer on hover */}
      {rainbowColors.map((color, i) => {
        const offset = i * 8;
        return (
          <motion.path
            key={i}
            d={`M${18 + offset} ${90 + offset / 2} Q90 ${10 + offset * 3} ${162 - offset} ${90 + offset / 2}`}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            animate={
              hover
                ? { strokeOpacity: [0.6, 1, 0.6], strokeWidth: [8, 10, 8] }
                : { strokeOpacity: 1, strokeWidth: 8 }
            }
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
          />
        );
      })}

      {/* Mini hearts floating up on hover */}
      {hover &&
        miniHearts.map((h, i) => (
          <motion.path
            key={i}
            d="M8 2 C6 -1 0 0 0 5 C0 10 8 14 8 14 C8 14 16 10 16 5 C16 0 10 -1 8 2 Z"
            fill="#ff5252"
            initial={{ opacity: 0 }}
            animate={{
              x: h.x,
              y: [100, 30],
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: h.delay,
              ease: "easeOut",
            }}
          />
        ))}

      {/* Left hand — waves gently */}
      <motion.g
        animate={
          hover
            ? { rotate: [-6, 2, -6], x: -4 }
            : { rotate: [-2, 2, -2], x: 0 }
        }
        transition={{ duration: hover ? 0.8 : 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "38px 130px" }}
      >
        <g transform="translate(24 92)">
          <rect x="0" y="10" width="30" height="38" rx="10" fill="#f4a988" />
          <rect x="4" y="0" width="6" height="16" rx="3" fill="#f4a988" />
          <rect x="12" y="-4" width="6" height="20" rx="3" fill="#f4a988" />
          <rect x="20" y="-2" width="6" height="18" rx="3" fill="#f4a988" />
          <rect x="-4" y="18" width="10" height="20" rx="5" fill="#f4a988" />
        </g>
      </motion.g>

      {/* Right hand — waves gently (opposite phase) */}
      <motion.g
        animate={
          hover
            ? { rotate: [6, -2, 6], x: 4 }
            : { rotate: [2, -2, 2], x: 0 }
        }
        transition={{ duration: hover ? 0.8 : 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        style={{ transformOrigin: "142px 130px" }}
      >
        <g transform="translate(126 92) scale(-1 1)">
          <rect x="0" y="10" width="30" height="38" rx="10" fill="#f4a988" />
          <rect x="4" y="0" width="6" height="16" rx="3" fill="#f4a988" />
          <rect x="12" y="-4" width="6" height="20" rx="3" fill="#f4a988" />
          <rect x="20" y="-2" width="6" height="18" rx="3" fill="#f4a988" />
          <rect x="-4" y="18" width="10" height="20" rx="5" fill="#f4a988" />
        </g>
      </motion.g>

      {/* Heart — beats slowly at rest, fast on hover */}
      <motion.g
        animate={hover ? { scale: [1, 1.18, 1] } : { scale: [1, 1.06, 1] }}
        transition={{
          duration: hover ? 0.5 : 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "90px 104px" }}
      >
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
          <motion.path
            d="M26 30 Q36 38 46 30"
            stroke="#1a1c1e"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={hover ? { d: "M24 28 Q36 42 48 28" } : { d: "M26 30 Q36 38 46 30" }}
            transition={SPRING_SOFT}
          />
        </g>
      </motion.g>
    </g>
  );
}

const MASCOTS: Record<SubjectKey, (props: { hover: boolean }) => React.ReactElement> = {
  maths: MathsMascot,
  phonics: PhonicsMascot,
  science: ScienceMascot,
  geography: GeographyMascot,
  history: HistoryMascot,
  pshe: PsheMascot,
};
