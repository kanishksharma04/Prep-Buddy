import { formatDate } from "@/lib/format";

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
    <div className="border-border grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
      <div>
        <p className="text-muted-foreground text-sm">Total topics</p>
        <p className="text-lg font-semibold">{totalTopics}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Done</p>
        <p className="text-lg font-semibold">{doneTopics}</p>
      </div>
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
  );
}
