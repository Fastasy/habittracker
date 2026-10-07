export interface CalendarNote {
  date: string; // YYYY-MM-DD
  note: string;
}

export interface Todo {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  done: boolean;
  /** Optional link to a goal (mirrors Habit.goalId). */
  goalId?: string;
  /**
   * The FIRST day this to-do was written — set when it rolled over from an
   * earlier day. Kept across a long roll chain, so "carried from Mon 5 Oct"
   * still means that after a week of rolling.
   */
  carriedFrom?: string;
  /** Set on the source row once it has been pushed forward to a later day. */
  carriedTo?: string;
}
