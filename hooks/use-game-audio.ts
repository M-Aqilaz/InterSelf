"use client";

import { useCallback, useEffect, useRef } from "react";

type GameAudioEvent = "attack" | "unlock" | "equip" | "counter" | "victory" | "nav";

const EVENT_FREQUENCIES: Record<GameAudioEvent, number> = {
  attack: 380,
  unlock: 560,
  equip: 260,
  counter: 180,
  victory: 640,
  nav: 720,
};

export function useGameAudio() {
  const contextRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return null;
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  const play = useCallback(
    async (event: GameAudioEvent, durationMs: number = 180) => {
      if (typeof window === "undefined") return;
      const ctx = await ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = EVENT_FREQUENCIES[event];
      const duration = durationMs / 1000;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    },
    [ensureContext]
  );

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
    };
  }, []);

  return { play };
}
