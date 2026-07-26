import { buildHeatmap, computeStreak } from "@/lib/streak";

const WEEKS = 18;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function levelClass(count: number) {
  if (count <= 0) return "bg-background border-border";
  if (count === 1) return "border-primary/35 bg-primary/35";
  if (count === 2) return "border-primary/60 bg-primary/60";
  if (count <= 4) return "border-primary/85 bg-primary/85";
  return "border-primary bg-primary";
}

export function StreakHeatmap({
  completedDates,
  now = new Date(),
}: {
  completedDates: Date[];
  now?: Date;
}) {
  const streak = computeStreak(completedDates, now);
  const weeks = buildHeatmap(completedDates, WEEKS, now);

  return (
    <div className="border-border bg-surface rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--paper-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Study activity</h2>
        <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a6 6 0 1 1-12 0c0-1.313.526-2.66 1.5-3.5.5 1.5 1.5 2.5 2.5 2.5" />
          </svg>
          {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"} streak` : "No streak yet"}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex gap-[3px]" style={{ width: "max-content" }}>
          <div className="flex flex-col gap-[3px] pr-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-muted-foreground flex h-[11px] items-center text-[9px] leading-none"
              >
                {label}
              </span>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) =>
                day.isFuture ? (
                  <div key={day.date} className="h-[11px] w-[11px]" />
                ) : (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} topic${day.count === 1 ? "" : "s"} completed`}
                    className={`h-[11px] w-[11px] scale-100 rounded-xs border transition-transform duration-100 hover:scale-150 ${levelClass(day.count)}`}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
