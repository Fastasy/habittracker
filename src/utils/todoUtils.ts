import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { Todo } from '../types/calendar';
import { today } from './dateUtils';

/**
 * To-do states, shared by the Calendar and the Objective cards so both draw the
 * same three states the same way:
 *
 *   done    → green check, struck through
 *   missed  → red X, struck through   (the day is over and it was never done)
 *   open    → empty checkbox
 *
 * "Missed" is derived from the date, never stored. A to-do is only missed once
 * its day has actually passed, so nothing flips state mid-day.
 */

/** A to-do whose day is over and that was never completed — the red X state. */
export const isMissed = (t: Todo, todayIso: string = today()): boolean =>
  !t.done && t.date < todayIso;

/** True when this row was rolled forward from an earlier day. */
export const isCarriedIn = (t: Todo): boolean => !!t.carriedFrom && t.carriedFrom < t.date;

/** How many days over a carried to-do is (0 for a to-do on its own day). */
export const carriedDays = (t: Todo): number =>
  t.carriedFrom ? differenceInCalendarDays(parseISO(t.date), parseISO(t.carriedFrom)) : 0;

/** "Mon 5 Oct" — short and unambiguous. */
export const shortDate = (iso: string): string => format(parseISO(iso), 'EEE d MMM');

/**
 * Display order inside one day: roll-overs that are still unfinished first
 * (they are the oldest debt), everything else in the order it was written.
 * Array.prototype.sort is stable, so the original order survives inside groups.
 */
export const byCarriedFirst = (a: Todo, b: Todo): number => {
  const rank = (t: Todo) => (isCarriedIn(t) && !t.done ? 0 : 1);
  return rank(a) - rank(b);
};
