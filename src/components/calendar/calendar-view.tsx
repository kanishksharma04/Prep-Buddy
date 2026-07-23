"use client";

import { useMemo, useState } from "react";
import {
  getMonthGrid,
  dateKey,
  utcDateKey,
  eachUtcDateKeyInRange,
  MONTH_NAMES,
  WEEKDAY_LABELS,
} from "@/lib/calendar";
import { DayDetailDialog } from "./day-detail-dialog";
import { BulkClassLinksForm } from "./bulk-class-links-form";

type ExamMarker = {
  subjectId: string;
  subjectName: string;
  examDate: Date;
};

type ClassMarker = {
  id: string;
  title: string;
  link: string | null;
  subjectName: string | null;
  startDate: Date;
  endDate: Date;
};

type Subject = { id: string; name: string };

export function CalendarView({
  exams,
  classEvents,
  subjects,
}: {
  exams: ExamMarker[];
  classEvents: ClassMarker[];
  subjects: Subject[];
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const grid = useMemo(() => getMonthGrid(cursor.year, cursor.month, today), [cursor, today]);

  const examsByDay = useMemo(() => {
    const map = new Map<string, ExamMarker[]>();
    for (const exam of exams) {
      const key = utcDateKey(exam.examDate);
      const list = map.get(key) ?? [];
      list.push(exam);
      map.set(key, list);
    }
    return map;
  }, [exams]);

  const classesByDay = useMemo(() => {
    const map = new Map<string, ClassMarker[]>();
    for (const event of classEvents) {
      for (const key of eachUtcDateKeyInRange(event.startDate, event.endDate)) {
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
    }
    return map;
  }, [classEvents]);

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function goToToday() {
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
  }

  const selected = selectedKey
    ? {
        key: selectedKey,
        exams: (examsByDay.get(selectedKey) ?? []).map((exam) => ({
          subjectId: exam.subjectId,
          subjectName: exam.subjectName,
        })),
        classEvents: (classesByDay.get(selectedKey) ?? []).map((event) => ({
          id: event.id,
          title: event.title,
          link: event.link,
          subjectName: event.subjectName,
          startDate: event.startDate,
          endDate: event.endDate,
        })),
        label: (() => {
          const [y, m, d] = selectedKey.split("-").map(Number);
          return new Date(y, m - 1, d).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        })(),
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <BulkClassLinksForm subjects={subjects} />
      <div className="border-border rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="rounded-md p-2 text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">
              {MONTH_NAMES[cursor.month]} {cursor.year}
            </h2>
            <button
              type="button"
              onClick={goToToday}
              className="border-control rounded-md border px-2 py-1 text-xs font-medium hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Today
            </button>
          </div>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="rounded-md p-2 text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            →
          </button>
        </div>

        <div className="text-muted-foreground mb-1 grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            const key = dateKey(cell.year, cell.month, cell.day);
            const dayExams = examsByDay.get(key) ?? [];
            const dayClasses = classesByDay.get(key) ?? [];
            const totalEvents = dayExams.length + dayClasses.length;
            const hasContent = totalEvents > 0;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                aria-label={`${MONTH_NAMES[cell.month]} ${cell.day}, ${cell.year}${hasContent ? `, ${totalEvents} event${totalEvents === 1 ? "" : "s"}` : ""}`}
                className={`flex min-h-16 flex-col items-start gap-0.5 rounded-md border p-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-20 ${
                  cell.isCurrentMonth ? "border-border" : "border-transparent opacity-40"
                } ${cell.isToday ? "border-primary" : "hover:bg-surface"}`}
              >
                <span className={`text-xs font-medium ${cell.isToday ? "text-primary" : ""}`}>
                  {cell.day}
                </span>
                {dayExams.slice(0, 1).map((exam) => (
                  <span
                    key={exam.subjectId}
                    className="w-full truncate rounded bg-red-600 px-1 py-0.5 text-[10px] font-medium text-white dark:bg-red-700"
                  >
                    {exam.subjectName}
                  </span>
                ))}
                {dayClasses.slice(0, dayExams.length > 0 ? 1 : 2).map((event) => (
                  <span
                    key={event.id}
                    className="bg-primary text-primary-foreground w-full truncate rounded px-1 py-0.5 text-[10px] font-medium"
                  >
                    {event.title}
                  </span>
                ))}
                {totalEvents > 2 ? (
                  <span className="text-muted-foreground text-[10px]">+{totalEvents - 2} more</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {selected ? (
          <DayDetailDialog
            dayKey={selected.key}
            label={selected.label}
            exams={selected.exams}
            classEvents={selected.classEvents}
            subjects={subjects}
            onClose={() => setSelectedKey(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
