"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";
import { Certificate } from "@/components/shared/Certificate";
import {
  downloadCertificateAsPng,
  downloadCertificateAsPdf,
} from "@/lib/certificate-download";
import { SPRING } from "@/lib/design/motion";
import type { LeaderboardEntry } from "@/lib/game-engine/types";

interface CertificatesPreviewModalProps {
  open: boolean;
  activityTitle: string;
  onClose: () => void;
}

/**
 * Teacher-side bulk certificate preview + download modal.
 *
 * After End Game, the teacher clicks "Certificates" and sees every
 * student's certificate rendered in a scrollable stack with two download
 * buttons per student (PNG / PDF). Lets her download individually for
 * print-and-hand-out after class.
 *
 * The rank → variant logic is identical to the student side (top 3 get
 * gold/silver/bronze, everyone else gets "great effort"). Shares the
 * same `<Certificate>` component so the teacher and student versions are
 * visually identical.
 */
export function CertificatesPreviewModal({
  open,
  activityTitle,
  onClose,
}: CertificatesPreviewModalProps) {
  const { leaderboard } = useGameStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Student certificates"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={SPRING.snappy}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-4xl max-h-[92vh] bg-surface-container-lowest rounded-[28px] shadow-[0_30px_90px_rgba(0,98,158,0.25)] pointer-events-auto flex flex-col overflow-hidden">
              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-outline-variant/15 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-headline font-black text-xl text-on-surface">
                    Student Certificates
                  </h2>
                  <p className="text-xs font-body text-on-surface-variant">
                    {leaderboard.length} student
                    {leaderboard.length === 1 ? "" : "s"} · Top 3 get
                    gold/silver/bronze, everyone else gets a Shining Star
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="focus-ring w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors flex items-center justify-center shrink-0"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">
                    close
                  </span>
                </button>
              </div>

              {/* Body — scrollable stack of certificates */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-on-surface-variant font-body py-12">
                    No students joined this session.
                  </p>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <CertificateCard
                      key={entry.student_id}
                      entry={entry}
                      rank={idx + 1}
                      totalStudents={leaderboard.length}
                      activityTitle={activityTitle || "Adventure Hub"}
                    />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CertificateCard({
  entry,
  rank,
  totalStudents,
  activityTitle,
}: {
  entry: LeaderboardEntry;
  rank: number;
  totalStudents: number;
  activityTitle: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const certRank = rank <= 3 ? rank : null;

  async function handleDownload(format: "png" | "pdf") {
    if (!ref.current || busy) return;
    setBusy(format);
    try {
      const safeName = entry.student_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      const filename = `${safeName}-certificate`;
      if (format === "png") {
        await downloadCertificateAsPng(ref.current, filename);
      } else {
        await downloadCertificateAsPdf(ref.current, filename);
      }
    } catch (err) {
      console.error("[certificates] download failed", err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-[640px]">
        <p className="text-xs uppercase tracking-widest font-headline font-black text-on-surface-variant">
          #{rank} · {entry.student_name}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownload("png")}
            disabled={busy !== null}
            className="focus-ring h-9 px-4 rounded-full bg-primary text-on-primary font-body font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {busy === "png" ? "progress_activity" : "image"}
            </span>
            PNG
          </button>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            disabled={busy !== null}
            className="focus-ring h-9 px-4 rounded-full bg-secondary-container text-on-secondary-container font-body font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {busy === "pdf" ? "progress_activity" : "picture_as_pdf"}
            </span>
            PDF
          </button>
        </div>
      </div>
      {/* Scaled-down preview (real DOM is still 960x680 via the ref so
          html2canvas snapshots at full resolution). */}
      <div className="overflow-hidden rounded-[20px] max-w-full">
        <div
          className="origin-top-left"
          style={{ transform: "scale(0.66)", width: 960, height: 680 }}
        >
          <Certificate
            ref={ref}
            rank={certRank}
            totalStudents={totalStudents}
            studentName={entry.student_name}
            avatarId={entry.avatar_id}
            activityTitle={activityTitle}
            score={entry.total_score}
            playedOn={new Date()}
          />
        </div>
      </div>
    </div>
  );
}
