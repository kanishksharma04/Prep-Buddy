export type CountdownUrgency = "green" | "amber" | "red" | "grey";

export type CountdownResult = {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  urgency: CountdownUrgency;
};

const MINUTE_MS = 1000 * 60;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

// Urgency: green > 7 days out, amber <= 7 days, red <= 2 days, grey once past.
// `totalHours`/`minutes` let the red (<=48h) state switch to hour/minute
// granularity instead of days — see Countdown, which is the only consumer
// that reads them; the day-level split still covers green/amber.
export function getCountdown(examDate: Date, now: Date = new Date()): CountdownResult {
  const diffMs = examDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isPast: true, days: 0, hours: 0, minutes: 0, totalHours: 0, urgency: "grey" };
  }

  const totalHours = Math.floor(diffMs / HOUR_MS);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = Math.floor((diffMs % HOUR_MS) / MINUTE_MS);

  const exactDays = diffMs / DAY_MS;
  const urgency: CountdownUrgency = exactDays > 7 ? "green" : exactDays > 2 ? "amber" : "red";

  return { isPast: false, days, hours, minutes, totalHours, urgency };
}
