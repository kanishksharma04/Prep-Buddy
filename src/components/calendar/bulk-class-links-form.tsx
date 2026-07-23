"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClassLinksForSubjectsAction } from "@/lib/actions/class-events";
import { useToast } from "@/components/ui/toast-context";

type Subject = { id: string; name: string };

export function BulkClassLinksForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, isPending] = useActionState(
    createClassLinksForSubjectsAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Class links saved");
    }
  }, [state, showToast]);

  if (subjects.length === 0) {
    return null;
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border flex flex-col gap-3 rounded-lg border p-4"
    >
      <div>
        <h3 className="text-sm font-medium">Add class dates &amp; join links</h3>
        <p className="text-muted-foreground text-xs">
          Pick a date and paste the join-class link for each subject, then save them all at once.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium sm:w-40 sm:shrink-0 sm:truncate">
              {subject.name}
            </span>
            <input
              type="date"
              name={`date-${subject.id}`}
              aria-label={`Class date for ${subject.name}`}
              className="border-control bg-background rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-44"
            />
            <input
              type="url"
              name={`link-${subject.id}`}
              placeholder="Join class link (optional)"
              aria-label={`Join class link for ${subject.name}`}
              className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
        ))}
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
        {isPending ? "Saving…" : "Save all"}
      </button>
    </form>
  );
}
