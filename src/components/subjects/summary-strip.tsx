import { formatDate } from "@/lib/format";

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110">
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
    <div className="border-border sm:divide-border grid grid-cols-1 rounded-lg border sm:grid-cols-3 sm:divide-x">
      <div className="group flex items-center gap-3 p-4 transition-colors hover:bg-surface">
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4.5 w-4.5"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </StatIcon>
        <div>
          <p className="text-muted-foreground text-sm">Total topics</p>
          <p className="text-lg font-semibold">{totalTopics}</p>
        </div>
      </div>

      <div className="group flex items-center gap-3 p-4 transition-colors hover:bg-surface">
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4.5 w-4.5"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
          </svg>
        </StatIcon>
        <div>
          <p className="text-muted-foreground text-sm">Done</p>
          <p className="text-lg font-semibold">{doneTopics}</p>
        </div>
      </div>

      <div className="group flex items-center gap-3 p-4 transition-colors hover:bg-surface">
        <StatIcon>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4.5 w-4.5"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </StatIcon>
        <div>
          <p className="text-muted-foreground text-sm">Next exam</p>
          <p className="text-lg font-semibold">
            {nextExam ? (
              <>
                {nextExam.subjectName}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  {formatDate(nextExam.examDate)}
                </span>
              </>
            ) : (
              "None scheduled"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
