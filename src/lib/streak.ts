// Days are bucketed by UTC calendar date (matches toDateInputValue's use of
// toISOString elsewhere in the app), so a user's streak doesn't shift based
// on which server instance handled the request.
function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export type HeatmapDay = {
  date: string;
  count: number;
  isFuture: boolean;
};

// Consecutive days (ending today or yesterday) with at least one topic
// completed. Yesterday still counts as "unbroken" so the streak doesn't
// reset to 0 the moment midnight passes before today's first topic.
export function computeStreak(completedDates: Date[], now: Date = new Date()) {
  const days = new Set(completedDates.map(dateKey));
  const cursor = startOfUtcDay(now);

  if (!days.has(dateKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

// Weeks of a GitHub-style contribution grid, oldest first, each week
// Sunday-to-Saturday and ending on the current week.
export function buildHeatmap(
  completedDates: Date[],
  weeks: number,
  now: Date = new Date(),
): HeatmapDay[][] {
  const counts = new Map<string, number>();
  for (const date of completedDates) {
    const key = dateKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = startOfUtcDay(now);
  const todayKey = dateKey(today);

  const endOfWeek = new Date(today);
  endOfWeek.setUTCDate(today.getUTCDate() + (6 - today.getUTCDay()));

  const totalDays = weeks * 7;
  const start = new Date(endOfWeek);
  start.setUTCDate(endOfWeek.getUTCDate() - totalDays + 1);

  const days: HeatmapDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = dateKey(d);
    days.push({ date: key, count: counts.get(key) ?? 0, isFuture: key > todayKey });
  }

  const grid: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    grid.push(days.slice(i, i + 7));
  }
  return grid;
}
