"use client";

import { useEffect, useRef, useState } from "react";

// A real recall check instead of a rubber-stamp "Revised" button: the
// front shows just the topic title, you try to remember it, then flip to
// see the note and grade yourself. "Still fuzzy" restarts the spaced-
// repetition schedule (see resetRevisionAction) rather than nudging it —
// a failed recall should reset, not just delay.
export function RevisionQuizDialog({
  open,
  onOpenChange,
  title,
  note,
  onGotIt,
  onStillFuzzy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  note: string | null;
  onGotIt: () => void;
  onStillFuzzy: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setIsFlipped(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleGotIt() {
    onGotIt();
    onOpenChange(false);
  }

  function handleStillFuzzy() {
    onStillFuzzy();
    onOpenChange(false);
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
      className="bg-surface text-foreground border-border m-auto w-full max-w-sm rounded-lg border p-0 shadow-[6px_6px_0_0_var(--paper-shadow)] backdrop:bg-black/50"
    >
      <div className="p-5">
        <h2 className="font-serif text-lg font-semibold">Quick recall check</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Try to remember it, then flip the card to check.
        </p>

        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          aria-label={isFlipped ? "Show question side" : "Reveal answer"}
          className="mt-4 block w-full cursor-pointer"
          style={{ perspective: "1200px" }}
        >
          <div
            className="border-border bg-background relative h-44 w-full rounded-lg border-2 border-dashed transition-transform duration-500 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* front: the question */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Recall
              </span>
              <p className="font-serif text-lg font-semibold">{title}</p>
              <span className="text-muted-foreground mt-2 text-xs">Tap to flip</span>
            </div>

            {/* back: the note/answer */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-y-auto p-5 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Answer
              </span>
              <p className="text-sm whitespace-pre-wrap">
                {note || "No note added for this topic — edit it to add one next time."}
              </p>
            </div>
          </div>
        </button>

        {isFlipped ? (
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleStillFuzzy}
              className="border-control flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Still fuzzy
            </button>
            <button
              type="button"
              onClick={handleGotIt}
              className="bg-primary text-primary-foreground flex-1 rounded-md px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0_var(--paper-shadow)] transition-all duration-150 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--paper-shadow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-x-0.75 active:translate-y-0.75 active:shadow-none"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="border-control rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
