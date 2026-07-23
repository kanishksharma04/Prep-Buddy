export type CalendarDay = {
  year: number;
  month: number; // 0-11
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Always 42 cells (6 full weeks) so the grid height never jumps between months.
export function getMonthGrid(year: number, month: number, today: Date = new Date()): CalendarDay[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLength = daysInMonth(prevYear, prevMonth);

  const cells: Omit<CalendarDay, "isToday">[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ year: prevYear, month: prevMonth, day: prevMonthLength - i, isCurrentMonth: false });
  }

  const currentMonthLength = daysInMonth(year, month);
  for (let day = 1; day <= currentMonthLength; day++) {
    cells.push({ year, month, day, isCurrentMonth: true });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const nextDate = new Date(last.year, last.month, last.day + 1);
    cells.push({
      year: nextDate.getFullYear(),
      month: nextDate.getMonth(),
      day: nextDate.getDate(),
      isCurrentMonth: false,
    });
  }

  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  return cells.map((cell) => ({
    ...cell,
    isToday: cell.year === todayY && cell.month === todayM && cell.day === todayD,
  }));
}

export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Exam/class dates are stored as UTC-midnight "date only" values (same
// convention as toDateInputValue in format.ts) — read them back with UTC
// getters, not local ones, or they shift a day in negative-UTC timezones.
export function utcDateKey(date: Date): string {
  return dateKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
