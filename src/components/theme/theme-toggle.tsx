"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // theme-init-script.ts already set the real class before hydration; this
    // just syncs React's `isDark` (used for aria-checked) to match it, the
    // same mount-effect pattern used by useCountdown to avoid a hydration
    // mismatch between the server's default and the client's stored theme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="relative inline-flex h-7 w-14 shrink-0 items-center overflow-hidden rounded-full bg-linear-to-br from-sky-300 to-sky-500 shadow-inner transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:from-slate-800 dark:to-slate-950"
    >
      {/* stars, visible in dark mode, opposite the moon which sits on the right */}
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-2 h-0.5 w-0.5 rounded-full bg-white opacity-0 transition-opacity duration-500 dark:opacity-90"
      />
      <span
        aria-hidden="true"
        className="absolute top-4.5 left-3.5 h-0.5 w-0.5 rounded-full bg-white opacity-0 transition-opacity duration-500 dark:opacity-70"
      />
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-6 h-px w-px rounded-full bg-white opacity-0 transition-opacity duration-500 dark:opacity-80"
      />

      {/* clouds, visible in light mode, opposite the sun which sits on the left */}
      <span
        aria-hidden="true"
        className="absolute top-3.5 right-1.5 h-2.5 w-4.5 rounded-full bg-white/80 opacity-100 transition-opacity duration-500 dark:opacity-0"
      />
      <span
        aria-hidden="true"
        className="absolute top-1.5 right-3 h-2 w-3.5 rounded-full bg-white/70 opacity-100 transition-opacity duration-500 dark:opacity-0"
      />

      {/* sliding thumb: sun in light mode, moon in dark mode */}
      <span
        aria-hidden="true"
        className="absolute top-1 left-1 z-10 h-5 w-5 rounded-full shadow-md transition-transform duration-500 dark:translate-x-7"
      >
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-yellow-200 via-amber-300 to-orange-400 opacity-100 transition-opacity duration-500 dark:opacity-0" />
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-slate-200 to-slate-400 opacity-0 transition-opacity duration-500 dark:opacity-100">
          <span className="absolute top-1 left-1 h-1 w-1 rounded-full bg-slate-400/70" />
          <span className="absolute right-1 bottom-1.5 h-1.5 w-1.5 rounded-full bg-slate-400/60" />
        </span>
      </span>
    </button>
  );
}
