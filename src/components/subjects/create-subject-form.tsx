"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSubjectAction } from "@/lib/actions/subjects";

export function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubjectAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <label htmlFor="new-subject-name" className="text-sm font-medium">
          Subject name
        </label>
        <input
          id="new-subject-name"
          name="name"
          required
          maxLength={100}
          placeholder="e.g. Organic Chemistry"
          className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="new-subject-exam-date" className="text-sm font-medium">
          Exam date
        </label>
        <input
          id="new-subject-exam-date"
          name="examDate"
          type="date"
          className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {isPending ? "Adding…" : "Add subject"}
      </button>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 sm:basis-full dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
