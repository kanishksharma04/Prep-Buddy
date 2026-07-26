"use client";

import { useEffect, useRef, useState } from "react";

// Tweens the displayed number up from 0 to `target` on an eased curve.
// Always starts at 0 on mount, deliberately — every topic-toggle action
// lives on the subject page and revalidates the dashboard route, so by the
// time you're back looking at these numbers the dashboard has always just
// (re)mounted fresh. A "resume where it was and animate only on change"
// version would never actually animate in this app; this is the version
// that's actually visible.
export function useCountUp(target: number, durationMs = 700) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    let frameId: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return display;
}
