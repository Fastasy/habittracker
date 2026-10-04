-- Streakly: link a to-do to a goal (optional).
-- Mirrors the existing habit -> goal link (habits.goal_id).
-- ON DELETE SET NULL: deleting a goal must never delete the to-dos that pointed at it.

alter table public.todos
  add column if not exists goal_id uuid references public.goals(id) on delete set null;

create index if not exists todos_goal_idx on public.todos (goal_id);
