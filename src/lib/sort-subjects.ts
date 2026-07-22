type SortableSubject = {
  examDate: Date | null;
  order: number;
};

// Nearest upcoming exam first; subjects with no exam date, or whose exam
// has already passed, sink to the end (tiebroken by creation order).
export function sortByNearestExam<T extends SortableSubject>(
  subjects: T[],
  now: Date = new Date(),
): T[] {
  const nowMs = now.getTime();

  function sortKey(subject: T): number {
    if (subject.examDate && subject.examDate.getTime() > nowMs) {
      return subject.examDate.getTime();
    }
    return Number.POSITIVE_INFINITY;
  }

  return [...subjects].sort((a, b) => {
    const diff = sortKey(a) - sortKey(b);
    return diff !== 0 ? diff : a.order - b.order;
  });
}

export function findNextExam<T extends { examDate: Date | null }>(
  subjects: T[],
  now: Date = new Date(),
): T | undefined {
  const nowMs = now.getTime();
  return subjects.find((subject) => subject.examDate && subject.examDate.getTime() > nowMs);
}
