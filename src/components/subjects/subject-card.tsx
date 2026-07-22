"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { renameSubjectAction, deleteSubjectAction } from "@/lib/actions/subjects";
import { formatDate, toDateInputValue } from "@/lib/format";

type Subject = {
  id: string;
  name: string;
  examDate: Date | null;
};

export function SubjectCard({ subject }: { subject: Subject }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(renameSubjectAction, undefined);

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

  function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Delete "${subject.name}"? This also deletes all of its topics.`,
    );
    if (!confirmed) {
      event.preventDefault();
    }
  }

  if (isEditing) {
    return (
      <li className="border-border rounded-lg border p-4">
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
              className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
              className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
              className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="border-border rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border-border flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <Link
          href={`/subjects/${subject.id}`}
          className="font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {subject.name}
        </Link>
        <p className="text-muted-foreground text-sm">
          {subject.examDate ? `Exam: ${formatDate(subject.examDate)}` : "No exam date set"}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/subjects/${subject.id}`}
          className="border-border rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Topics
        </Link>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="border-border rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Rename
        </button>
        <form action={deleteSubjectAction} onSubmit={handleDeleteSubmit}>
          <input type="hidden" name="id" value={subject.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
