export interface CalendarNote {
  date: string; // YYYY-MM-DD
  note: string;
}

export interface Todo {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  done: boolean;
}
