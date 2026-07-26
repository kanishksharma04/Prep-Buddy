// Spaced-repetition schedule: a completed topic comes back up for review
// 1, then 3, then 7 days after it was last revised (or completed, for the
// first review). After the 7-day review it's considered retained.
export const REVISION_INTERVALS_DAYS = [1, 3, 7] as const;

const DAY_MS = 1000 * 60 * 60 * 24;

export type RevisionInput = {
  isDone: boolean;
  completedAt: Date | null;
  revisionStage: number;
  lastRevisedAt: Date | null;
};

// The date a topic next comes up for review, or null if it isn't done,
// has no completion timestamp yet, or has already cleared every interval.
export function getNextReviewDate(topic: RevisionInput): Date | null {
  if (!topic.isDone || topic.revisionStage >= REVISION_INTERVALS_DAYS.length) {
    return null;
  }
  const anchor = topic.lastRevisedAt ?? topic.completedAt;
  if (!anchor) {
    return null;
  }
  const intervalDays = REVISION_INTERVALS_DAYS[topic.revisionStage];
  return new Date(anchor.getTime() + intervalDays * DAY_MS);
}

export function isDueForRevision(topic: RevisionInput, now: Date = new Date()): boolean {
  const dueDate = getNextReviewDate(topic);
  return dueDate !== null && dueDate.getTime() <= now.getTime();
}
