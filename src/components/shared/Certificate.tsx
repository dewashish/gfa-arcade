"use client";

import { forwardRef } from "react";
import { Avatar } from "@/components/ui/Avatar";

interface CertificateProps {
  /** 1-based rank. null → "great effort" variant for everyone outside top 3. */
  rank: number | null;
  totalStudents: number;
  studentName: string;
  avatarId: string;
  activityTitle: string;
  score: number;
  playedOn: Date;
}

/**
 * Presentation-only certificate card. No state, no interactivity — purely
 * a printable block of HTML + CSS. The ref on the root lets a download
 * helper (`certificate-download.ts`) snapshot the DOM to PNG or PDF.
 *
 * Four visual variants keyed on rank:
 *   1 → gold podium
 *   2 → silver podium
 *   3 → bronze podium
 *   null → "great effort" teal (everyone outside top 3 still gets a positive
 *          souvenir)
 *
 * Layout is intentionally landscape and fixed-width (960 × 680px) so
 * html2canvas produces a consistent crop regardless of viewport size.
 * Embedded in modals / full-screen stages via a scaling wrapper.
 */
export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(
  function Certificate(
    { rank, totalStudents, studentName, avatarId, activityTitle, score, playedOn },
    ref
  ) {
    const variant = (() => {
      if (rank === 1) {
        return {
          label: "1st place",
          medal: "🥇",
          title: "GOLD CHAMPION",
          gradient: "from-[#FFE680] via-[#FDD835] to-[#C48B00]",
          accent: "#7C5800",
          borderColor: "#FDD835",
          subtitle: `Top scorer out of ${totalStudents} adventurers`,
        };
      }
      if (rank === 2) {
        return {
          label: "2nd place",
          medal: "🥈",
          title: "SILVER STAR",
          gradient: "from-[#EEF2F4] via-[#C8D0D6] to-[#7B8A92]",
          accent: "#3C4A52",
          borderColor: "#C8D0D6",
          subtitle: `2 of ${totalStudents} across the class`,
        };
      }
      if (rank === 3) {
        return {
          label: "3rd place",
          medal: "🥉",
          title: "BRONZE HERO",
          gradient: "from-[#F3D8BB] via-[#D89E6A] to-[#8C5A2A]",
          accent: "#5C3A17",
          borderColor: "#D89E6A",
          subtitle: `3 of ${totalStudents} across the class`,
        };
      }
      return {
        label: "Great effort",
        medal: "🌟",
        title: "SHINING STAR",
        gradient: "from-[#B2F0E8] via-[#4FC3B5] to-[#00A396]",
        accent: "#004D43",
        borderColor: "#4FC3B5",
        subtitle: "Every answer counted — keep it up!",
      };
    })();

    const dateLabel = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(playedOn);

    return (
      <div
        ref={ref}
        // Fixed dimensions so html2canvas snapshots match up regardless of
        // where this gets rendered. Scaling wrapper handles the UI preview.
        style={{ width: 960, height: 680, fontFamily: "'Fraunces', 'Inter', serif" }}
        className={`relative overflow-hidden rounded-[32px] bg-gradient-to-br ${variant.gradient} text-[color:var(--accent)] shadow-[0_30px_90px_rgba(0,0,0,0.25)]`}
        // CSS variable for the accent so text colors can use it even after
        // html2canvas computes inline styles.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ style: { width: 960, height: 680, fontFamily: "'Fraunces', 'Inter', serif", "--accent": variant.accent } } as any)}
      >
        {/* Inner frame — decorative double-border, tactile printable feel */}
        <div
          className="absolute inset-6 rounded-[24px] border-[3px]"
          style={{ borderColor: variant.borderColor }}
        />
        <div
          className="absolute inset-10 rounded-[18px] border"
          style={{ borderColor: variant.borderColor, opacity: 0.5 }}
        />

        {/* Corner flourishes */}
        <div className="absolute top-8 left-8 text-5xl opacity-70" aria-hidden="true">
          ✦
        </div>
        <div className="absolute top-8 right-8 text-5xl opacity-70" aria-hidden="true">
          ✦
        </div>
        <div className="absolute bottom-8 left-8 text-5xl opacity-70" aria-hidden="true">
          ✦
        </div>
        <div className="absolute bottom-8 right-8 text-5xl opacity-70" aria-hidden="true">
          ✦
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center px-20 py-16">
          {/* Header */}
          <div className="text-center">
            <p
              className="text-[11px] tracking-[0.4em] font-bold opacity-70"
              style={{ color: variant.accent }}
            >
              GEMS FOUNDERS SCHOOL · MASDAR CITY
            </p>
            <h1
              className="text-[42px] leading-[1.1] font-black mt-3 tracking-tight"
              style={{ color: variant.accent }}
            >
              Certificate of Achievement
            </h1>
            <p
              className="text-sm italic mt-2 opacity-80"
              style={{ color: variant.accent }}
            >
              {variant.subtitle}
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="text-[92px] leading-none" aria-hidden="true">
              {variant.medal}
            </div>
            <p
              className="text-[12px] uppercase tracking-[0.35em] font-bold opacity-80"
              style={{ color: variant.accent }}
            >
              Presented to
            </p>
            <div className="flex items-center gap-5">
              <Avatar avatarId={avatarId} size="xl" />
              <h2
                className="text-[56px] font-black leading-none"
                style={{ color: variant.accent }}
              >
                {studentName}
              </h2>
            </div>
            <p
              className="text-xl font-semibold opacity-85 text-center max-w-[680px]"
              style={{ color: variant.accent }}
            >
              for completing <span className="italic">“{activityTitle}”</span>
            </p>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
            <div>
              <p
                className="text-[11px] tracking-[0.3em] uppercase font-bold opacity-70"
                style={{ color: variant.accent }}
              >
                {variant.label}
              </p>
              <p
                className="text-[32px] font-black leading-none mt-1"
                style={{ color: variant.accent }}
              >
                {variant.title}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[11px] uppercase tracking-[0.3em] font-bold opacity-70"
                style={{ color: variant.accent }}
              >
                Final Score
              </p>
              <p
                className="text-[42px] font-black leading-none mt-1"
                style={{ color: variant.accent }}
              >
                {score.toLocaleString()}
              </p>
              <p
                className="text-xs mt-1 opacity-70"
                style={{ color: variant.accent }}
              >
                {dateLabel} · Adventure Hub
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
