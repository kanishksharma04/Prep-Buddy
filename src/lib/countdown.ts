export type CountdownUrgency = "green" | "amber" | "red" | "grey";

export type CountdownResult = {
  isPast: boolean;
  days: number;
  hours: number;
  urgency: CountdownUrgency;
};

const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;

// Urgency: green > 7 days out, amber <= 7 days, red <= 2 days, grey once past.
export function getCountdown(examDate: Date, now: Date = new Date()): CountdownResult {
  const diffMs = examDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isPast: true, days: 0, hours: 0, urgency: "grey" };
  }

  const totalHours = Math.floor(diffMs / HOUR_MS);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const exactDays = diffMs / DAY_MS;
  const urgency: CountdownUrgency = exactDays > 7 ? "green" : exactDays > 2 ? "amber" : "red";

  return { isPast: false, days, hours, urgency };
}
