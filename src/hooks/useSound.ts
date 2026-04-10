"use client";

import { useEffect, useCallback, useState } from "react";
import { audioManager } from "@/lib/sounds/audio-manager";

export function useSound() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    audioManager.init();
    setMuted(audioManager.isMuted());
  }, []);

  const play = useCallback((name: Parameters<typeof audioManager.play>[0]) => {
    audioManager.play(name);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = audioManager.toggleMute();
    setMuted(newMuted);
  }, []);

  return { play, muted, toggleMute };
}
