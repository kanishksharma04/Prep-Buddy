import type { PaceResult } from "@/lib/pace";

const PACE_CLASSES = {
  ahead: "text-green-700 dark:text-green-400",
  "on-track": "text-muted-foreground",
  behind: "text-red-700 dark:text-red-400",
} as const;

function paceLabel(pace: PaceResult): string {
  switch (pace.status) {
    case "ahead":
      return "Ahead of pace";
    case "behind":
      return `Behind pace — ${pace.requiredPerDay} topics/day needed`;
    case "on-track":
      return `On pace — ${pace.requiredPerDay} topics/day`;
  }
}

export function PaceBadge({ pace }: { pace: PaceResult | null }) {
  if (!pace) return null;

  return (
    <p className={`flex items-center gap-1 text-xs font-medium ${PACE_CLASSES[pace.status]}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0"
      >
        {pace.status === "ahead" ? (
          <path d="M4 15l6-6 4 4 6-8M20 5v5M20 5h-5" />
        ) : pace.status === "behind" ? (
          <path d="M4 9l6 6 4-4 6 8M20 19v-5M20 19h-5" />
        ) : (
          <path d="M4 12h16" />
        )}
      </svg>
      {paceLabel(pace)}
    </p>
  );
}
