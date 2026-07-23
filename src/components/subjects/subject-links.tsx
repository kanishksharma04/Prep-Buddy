"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSubjectLinkAction, deleteSubjectLinkAction } from "@/lib/actions/subject-links";
import { useToast } from "@/components/ui/toast-context";

type SubjectLinkItem = { id: string; title: string; url: string };

export function SubjectLinks({
  subjectId,
  links,
}: {
  subjectId: string;
  links: SubjectLinkItem[];
}) {
  const [state, formAction, isPending] = useActionState(createSubjectLinkAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Link added");
    }
  }, [state, showToast]);

  async function handleDelete(id: string, title: string) {
    const formData = new FormData();
    formData.set("id", id);
    await deleteSubjectLinkAction(formData);
    showToast(`"${title}" removed`);
  }

  return (
    <div className="border-border rounded-lg border p-4">
      <h2 className="text-sm font-medium">Important links</h2>
      <p className="text-muted-foreground text-xs">
        Notes, resources, or references for this subject — a syllabus PDF, a shared doc, anything
        worth keeping handy.
      </p>

      {links.length === 0 ? (
        <p className="text-muted-foreground mt-3 text-sm">No links added yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {links.map((link) => (
            <li
              key={link.id}
              className="border-border flex items-center justify-between gap-2 rounded-md border p-2"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary min-w-0 truncate text-sm font-medium hover:underline"
              >
                {link.title}
              </a>
              <button
                type="button"
                onClick={() => handleDelete(link.id, link.title)}
                aria-label={`Remove "${link.title}"`}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-red-400 dark:hover:bg-red-950"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="subjectId" value={subjectId} />
        <div className="flex-1 space-y-1.5">
          <label htmlFor="link-title" className="text-xs font-medium">
            Title
          </label>
          <input
            id="link-title"
            name="title"
            required
            maxLength={100}
            placeholder="e.g. Syllabus PDF"
            className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="link-url" className="text-xs font-medium">
            URL
          </label>
          <input
            id="link-url"
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {isPending ? "Adding…" : "Add link"}
        </button>
      </form>

      {state?.error ? (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
