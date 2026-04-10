"use client";

import { Howl } from "howler";

export type SoundName =
  | "correct"
  | "wrong"
  | "spin"
  | "confetti"
  | "bankrupt"
  | "join"
  | "tick"
  | "click"
  | "levelup"
  | "whoosh"
  | "pop"
  | "ding"
  | "countdown-low"
  | "applause"
  | "page-turn"
  | "tada"
  | "drumroll"
  | "success-chime";

class AudioManager {
  private sounds: Map<SoundName, Howl> = new Map();
  private muted = false;
  private initialized = false;

  init() {
    if (this.initialized) return;

    const soundDefs: Record<SoundName, string> = {
      correct: "/sounds/correct.mp3",
      wrong: "/sounds/wrong.mp3",
      spin: "/sounds/spin.mp3",
      confetti: "/sounds/confetti.mp3",
      bankrupt: "/sounds/bankrupt.mp3",
      join: "/sounds/join.mp3",
      tick: "/sounds/tick.mp3",
      click: "/sounds/click.mp3",
      levelup: "/sounds/levelup.mp3",
      whoosh: "/sounds/whoosh.mp3",
      pop: "/sounds/pop.mp3",
      ding: "/sounds/ding.mp3",
      "countdown-low": "/sounds/countdown-low.mp3",
      applause: "/sounds/applause.mp3",
      "page-turn": "/sounds/page-turn.mp3",
      tada: "/sounds/tada.mp3",
      drumroll: "/sounds/drumroll.mp3",
      "success-chime": "/sounds/success-chime.mp3",
    };

    for (const [name, src] of Object.entries(soundDefs)) {
      this.sounds.set(name as SoundName, new Howl({ src: [src], preload: true, volume: 0.5 }));
    }

    // Restore mute preference
    if (typeof window !== "undefined") {
      this.muted = localStorage.getItem("gfa-muted") === "true";
    }

    this.initialized = true;
  }

  play(name: SoundName) {
    if (this.muted) return;
    this.sounds.get(name)?.play();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("gfa-muted", String(this.muted));
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export const audioManager = new AudioManager();
