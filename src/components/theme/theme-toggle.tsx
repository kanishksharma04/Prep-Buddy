"use client";

import { useEffect, useRef, useState } from "react";

type ThemeMode = "light" | "system" | "dark";

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", isDark);
}

// Three-way Light/System/Dark, reusing the same sliding-segment pattern as
// ViewToggle and the subject sort control — a binary sun/moon switch can't
// represent "follow the OS" as a state you can return to, only as an
// invisible default you lose the instant you touch the toggle once.
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<Record<ThemeMode, HTMLButtonElement | null>>({
    light: null,
    system: null,
    dark: null,
  });

  useEffect(() => {
    // theme-init-script.ts already applied the real class before paint;
    // this just syncs this control's own `mode` (used for the slider
    // position and aria-checked) to match — same mount-effect pattern as
    // useCountdown, to avoid a hydration mismatch between the server's
    // default and whatever was actually stored/preferred client-side.
    const stored = localStorage.getItem("theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(stored === "dark" || stored === "light" ? stored : "system");
  }, []);

  // In "system" mode, keep following the OS live instead of only checking
  // it once at mount/toggle time.
  useEffect(() => {
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      applyTheme("system");
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [mode]);

  useEffect(() => {
    function measure() {
      const el = buttonRefs.current[mode];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mode]);

  function selectMode(next: ThemeMode) {
    setMode(next);
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
    applyTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="border-control bg-surface relative inline-flex items-center gap-0.5 rounded-full border p-1"
    >
      <span
        aria-hidden="true"
        className={`bg-primary absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out ${indicator.width > 0 ? "opacity-100" : "opacity-0"}`}
        style={{ left: indicator.left, width: indicator.width }}
      />

      <button
        ref={(el) => {
          buttonRefs.current.light = el;
        }}
        type="button"
        role="radio"
        aria-checked={mode === "light"}
        aria-label="Light theme"
        onClick={() => selectMode("light")}
        className={`relative z-10 flex h-6.5 w-6.5 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          mode === "light" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-3.5 w-3.5"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>

      <button
        ref={(el) => {
          buttonRefs.current.system = el;
        }}
        type="button"
        role="radio"
        aria-checked={mode === "system"}
        aria-label="Match system theme"
        onClick={() => selectMode("system")}
        className={`relative z-10 flex h-6.5 w-6.5 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          mode === "system" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" />
        </svg>
      </button>

      <button
        ref={(el) => {
          buttonRefs.current.dark = el;
        }}
        type="button"
        role="radio"
        aria-checked={mode === "dark"}
        aria-label="Dark theme"
        onClick={() => selectMode("dark")}
        className={`relative z-10 flex h-6.5 w-6.5 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          mode === "dark" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-3.5 w-3.5"
        >
          <path d="M20.7 14.9a8.5 8.5 0 1 1-9.6-13 7 7 0 0 0 9.6 13Z" />
        </svg>
      </button>
    </div>
  );
}
