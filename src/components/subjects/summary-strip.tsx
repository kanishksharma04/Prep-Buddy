import { formatDate } from "@/lib/format";

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-primary/15 to-accent/10 text-primary relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br transition-transform duration-300 group-hover:scale-110">
      {children}
    </div>
  );
}

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group border-border/60 bg-surface/60 relative overflow-hidden rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div
        aria-hidden="true"
        className="bg-primary/10 absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard>
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
        <p className="relative z-10 mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {totalTopics}
        </p>
      </StatCard>

      <StatCard>
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
        <p className="relative z-10 mt-1 text-3xl font-bold tracking-tight tabular-nums">
          {doneTopics}
        </p>
      </StatCard>

      <StatCard>
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
        <p className="relative z-10 mt-1 text-lg font-bold tracking-tight">
          {nextExam ? (
            <>
              {nextExam.subjectName}{" "}
              <span className="text-muted-foreground text-sm font-normal">
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
