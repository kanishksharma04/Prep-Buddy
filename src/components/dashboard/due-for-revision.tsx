"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { markRevisedAction, resetRevisionAction } from "@/lib/actions/topics";
import { RevisionQuizDialog } from "@/components/topics/revision-quiz-dialog";
import { REVISION_INTERVALS_DAYS } from "@/lib/revision";
import { useToast } from "@/components/ui/toast-context";

type DueTopic = {
  id: string;
  title: string;
  note: string | null;
  quizQuestion: string | null;
  quizAnswer: string | null;
  subjectId: string;
  subjectName: string;
  revisionStage: number;
};

export function DueForRevision({
  dueTopics,
  totalEligible,
}: {
  dueTopics: DueTopic[];
  totalEligible: number;
}) {
  const [optimisticDue, setOptimisticDue] = useOptimistic(
    dueTopics,
    (current, revisedId: string) => current.filter((topic) => topic.id !== revisedId),
  );
  const [, startTransition] = useTransition();
  const [quizTopic, setQuizTopic] = useState<DueTopic | null>(null);
  const { showToast } = useToast();

  function handleGotIt(topic: DueTopic) {
    startTransition(async () => {
      setOptimisticDue(topic.id);
      await markRevisedAction(topic.id);
      showToast(`"${topic.title}" revised`);
    });
  }

  function handleStillFuzzy(topic: DueTopic) {
    // Also resolves the "due right now" state (rescheduled a day out from
    // this moment), so it leaves the list the same way a correct recall
    // does — just without advancing the schedule.
    startTransition(async () => {
      setOptimisticDue(topic.id);
      await resetRevisionAction(topic.id);
      showToast(`"${topic.title}" back to day 1`);
    });
  }

  return (
    <div className="border-border bg-surface rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--paper-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Due for revision</h2>
        {optimisticDue.length > 0 ? (
          <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-sm font-semibold">
            {optimisticDue.length} due
          </span>
        ) : null}
      </div>

      {optimisticDue.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">
          {totalEligible === 0
            ? "Complete some topics to start your spaced-revision schedule."
            : "All caught up — nothing due for review right now."}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col">
          {optimisticDue.map((topic) => (
            <li
              key={topic.id}
              className="border-border hover:bg-background -mx-2 flex items-center justify-between gap-3 border-t px-2 py-2.5 transition-colors first:border-t-0 first:pt-0"
            >
              <div className="min-w-0">
                <Link
                  href={`/subjects/${topic.subjectId}`}
                  className="rounded-md text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {topic.title}
                </Link>
                <p className="text-muted-foreground truncate text-xs">
                  {topic.subjectName} · Day {REVISION_INTERVALS_DAYS[topic.revisionStage]} review
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuizTopic(topic)}
                className="border-control shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Revise
              </button>
            </li>
          ))}
        </ul>
      )}

      <RevisionQuizDialog
        open={quizTopic !== null}
        onOpenChange={(open) => {
          if (!open) setQuizTopic(null);
        }}
        topicId={quizTopic?.id ?? ""}
        title={quizTopic?.title ?? ""}
        note={quizTopic?.note ?? null}
        initialQuestion={quizTopic?.quizQuestion ?? null}
        initialAnswer={quizTopic?.quizAnswer ?? null}
        onGotIt={() => {
          if (quizTopic) handleGotIt(quizTopic);
        }}
        onStillFuzzy={() => {
          if (quizTopic) handleStillFuzzy(quizTopic);
        }}
      />
    </div>
  );
}
