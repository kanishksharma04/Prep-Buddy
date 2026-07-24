import { formatDate } from "@/lib/format";

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/10 text-primary relative z-10 flex h-10 w-10 shrink-0 -rotate-3 items-center justify-center rounded-md transition-transform duration-300 group-hover:rotate-0">
      {children}
    </div>
  );
}

function StatCard({ index, children }: { index: number; children: React.ReactNode }) {
  const tilt = index % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.4deg]";
  return (
    <div
      className={`group border-border bg-surface relative rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:rotate-0 hover:shadow-[6px_6px_0_0_var(--paper-shadow)] ${tilt}`}
    >
      {children}
    </div>
  );
}

export function SummaryStrip({
  totalTopics,
  doneTopics,
  nextExam,
}: {
  totalTopics: number;
  doneTopics: number;
  nextExam: { subjectName: string; examDate: Date } | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard index={0}>
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </StatIcon>
        <p className="text-muted-foreground relative z-10 mt-4 text-sm">Total topics</p>
        <p className="font-serif relative z-10 mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {totalTopics}
        </p>
      </StatCard>

      <StatCard index={1}>
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
          </svg>
        </StatIcon>
        <p className="text-muted-foreground relative z-10 mt-4 text-sm">Done</p>
        <p className="font-serif relative z-10 mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {doneTopics}
        </p>
      </StatCard>

      <StatCard index={2}>
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </StatIcon>
        <p className="text-muted-foreground relative z-10 mt-4 text-sm">Next exam</p>
        <p className="font-serif relative z-10 mt-1 text-lg font-semibold tracking-tight">
          {nextExam ? (
            <>
              {nextExam.subjectName}{" "}
              <span className="text-muted-foreground font-sans text-sm font-normal">
                {formatDate(nextExam.examDate)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-lg font-semibold">None scheduled</span>
          )}
        </p>
      </StatCard>
    </div>
  );
}
