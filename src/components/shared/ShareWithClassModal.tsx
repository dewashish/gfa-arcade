"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPRING, TRANSITION } from "@/lib/design/motion";

interface ShareWithClassModalProps {
  open: boolean;
  pinCode: string;
  onClose: () => void;
}

/**
 * "Share with Class" modal for the Teacher Monitor.
 *
 * Shows:
 *  - The student join URL (auto-detected from window.location.origin)
 *  - A QR code so kids can scan with a tablet camera
 *  - The 6-digit PIN displayed huge and copy-able
 *  - Copy buttons for the URL + PIN
 *  - A Big Mode toggle that fills the screen so it's projector-ready
 */
export function ShareWithClassModal({ open, pinCode, onClose }: ShareWithClassModalProps) {
  const [origin, setOrigin] = useState("");
  const [bigMode, setBigMode] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Detect origin client-side (don't call window. on the server)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (bigMode) setBigMode(false);
        else onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, bigMode, onClose]);

  const joinUrl = origin ? `${origin}/play` : "/play";
  // Pre-fill the PIN via query param so kids only need to tap their name
  const joinUrlWithPin = origin ? `${origin}/play?pin=${pinCode}` : `/play?pin=${pinCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrlWithPin)}`;

  async function copy(text: string, which: "pin" | "url") {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "pin") {
        setPinCopied(true);
        setTimeout(() => setPinCopied(false), 1500);
      } else {
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 1500);
      }
    } catch {
      // ignore — older browsers
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION.fast}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-panel"
          onClick={() => (bigMode ? null : onClose())}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 30 }}
            transition={SPRING.snappy}
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface-container-lowest rounded-xl ambient-shadow-lg overflow-hidden flex flex-col ${
              bigMode ? "w-full h-full max-w-none max-h-none" : "max-w-3xl w-full max-h-[90vh]"
            }`}
          >
            {/* Header */}
            <div className="px-6 md:px-10 pt-6 md:pt-8 flex items-center justify-between gap-4">
              <h2
                id="share-title"
                className="font-headline font-black text-2xl md:text-4xl text-primary -rotate-1 origin-left"
              >
                Share with your class!
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBigMode((v) => !v)}
                  aria-label={bigMode ? "Exit fullscreen" : "Show fullscreen"}
                  className="focus-ring h-11 px-4 rounded-full bg-surface-container-low hover:bg-surface-container font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    {bigMode ? "close_fullscreen" : "fullscreen"}
                  </span>
                  {bigMode ? "Exit" : "Big"}
                </button>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close share dialog"
                  className="focus-ring w-11 h-11 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Body — three steps in a row */}
            <div
              className={`flex-1 px-6 md:px-10 pb-6 md:pb-10 mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 ${
                bigMode ? "items-center" : ""
              }`}
            >
              {/* Step 1: PIN */}
              <div className="text-center space-y-3">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Step 1
                </p>
                <p className="font-body text-on-surface-variant">Type this PIN at the join page</p>
                <div
                  className={`bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-6 px-4 ambient-shadow ${bigMode ? "py-12" : ""}`}
                >
                  <p
                    className={`font-headline font-black tracking-[0.4em] ${bigMode ? "text-9xl" : "text-5xl md:text-6xl"}`}
                  >
                    {pinCode}
                  </p>
                </div>
                <button
                  onClick={() => copy(pinCode, "pin")}
                  className="focus-ring h-11 px-5 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    {pinCopied ? "check" : "content_copy"}
                  </span>
                  {pinCopied ? "Copied!" : "Copy PIN"}
                </button>
              </div>

              {/* Step 2: URL */}
              <div className="text-center space-y-3">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Step 2
                </p>
                <p className="font-body text-on-surface-variant">Or share this link</p>
                <div className="bg-surface-container-low rounded-xl p-6 ambient-shadow flex flex-col items-center justify-center min-h-[160px]">
                  <p
                    className={`font-body font-bold text-on-surface break-all ${bigMode ? "text-3xl" : "text-base md:text-lg"}`}
                  >
                    {origin
                      ? joinUrl.replace(/^https?:\/\//, "")
                      : "Loading..."}
                  </p>
                  <p
                    className={`text-on-surface-variant mt-1 ${bigMode ? "text-xl" : "text-xs"}`}
                  >
                    {origin ? "(or scan the QR →)" : ""}
                  </p>
                </div>
                <button
                  onClick={() => copy(joinUrlWithPin, "url")}
                  className="focus-ring h-11 px-5 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    {urlCopied ? "check" : "link"}
                  </span>
                  {urlCopied ? "Copied!" : "Copy link"}
                </button>
              </div>

              {/* Step 3: QR Code */}
              <div className="text-center space-y-3">
                <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Step 3
                </p>
                <p className="font-body text-on-surface-variant">Or scan with a tablet</p>
                <div
                  className={`bg-white rounded-xl ambient-shadow p-4 inline-block ${bigMode ? "p-8" : ""}`}
                >
                  {origin ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrUrl}
                      alt={`QR code that opens ${joinUrlWithPin}`}
                      width={bigMode ? 480 : 200}
                      height={bigMode ? 480 : 200}
                      className={bigMode ? "w-[480px] h-[480px]" : "w-[200px] h-[200px]"}
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-surface-container-low animate-pulse rounded-lg" />
                  )}
                </div>
                <p
                  className={`text-on-surface-variant font-body ${bigMode ? "text-lg" : "text-xs"}`}
                >
                  Auto-fills the PIN
                </p>
              </div>
            </div>

            {/* Footer note */}
            {!bigMode && (
              <div className="px-6 md:px-10 py-4 bg-surface-container-low text-center">
                <p className="text-xs text-on-surface-variant font-body">
                  💡 Tip: click <strong>Big</strong> to project this on your classroom screen
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
