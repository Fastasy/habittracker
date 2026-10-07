-- Streakly — roll yesterday's unfinished to-dos onto today.
--
-- An undone to-do from an earlier day is COPIED forward, never moved: the row
-- for the day it was missed stays exactly where it is, so that day still shows
-- what was not done (a red X) instead of silently forgetting it.
--
--   carried_from  the FIRST day the to-do was ever written. Kept across a long
--                 roll chain, so "carried from Mon 5 Oct" keeps meaning that and
--                 the overdue age can be derived from the two dates.
--   carried_to    stamped on the SOURCE row once it has been rolled forward.
--                 This is also what makes the sweep idempotent: the client
--                 claims a row with `update ... set carried_to = <today>
--                 where carried_to is null`, so a second tab, a reload or a
--                 double-mount can never insert a second copy of the same
--                 to-do. (Deleting today's copy leaves carried_to set, so a
--                 deleted to-do stays deleted rather than resurrecting.)
--
-- No policy change needed: existing RLS `auth.uid() = user_id` covers new
-- columns, and both are nullable so nothing existing is affected.

alter table public.todos
  add column if not exists carried_from date,
  add column if not exists carried_to   date;

create index if not exists todos_carry_idx
  on public.todos (user_id, done, carried_to);
