"use client";

import { useEffect, useState } from "react";
import { getCountdown, type CountdownResult } from "@/lib/countdown";

// Shared by Countdown (the text label) and SubjectCard (the urgency-colored
// accent bar) so both derive from the same tick instead of computing twice.
export function useCountdown(examDate: Date | null): CountdownResult | null {
  // Start null and fill in on mount, rather than computing `new Date()`
  // during the initial render — that value would differ (if only by a
  // few ms) between the server render and the client hydration render.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribing to the system clock, not deriving state from props/state —
    // the documented exception to "set-state-in-effect": this sets the
    // client-only initial value and keeps it ticking every minute.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!examDate || !now) return null;
  return getCountdown(examDate, now);
}
