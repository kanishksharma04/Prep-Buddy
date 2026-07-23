"use client";

import { useCountdown } from "@/lib/use-countdown";

const URGENCY_CLASSES = {
  green: "text-green-700 dark:text-green-400",
  amber: "text-amber-700 dark:text-amber-500",
  red: "text-red-700 dark:text-red-400",
  grey: "text-muted-foreground",
} as const;

export function Countdown({ examDate }: { examDate: Date | null }) {
  const result = useCountdown(examDate);

  if (!examDate) {
    return <span className="text-muted-foreground text-sm">No exam date set</span>;
  }

  if (!result) {
    return <span className="text-muted-foreground text-sm">…</span>;
  }

  const { isPast, days, hours, urgency } = result;

  return (
    <span className={`text-sm font-medium ${URGENCY_CLASSES[urgency]}`}>
      {isPast ? "Exam passed" : `${days > 0 ? `${days}d ` : ""}${hours}h left`}
    </span>
  );
}
