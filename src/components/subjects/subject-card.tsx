"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { renameSubjectAction, deleteSubjectAction } from "@/lib/actions/subjects";
import { formatDate, toDateInputValue } from "@/lib/format";
import { Countdown } from "@/components/subjects/countdown";
import { ProgressBar } from "@/components/subjects/progress-bar";
import { PaceBadge } from "@/components/subjects/pace-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-context";
import { useCountdown } from "@/lib/use-countdown";
import type { PaceResult } from "@/lib/pace";

type Subject = {
  id: string;
  name: string;
  examDate: Date | null;
  topicsTotal: number;
  topicsDone: number;
};

// Washi-tape strip pinning each card down — the urgency signal, replacing a
// plain accent border with something that fits the index-card motif.
const TAPE_CLASSES = {
  green: "bg-green-600/60 dark:bg-green-500/50",
  amber: "bg-amber-500/60 dark:bg-amber-400/50",
  red: "bg-red-600/60 dark:bg-red-500/50",
  grey: "bg-muted-foreground/30",
} as const;

// Alternating tilt per card, like index cards dropped on a desk rather than
// perfectly stacked — straightens out on hover.
const TILT_CLASSES = ["rotate-[-0.6deg]", "rotate-[0.5deg]", "rotate-[-0.4deg]"] as const;

export function SubjectCard({
  subject,
  index = 0,
  pace = null,
}: {
  subject: Subject;
  index?: number;
  pace?: PaceResult | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [state, formAction, isPending] = useActionState(renameSubjectAction, undefined);
  const { showToast } = useToast();
  const countdown = useCountdown(subject.examDate);
  const urgency = countdown?.urgency ?? "grey";
  const tapeClass = TAPE_CLASSES[urgency];
  const tiltClass = TILT_CLASSES[index % TILT_CLASSES.length];

  // showToast reaches into ToastProvider's state — a different component —
  // so it must run in an effect, not during render (unlike setIsEditing,
  // this component's own state, which the derived-render pattern below
  // updates safely without one).
  useEffect(() => {
    if (state?.ok) {
      showToast(`"${subject.name}" updated`);
    }
  }, [state, showToast, subject.name]);

  // Close the edit form once the rename succeeds. Derived during render
  // (React's recommended pattern) rather than in a useEffect, which would
  // cause an extra cascading render.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) {
      setIsEditing(false);
    }
  }

  async function handleConfirmDelete() {
    const formData = new FormData();
    formData.set("id", subject.id);
    await deleteSubjectAction(formData);
    showToast(`"${subject.name}" deleted`);
  }

  if (isEditing) {
    return (
      <li className="border-border bg-surface rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)]">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="id" value={subject.id} />
          <div className="space-y-1.5">
            <label htmlFor={`name-${subject.id}`} className="text-sm font-medium">
              Subject name
            </label>
            <input
              id={`name-${subject.id}`}
              name="name"
              defaultValue={subject.name}
              required
              maxLength={100}
              className="border-control bg-background w-full rounded-md border px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`examDate-${subject.id}`} className="text-sm font-medium">
              Exam date
            </label>
            <input
              id={`examDate-${subject.id}`}
              name="examDate"
              type="date"
              defaultValue={toDateInputValue(subject.examDate)}
              className="border-control bg-background w-full rounded-md border px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>

          {state?.error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="border-control rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      style={{ transformOrigin: "center" }}
      className={`group border-border bg-surface relative flex flex-col gap-3 rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] transition-all duration-200 hover:-translate-y-1 hover:rotate-0 hover:shadow-[6px_6px_0_0_var(--paper-shadow)] ${tiltClass}`}
    >
      {/* washi tape pinning the card down — colored by exam urgency */}
      <div
        aria-hidden="true"
        className={`absolute -top-2.5 left-8 h-5 w-16 -rotate-3 ${tapeClass} shadow-sm`}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/subjects/${subject.id}`}
            className="group/link inline-flex items-center gap-1 rounded-md text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="group-hover/link:text-primary transition-colors group-hover/link:underline">
              {subject.name}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
          <p className="text-muted-foreground text-sm">
            {subject.examDate ? `Exam: ${formatDate(subject.examDate)}` : "No exam date set"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="border-control rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            aria-label={`Delete "${subject.name}"`}
            className="rounded-md border border-red-300 p-2 text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
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
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-48 flex-1 space-y-1.5">
          <ProgressBar total={subject.topicsTotal} done={subject.topicsDone} />
          <PaceBadge pace={pace} />
        </div>
        <Countdown examDate={subject.examDate} />
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete "${subject.name}"?`}
        description="This also deletes all of its topics. This can't be undone."
        confirmLabel="Delete"
        isDangerous
      />
    </li>
  );
}
