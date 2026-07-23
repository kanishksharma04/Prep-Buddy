"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSubjectAction } from "@/lib/actions/subjects";
import { useToast } from "@/components/ui/toast-context";

export function CreateSubjectForm() {
  const [state, formAction, isPending] = useActionState(createSubjectAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Subject added");
    }
  }, [state, showToast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4 transition-shadow duration-200 hover:shadow-sm sm:flex-row sm:items-end"
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
          className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
          className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground hover:shadow-primary/30 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {isPending ? "Adding…" : "+ Add subject"}
      </button>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 sm:basis-full dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
