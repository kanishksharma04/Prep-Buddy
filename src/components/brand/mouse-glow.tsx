"use client";

import { useEffect, useRef } from "react";

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const container = el?.parentElement;
    if (!el || !container) return;

    // Touch devices have no persistent cursor position worth chasing —
    // leave the glow at its default spot rather than tying it to touches.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    function handleMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      el!.style.left = `${e.clientX - rect.left}px`;
      el!.style.top = `${e.clientY - rect.top}px`;
    }

    container.addEventListener("mousemove", handleMove);
    return () => container.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="bg-primary/20 dark:bg-primary/25 pointer-events-none absolute top-1/4 left-1/2 h-128 w-lg -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-300 ease-out"
    />
  );
}
