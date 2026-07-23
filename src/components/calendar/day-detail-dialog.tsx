"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClassEventAction, deleteClassEventAction } from "@/lib/actions/class-events";
import { useToast } from "@/components/ui/toast-context";
import { utcDateKey, utcDateToLocalCalendarDate } from "@/lib/calendar";

type ExamMarker = { subjectId: string; subjectName: string };
type ClassMarker = {
  id: string;
  title: string;
  link: string | null;
  subjectName: string | null;
  startDate: Date;
  endDate: Date;
};
type Subject = { id: string; name: string };

function formatRange(start: Date, end: Date): string | null {
  if (utcDateKey(start) === utcDateKey(end)) return null;
  const fmt = (d: Date) =>
    utcDateToLocalCalendarDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function DayDetailDialog({
  dayKey,
  label,
  exams,
  classEvents,
  subjects,
  onClose,
}: {
  dayKey: string;
  label: string;
  exams: ExamMarker[];
  classEvents: ClassMarker[];
  subjects: Subject[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(createClassEventAction, undefined);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Ref access (form.reset()) must happen in an effect, never during render
  // — unlike plain setState, which the derived-render pattern elsewhere in
  // this codebase handles without an effect.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      showToast("Class added");
    }
  }, [state, showToast]);

  async function handleDelete(id: string, title: string) {
    const formData = new FormData();
    formData.set("id", id);
    await deleteClassEventAction(formData);
    showToast(`"${title}" removed`);
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      className="bg-background text-foreground border-border m-auto w-full max-w-md rounded-lg border p-0 backdrop:bg-black/50"
    >
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{label}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ✕
          </button>
        </div>

        {exams.length > 0 ? (
          <div className="mb-4 space-y-1.5">
            <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Exams
            </h3>
            {exams.map((exam) => (
              <Link
                key={exam.subjectId}
                href={`/subjects/${exam.subjectId}`}
                className="block rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-red-700"
              >
                Exam: {exam.subjectName}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mb-4 space-y-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Classes
          </h3>
          {classEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No classes added for this day yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {classEvents.map((event) => (
                <li
                  key={event.id}
                  className="border-border flex items-center justify-between gap-2 rounded-md border p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    {event.subjectName ? (
                      <p className="text-muted-foreground text-xs">{event.subjectName}</p>
                    ) : null}
                    {formatRange(event.startDate, event.endDate) ? (
                      <p className="text-muted-foreground text-xs">
                        {formatRange(event.startDate, event.endDate)}
                      </p>
                    ) : null}
                    {event.link ? (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-block text-xs font-medium hover:underline"
                      >
                        Join class →
                      </a>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id, event.title)}
                    aria-label={`Remove "${event.title}"`}
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form ref={formRef} action={formAction} className="border-border space-y-3 border-t pt-4">
          <input type="hidden" name="startDate" value={dayKey} />
          <h3 className="text-sm font-medium">Add a class</h3>
          <div className="space-y-1.5">
            <label htmlFor="class-title" className="text-xs font-medium">
              Title
            </label>
            <input
              id="class-title"
              name="title"
              required
              maxLength={100}
              placeholder="e.g. Chemistry lecture"
              className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="class-end-date" className="text-xs font-medium">
              End date (optional — for multi-day classes)
            </label>
            <input
              id="class-end-date"
              name="endDate"
              type="date"
              min={dayKey}
              className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="class-link" className="text-xs font-medium">
              Link (optional)
            </label>
            <input
              id="class-link"
              name="link"
              type="url"
              placeholder="https://..."
              className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </div>
          {subjects.length > 0 ? (
            <div className="space-y-1.5">
              <label htmlFor="class-subject" className="text-xs font-medium">
                Subject (optional)
              </label>
              <select
                id="class-subject"
                name="subjectId"
                defaultValue=""
                className="border-control bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="">None</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="subjectId" value="" />
          )}

          {state?.error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground w-full rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {isPending ? "Adding…" : "Add class"}
          </button>
        </form>
      </div>
    </dialog>
  );
}
