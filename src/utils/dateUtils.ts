import {
  format,
  parseISO,
  startOfDay,
  subDays,
  isToday,
  isYesterday,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDay,
  differenceInCalendarDays,
  isBefore,
  isAfter,
  addDays,
} from 'date-fns';

export const toDateString = (date: Date): string => format(date, 'yyyy-MM-dd');
export const today = (): string => toDateString(new Date());
export const todayDate = (): Date => startOfDay(new Date());

export const parseDate = (dateStr: string): Date => parseISO(dateStr);

export const getLast365Days = (): string[] => {
  const end = new Date();
  const start = subDays(end, 364);
  return eachDayOfInterval({ start, end }).map(toDateString);
};

export const getLast180Days = (): string[] => {
  const end = new Date();
  const start = subDays(end, 179);
  return eachDayOfInterval({ start, end }).map(toDateString);
};

export const getLast90Days = (): string[] => {
  const end = new Date();
  const start = subDays(end, 89);
  return eachDayOfInterval({ start, end }).map(toDateString);
};

export const getLastNDays = (n: number): string[] => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map(toDateString);
};

export const getWeeksForHeatmap = (days: string[]): string[][] => {
  if (days.length === 0) return [];
  const first = parseISO(days[0]);
  const last = parseISO(days[days.length - 1]);

  // pad start to Sunday
  const paddedStart = startOfWeek(first, { weekStartsOn: 0 });
  const paddedEnd = endOfWeek(last, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: paddedStart, end: paddedEnd }).map(toDateString);

  const weeks: string[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  return weeks;
};

export const formatDateLabel = (dateStr: string): string => {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
};

export const formatMonthYear = (dateStr: string): string =>
  format(parseISO(dateStr), 'MMM yyyy');

export const getDayOfWeek = (dateStr: string): number => getDay(parseISO(dateStr));

export const getWeekLabel = (dateStr: string): string =>
  format(parseISO(dateStr), 'EEE');

export const isHabitScheduledForDate = (
  habit: { frequency: string; specificDays?: number[]; timesPerWeek?: number; createdAt: string },
  dateStr: string
): boolean => {
  const date = parseISO(dateStr);
  const createdDate = parseISO(habit.createdAt);

  // Don't show habit before it was created
  if (isBefore(startOfDay(date), startOfDay(createdDate))) return false;

  if (habit.frequency === 'daily') return true;

  if (habit.frequency === 'specific_days') {
    const dayOfWeek = getDay(date);
    return (habit.specificDays ?? []).includes(dayOfWeek);
  }

  if (habit.frequency === 'times_per_week') {
    return true; // All days are eligible, just need X per week
  }

  return false;
};

export { subDays, isToday, format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isAfter, addDays, differenceInCalendarDays, startOfDay };
