"use client";

import { useActionState, useEffect, useOptimistic, useState, useTransition } from "react";
import {
  editTopicAction,
  deleteTopicAction,
  moveTopicAction,
  toggleTopicAction,
} from "@/lib/actions/topics";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-context";

type Topic = {
  id: string;
  title: string;
  isDone: boolean;
};

export function TopicRow({
  topic,
  isFirst,
  isLast,
}: {
  topic: Topic;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    topic.isDone,
    (_current: boolean, next: boolean) => next,
  );
  const [, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [state, formAction, isPending] = useActionState(editTopicAction, undefined);
  const { showToast } = useToast();

  // showToast reaches into ToastProvider's state, so it needs an effect
  // (see subject-card.tsx).
  useEffect(() => {
    if (state?.ok) {
      showToast("Topic updated");
    }
  }, [state, showToast]);

  // Close the edit form once the save succeeds — derived during render
  // (see subject-card.tsx for why this isn't a useEffect).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) {
      setIsEditing(false);
    }
  }

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      setOptimisticDone(checked);
      await toggleTopicAction(topic.id, checked);
    });
  }

  async function handleConfirmDelete() {
    const formData = new FormData();
    formData.set("id", topic.id);
    await deleteTopicAction(formData);
    showToast(`"${topic.title}" deleted`);
  }

  if (isEditing) {
    return (
      <li className="border-border bg-surface rounded-lg border p-4 shadow-[4px_4px_0_0_var(--paper-shadow)]">
        <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="hidden" name="id" value={topic.id} />
          <input
            name="title"
            defaultValue={topic.title}
            required
            maxLength={200}
            autoFocus
            className="border-control bg-background flex-1 rounded-md border px-3.5 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
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
        {state?.error ? (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </li>
    );
  }

  return (
    <li className="border-border bg-surface group flex items-center gap-3 rounded-lg border p-3 shadow-[3px_3px_0_0_var(--paper-shadow)] transition-colors duration-200 hover:border-primary/40">
      <input
        type="checkbox"
        checked={optimisticDone}
        onChange={(event) => handleToggle(event.target.checked)}
        aria-label={`Mark "${topic.title}" as ${optimisticDone ? "not done" : "done"}`}
        className="accent-primary h-4.5 w-4.5 shrink-0 cursor-pointer"
      />
      <span
        className={`flex-1 text-sm transition-colors ${optimisticDone ? "text-muted-foreground line-through" : ""}`}
      >
        {topic.title}
      </span>
      <div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100">
        <form action={moveTopicAction}>
          <input type="hidden" name="id" value={topic.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={isFirst}
            aria-label={`Move "${topic.title}" up`}
            className="rounded-lg p-1.5 text-sm transition-colors hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ↑
          </button>
        </form>
        <form action={moveTopicAction}>
          <input type="hidden" name="id" value={topic.id} />
          <input type="hidden" name="direction" value="down" />
          <button
            type="submit"
            disabled={isLast}
            aria-label={`Move "${topic.title}" down`}
            className="rounded-lg p-1.5 text-sm transition-colors hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ↓
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit "${topic.title}"`}
          className="rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmingDelete(true)}
          aria-label={`Delete "${topic.title}"`}
          className="rounded-lg px-2 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        onConfirm={handleConfirmDelete}
        title={`Delete "${topic.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        isDangerous
      />
    </li>
  );
}
