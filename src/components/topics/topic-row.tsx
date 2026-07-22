"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import {
  editTopicAction,
  deleteTopicAction,
  moveTopicAction,
  toggleTopicAction,
} from "@/lib/actions/topics";

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
  const [state, formAction, isPending] = useActionState(editTopicAction, undefined);

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

  function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${topic.title}"?`)) {
      event.preventDefault();
    }
  }

  if (isEditing) {
    return (
      <li className="border-border rounded-lg border p-3">
        <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="hidden" name="id" value={topic.id} />
          <input
            name="title"
            defaultValue={topic.title}
            required
            maxLength={200}
            autoFocus
            className="border-border bg-background flex-1 rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
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
        {state?.error ? (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </li>
    );
  }

  return (
    <li className="border-border flex items-center gap-3 rounded-lg border p-3">
      <input
        type="checkbox"
        checked={optimisticDone}
        onChange={(event) => handleToggle(event.target.checked)}
        aria-label={`Mark "${topic.title}" as ${optimisticDone ? "not done" : "done"}`}
        className="accent-primary h-4 w-4 shrink-0"
      />
      <span
        className={`flex-1 text-sm ${optimisticDone ? "text-muted-foreground line-through" : ""}`}
      >
        {topic.title}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <form action={moveTopicAction}>
          <input type="hidden" name="id" value={topic.id} />
          <input type="hidden" name="direction" value="up" />
          <button
            type="submit"
            disabled={isFirst}
            aria-label={`Move "${topic.title}" up`}
            className="rounded-md p-1.5 text-sm hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
            className="rounded-md p-1.5 text-sm hover:bg-surface disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ↓
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label={`Edit "${topic.title}"`}
          className="rounded-md px-2 py-1.5 text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Edit
        </button>
        <form action={deleteTopicAction} onSubmit={handleDeleteSubmit}>
          <input type="hidden" name="id" value={topic.id} />
          <button
            type="submit"
            aria-label={`Delete "${topic.title}"`}
            className="rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
