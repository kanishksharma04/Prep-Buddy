"use client";

import { useActionState, useEffect } from "react";
import { updateExamDateAction } from "@/lib/actions/subjects";
import { toDateInputValue } from "@/lib/format";
import { useToast } from "@/components/ui/toast-context";

export function ExamDatePicker({
  subjectId,
  examDate,
}: {
  subjectId: string;
  examDate: Date | null;
}) {
  const [state, formAction, isPending] = useActionState(updateExamDateAction, undefined);
  const { showToast } = useToast();

  // showToast reaches into ToastProvider's state (a different component),
  // so it must run in an effect, not during render (see subject-card.tsx).
  useEffect(() => {
    if (state?.ok) {
      showToast("Exam date updated");
    }
  }, [state, showToast]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={subjectId} />
      <div className="space-y-1.5">
        <label htmlFor="exam-date" className="text-sm font-medium">
          Exam date
        </label>
        <input
          id="exam-date"
          name="examDate"
          type="date"
          defaultValue={toDateInputValue(examDate)}
          className="border-control bg-background rounded-md border px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
      >
        {isPending ? "Saving…" : "Save date"}
      </button>
      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 sm:basis-full dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
