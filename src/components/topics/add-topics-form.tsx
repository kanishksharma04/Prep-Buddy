"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTopicsAction } from "@/lib/actions/topics";

export function AddTopicsForm({ subjectId }: { subjectId: string }) {
  const [state, formAction, isPending] = useActionState(addTopicsAction, undefined);
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
      className="border-border flex flex-col gap-3 rounded-lg border p-4"
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
          className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
        className="bg-primary text-primary-foreground self-start rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {isPending ? "Adding…" : "Add topics"}
      </button>
    </form>
  );
}
