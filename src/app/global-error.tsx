"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col">
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="flex h-14 w-14 -rotate-3 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-7 w-7"
            >
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
