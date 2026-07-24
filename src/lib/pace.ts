export type PaceStatus = "ahead" | "on-track" | "behind";

export type PaceResult = {
  status: PaceStatus;
  requiredPerDay: number;
  topicsRemaining: number;
  daysRemaining: number;
};

const DAY_MS = 1000 * 60 * 60 * 24;

// Whether the subject is keeping up with the topics-per-day rate needed to
// finish before the exam. Returns null when there's nothing to say: no exam
// date, no topics, already finished, or the exam already passed (the
// countdown already covers that last case).
export function getPace({
  examDate,
  createdAt,
  topicsTotal,
  topicsDone,
  now = new Date(),
}: {
  examDate: Date | null;
  createdAt: Date;
  topicsTotal: number;
  topicsDone: number;
  now?: Date;
}): PaceResult | null {
  if (!examDate || topicsTotal === 0 || topicsDone >= topicsTotal) {
    return null;
  }

  const msRemaining = examDate.getTime() - now.getTime();
  if (msRemaining <= 0) {
    return null;
  }

  const topicsRemaining = topicsTotal - topicsDone;
  // Floor at one hour so a same-day exam doesn't divide by a near-zero
  // number of days and report an absurd "topics per day" figure.
  const daysRemaining = Math.max(msRemaining / DAY_MS, 1 / 24);
  const requiredPerDay = topicsRemaining / daysRemaining;

  // Ahead/behind is relative to the whole prep window (subject creation to
  // exam day), not just what's left — otherwise a subject with 1 topic left
  // and 1 day to go always looks "on track" regardless of how the first 90%
  // of the window was spent.
  let status: PaceStatus = "on-track";
  const totalWindowMs = examDate.getTime() - createdAt.getTime();
  if (totalWindowMs > 0) {
    const elapsedFraction = Math.min(Math.max((now.getTime() - createdAt.getTime()) / totalWindowMs, 0), 1);
    const expectedDone = elapsedFraction * topicsTotal;
    const buffer = Math.max(1, topicsTotal * 0.15);
    if (topicsDone >= expectedDone + buffer) {
      status = "ahead";
    } else if (topicsDone < expectedDone - buffer) {
      status = "behind";
    }
  }

  return {
    status,
    requiredPerDay: Math.round(requiredPerDay * 10) / 10,
    topicsRemaining,
    daysRemaining: Math.ceil(daysRemaining),
  };
}
