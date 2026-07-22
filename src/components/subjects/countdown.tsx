"use client";

import { useEffect, useState } from "react";
import { getCountdown } from "@/lib/countdown";

const URGENCY_CLASSES = {
  green: "text-green-700 dark:text-green-400",
  amber: "text-amber-700 dark:text-amber-500",
  red: "text-red-700 dark:text-red-400",
  grey: "text-muted-foreground",
} as const;

export function Countdown({ examDate }: { examDate: Date | null }) {
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

  if (!examDate) {
    return <span className="text-muted-foreground text-sm">No exam date set</span>;
  }

  if (!now) {
    return <span className="text-muted-foreground text-sm">…</span>;
  }

  const { isPast, days, hours, urgency } = getCountdown(examDate, now);

  return (
    <span className={`text-sm font-medium ${URGENCY_CLASSES[urgency]}`}>
      {isPast ? "Exam passed" : `${days > 0 ? `${days}d ` : ""}${hours}h left`}
    </span>
  );
}
