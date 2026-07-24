"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTopicsAction } from "@/lib/actions/topics";
import { useToast } from "@/components/ui/toast-context";

export function AddTopicsForm({ subjectId }: { subjectId: string }) {
  const [state, formAction, isPending] = useActionState(addTopicsAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Topics added");
    }
  }, [state, showToast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)]"
    >
      <input type="hidden" name="subjectId" value={subjectId} />

      <div className="space-y-1.5">
        <label htmlFor="titles" className="text-sm font-medium">
          Add topics
        </label>
        <textarea
          id="titles"
          name="titles"
          required
          rows={4}
          placeholder={"One topic per line — paste your whole syllabus at once, or add a single topic.\ne.g.\nIntroduction to Thermodynamics\nFirst Law of Thermodynamics"}
          className="border-control bg-background w-full rounded-md border px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground self-start rounded-md px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
      >
        {isPending ? "Adding…" : "Add topics"}
      </button>
    </form>
  );
}
