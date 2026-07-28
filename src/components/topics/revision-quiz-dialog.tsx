"use client";

import { useEffect, useRef, useState } from "react";
import { generateRecallQuestionAction } from "@/lib/actions/topics";

// A real recall check instead of a rubber-stamp "Revised" button: the
// front shows a question, you try to remember it, then flip to see the
// answer and grade yourself. "Still fuzzy" restarts the spaced-repetition
// schedule (see resetRevisionAction) rather than nudging it — a failed
// recall should reset, not just delay.
//
// When the topic has a note, the front/back pair is an AI-generated recall
// question and answer (cached on the Topic row by generateRecallQuestionAction)
// instead of the raw title/note — a sharper test than "did you remember the
// note verbatim." Falls back to title/note whenever generation isn't
// available (no note, no ANTHROPIC_API_KEY configured, or the call failed).
export function RevisionQuizDialog({
  open,
  onOpenChange,
  topicId,
  title,
  note,
  initialQuestion,
  initialAnswer,
  onGotIt,
  onStillFuzzy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  title: string;
  note: string | null;
  initialQuestion: string | null;
  initialAnswer: string | null;
  onGotIt: () => void;
  onStillFuzzy: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quiz, setQuiz] = useState<{ question: string; answer: string } | null>(
    initialQuestion && initialAnswer ? { question: initialQuestion, answer: initialAnswer } : null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Re-sync from the server-cached pair whenever it changes — e.g. cleared
  // back to null after the note was edited (see editTopicAction). Derived
  // during render (same pattern as topic-row.tsx's `handledState`) rather
  // than an effect, since this is deriving state from props, not
  // subscribing to an external system.
  const [handledProps, setHandledProps] = useState({ initialQuestion, initialAnswer });
  if (handledProps.initialQuestion !== initialQuestion || handledProps.initialAnswer !== initialAnswer) {
    setHandledProps({ initialQuestion, initialAnswer });
    setQuiz(initialQuestion && initialAnswer ? { question: initialQuestion, answer: initialAnswer } : null);
  }

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

  useEffect(() => {
    if (!open || quiz || !note) return;
    let cancelled = false;
    // Kicking off a request to an external system (the AI generation
    // action) when the dialog opens, not deriving state from props/state —
    // the documented exception to "set-state-in-effect" (see use-countdown.ts).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsGenerating(true);
    generateRecallQuestionAction(topicId)
      .then((result) => {
        if (!cancelled && result) setQuiz(result);
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, quiz, note, topicId]);

  const front = quiz?.question ?? title;
  const back = quiz?.answer ?? (note || "No note added for this topic — edit it to add one next time.");

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
              <p className="font-serif text-lg font-semibold">{front}</p>
              <span className="text-muted-foreground mt-2 text-xs">
                {isGenerating && !quiz ? "Preparing a sharper question…" : "Tap to flip"}
              </span>
            </div>

            {/* back: the note/answer */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-y-auto p-5 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Answer
              </span>
              <p className="text-sm whitespace-pre-wrap">{back}</p>
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
