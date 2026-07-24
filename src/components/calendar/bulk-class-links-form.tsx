"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createClassLinksForSubjectsAction } from "@/lib/actions/class-events";
import { useToast } from "@/components/ui/toast-context";

type Subject = { id: string; name: string };

type Row = {
  key: string;
  subjectId: string;
};

let rowKeyCounter = 0;
function nextRowKey() {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

export function BulkClassLinksForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, isPending] = useActionState(
    createClassLinksForSubjectsAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);

  // Ref access (form.reset()) and cross-component state (showToast() reaches
  // into ToastProvider's state) both must happen in an effect, never during
  // render — unlike this component's OWN state, which the derived-render
  // pattern below updates safely without one.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Class links saved");
    }
  }, [state, showToast]);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) {
      setRows([]);
    }
  }

  function addRow() {
    const usedIds = new Set(rows.map((r) => r.subjectId));
    const firstUnused = subjects.find((s) => !usedIds.has(s.id));
    setRows((prev) => [
      ...prev,
      { key: nextRowKey(), subjectId: firstUnused?.id ?? subjects[0]?.id ?? "" },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  function updateRowSubject(key: string, subjectId: string) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, subjectId } : row)));
  }

  if (subjects.length === 0) {
    return null;
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-border bg-surface flex flex-col gap-3 rounded-lg border p-5 shadow-[4px_4px_0_0_var(--paper-shadow)]"
    >
      <div>
        <h3 className="font-serif text-base font-semibold">Add class dates &amp; join links</h3>
        <p className="text-muted-foreground text-xs">
          Add a row per subject that has online classes, pick a date range and paste the join
          link, then save them all at once.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No rows yet — add one for each subject that has an online class.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div
              key={row.key}
              className="border-border bg-background flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center"
            >
              <select
                aria-label="Subject"
                value={row.subjectId}
                onChange={(event) => updateRowSubject(row.key, event.target.value)}
                name="subjectId[]"
                className="border-control bg-background rounded-md border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-40 sm:shrink-0"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="startDate[]"
                aria-label="Start date"
                className="border-control bg-background rounded-md border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-40"
              />
              <input
                type="date"
                name="endDate[]"
                aria-label="End date (optional — defaults to start date)"
                className="border-control bg-background rounded-md border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-40"
              />
              <input
                type="url"
                name="link[]"
                placeholder="Join class link (optional)"
                aria-label="Join class link"
                className="border-control bg-background w-full rounded-md border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label="Remove row"
                className="shrink-0 rounded-md px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-red-400 dark:hover:bg-red-950"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="border-control rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + Add subject
        </button>
        {rows.length > 0 ? (
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
          >
            {isPending ? "Saving…" : "Save all"}
          </button>
        ) : null}
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
