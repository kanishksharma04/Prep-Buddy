"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastVariant = "success" | "error";

type ToastAction = { label: string; onClick: () => void };

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
  leaving: boolean;
};

type ToastOptions = { action?: ToastAction; durationMs?: number };

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;
const TOAST_EXIT_MS = 220;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    // Mark it leaving first so toast-out actually plays, then drop it from
    // the array once the exit animation has had time to finish — an
    // immediate filter() would just snap it away.
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success", options?: ToastOptions) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, message, variant, action: options?.action, leaving: false }]);
      setTimeout(() => dismissToast(id), options?.durationMs ?? TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Note: a toast's action button (e.g. "Undo") is only clickable
          while no native <dialog> is open via showModal() — a modal
          dialog makes every other top-level node inert per the HTML spec,
          which blocks pointer events here regardless of z-index. Callers
          that fire a toast from inside an open dialog (see
          DayDetailDialog) render their own inline undo affordance instead
          of relying on this button. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex -rotate-1 items-center gap-2.5 rounded-md border px-4 py-3 text-sm font-medium shadow-[4px_4px_0_0_var(--paper-shadow)] ${
              toast.variant === "error"
                ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                : "border-border bg-surface text-foreground"
            }`}
            style={{
              animation: toast.leaving
                ? `toast-out ${TOAST_EXIT_MS}ms ease-in forwards`
                : "toast-in 0.25s ease-out",
            }}
          >
            {toast.variant === "error" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4.5 w-4.5 shrink-0"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-4.5 w-4.5 shrink-0"
              >
                <circle cx="12" cy="12" r="9" className="fill-primary" />
                <path
                  d="M8.5 12.5l2.5 2.5 4.5-5"
                  stroke="var(--primary-foreground)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action!.onClick();
                  dismissToast(toast.id);
                }}
                className="text-primary decoration-2 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
