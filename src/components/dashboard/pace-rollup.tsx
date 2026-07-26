type RollupSubject = { id: string; name: string; status: "ahead" | "on-track" | "behind" };

// The one-line answer to "what needs attention today?" — named subjects for
// the urgent "behind" bucket (worth drilling into), plain counts for the
// other two (nothing to act on there right now).
export function PaceRollup({ subjects }: { subjects: RollupSubject[] }) {
  const behind = subjects.filter((subject) => subject.status === "behind");
  const onTrack = subjects.filter((subject) => subject.status === "on-track");
  const ahead = subjects.filter((subject) => subject.status === "ahead");

  if (behind.length === 0 && onTrack.length === 0 && ahead.length === 0) {
    return null;
  }

  return (
    <div className="border-border bg-surface flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border px-5 py-3.5 shadow-[3px_3px_0_0_var(--paper-shadow)]">
      <span className="text-sm font-semibold">Pace check</span>
      {behind.length > 0 ? (
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium text-red-700 dark:text-red-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600 dark:bg-red-500" aria-hidden="true" />
          {behind.length} behind
          <span className="text-muted-foreground font-normal">
            ({behind.map((subject) => subject.name).join(", ")})
          </span>
        </span>
      ) : null}
      {onTrack.length > 0 ? (
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium">
          <span className="bg-muted-foreground/50 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden="true" />
          {onTrack.length} on track
        </span>
      ) : null}
      {ahead.length > 0 ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-500" aria-hidden="true" />
          {ahead.length} ahead
        </span>
      ) : null}
    </div>
  );
}
