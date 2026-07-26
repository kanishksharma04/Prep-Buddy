import { formatDate } from "@/lib/format";

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-serif truncate text-base font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

// A single compact card of stacked rows — this used to be three separate
// tilted stat cards side by side, but that layout only works at the
// full main-column width. Now that this lives in the dashboard's sidebar
// rail (see dashboard/page.tsx), a narrow stacked list is what actually
// stays legible regardless of viewport width.
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
    <div className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-5 shadow-[3px_3px_0_0_var(--paper-shadow)]">
      <SummaryRow
        icon={
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
        }
        label="Total topics"
        value={totalTopics}
      />
      <SummaryRow
        icon={
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
        }
        label="Done"
        value={doneTopics}
      />
      <SummaryRow
        icon={
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
        }
        label="Next exam"
        value={
          nextExam ? (
            <>
              {nextExam.subjectName}{" "}
              <span className="text-muted-foreground text-xs font-normal">
                {formatDate(nextExam.examDate)}
              </span>
            </>
          ) : (
            "None scheduled"
          )
        }
      />
    </div>
  );
}
