"use client";

import { useEffect, useRef, useState } from "react";

export function ViewToggle({
  listView,
  calendarView,
}: {
  listView: React.ReactNode;
  calendarView: React.ReactNode;
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const listRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // Measures the active tab's real layout box rather than assuming a fixed
    // width, so the sliding pill stays correct regardless of label length,
    // font, or zoom level. Re-measures on resize since wrapping can change
    // a button's width.
    function measure() {
      const el = view === "list" ? listRef.current : calendarRef.current;
      if (el) {
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [view]);

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Dashboard view"
        className="border-control bg-surface relative inline-flex rounded-md border p-1"
      >
        <span
          aria-hidden="true"
          className="bg-primary absolute top-1 bottom-1 rounded transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        <button
          ref={listRef}
          type="button"
          role="tab"
          aria-selected={view === "list"}
          onClick={() => setView("list")}
          className={`relative z-10 rounded px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            view === "list" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          List
        </button>
        <button
          ref={calendarRef}
          type="button"
          role="tab"
          aria-selected={view === "calendar"}
          onClick={() => setView("calendar")}
          className={`relative z-10 rounded px-4 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            view === "calendar" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Calendar
        </button>
      </div>
      {view === "list" ? listView : calendarView}
    </div>
  );
}
