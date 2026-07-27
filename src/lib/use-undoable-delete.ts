"use client";

import { useToast } from "@/components/ui/toast-context";

// Matches the toast's own duration exactly — the "Undo" button and the
// point where the deletion actually commits should disappear at the same
// moment, not one before the other.
const UNDO_WINDOW_MS = 5000;

// Gmail-style delayed delete: nothing is actually removed server-side
// until this window passes. The caller hides the item immediately
// (optimistic) and restores it if `undo` fires; `commit` only runs the
// real delete action once the window expires without an undo.
export function useUndoableDelete() {
  const { showToast } = useToast();

  return function deleteWithUndo({
    message,
    commit,
    undo,
    showUndoInToast = true,
  }: {
    message: string;
    commit: () => void | Promise<void>;
    undo: () => void;
    // A toast's own "Undo" button is only clickable while no native
    // <dialog> is open via showModal() — a modal makes every other
    // top-level node inert, which blocks pointer events on the toast
    // regardless of z-index. Callers firing this from inside an already-
    // open dialog (see DayDetailDialog) should pass false here and render
    // their own inline undo affordance using the returned function.
    showUndoInToast?: boolean;
  }) {
    let isUndone = false;
    const timeoutId = setTimeout(() => {
      if (!isUndone) commit();
    }, UNDO_WINDOW_MS);

    function undoNow() {
      if (isUndone) return;
      isUndone = true;
      clearTimeout(timeoutId);
      undo();
    }

    showToast(message, "success", {
      durationMs: UNDO_WINDOW_MS,
      action: showUndoInToast ? { label: "Undo", onClick: undoNow } : undefined,
    });

    return undoNow;
  };
}
