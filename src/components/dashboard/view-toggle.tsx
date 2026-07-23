"use client";

import { useState } from "react";

export function ViewToggle({
  listView,
  calendarView,
}: {
  listView: React.ReactNode;
  calendarView: React.ReactNode;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Dashboard view"
        className="border-control inline-flex rounded-md border p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          onClick={() => setView("list")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-surface"
          }`}
        >
          List
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "calendar"}
          onClick={() => setView("calendar")}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            view === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-surface"
          }`}
        >
          Calendar
        </button>
      </div>
      {view === "list" ? listView : calendarView}
    </div>
  );
}
