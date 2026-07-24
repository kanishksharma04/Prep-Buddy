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
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)] sm:flex-row sm:items-end"
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
          className="border-control bg-background w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
          className="border-control bg-background w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground shrink-0 rounded-md px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
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
