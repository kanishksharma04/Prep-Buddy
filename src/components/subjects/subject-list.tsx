"use client";

import { useState } from "react";
import { SubjectCard } from "./subject-card";
import { useDragReorder } from "@/lib/use-drag-reorder";
import { reorderSubjectsAction } from "@/lib/actions/subjects";
import type { PaceResult } from "@/lib/pace";

type Subject = {
  id: string;
  name: string;
  examDate: Date | null;
  topicsTotal: number;
  topicsDone: number;
};

export function SubjectList({
  subjectsByExam,
  subjectsByOrder,
  paceById,
}: {
  subjectsByExam: Subject[];
  subjectsByOrder: Subject[];
  paceById: Record<string, PaceResult | null>;
}) {
  const [sortMode, setSortMode] = useState<"exam" | "manual">("exam");
  const { displayItems, getHandleProps, getTargetProps, isItemDragging } = useDragReorder(
    subjectsByOrder,
    (orderedIds) => {
      reorderSubjectsAction(orderedIds);
    },
  );

  const items = sortMode === "exam" ? subjectsByExam : displayItems;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <span className="text-muted-foreground text-xs font-medium">Sort:</span>
        <div
          role="tablist"
          aria-label="Subject sort order"
          className="border-control bg-surface inline-flex rounded-md border p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={sortMode === "exam"}
            onClick={() => setSortMode("exam")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              sortMode === "exam"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Nearest exam
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sortMode === "manual"}
            onClick={() => setSortMode("manual")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              sortMode === "manual"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My order
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            index={index}
            pace={paceById[subject.id] ?? null}
            isManualSort={sortMode === "manual"}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            dragHandleProps={sortMode === "manual" ? getHandleProps(subject.id) : undefined}
            dragTargetProps={sortMode === "manual" ? getTargetProps(subject.id) : undefined}
            isBeingDragged={sortMode === "manual" && isItemDragging(subject.id)}
          />
        ))}
      </ul>
    </div>
  );
}
