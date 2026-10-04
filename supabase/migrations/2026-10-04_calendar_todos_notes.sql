-- Streakly: Calendar view (to-do list + daily notes)
-- Mirrors the Advisor CRM calendar's day panel, persisted in Supabase instead
-- of localStorage so it syncs across devices like habits/goals/weight already do.
-- RLS follows the app's existing rule: auth.uid() = user_id.

create table if not exists public.calendar_days (
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  date        date        not null,
  note        text        not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.todos (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  date        date        not null,
  text        text        not null,
  done        boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists todos_user_date_idx on public.todos (user_id, date);

alter table public.calendar_days enable row level security;
alter table public.todos         enable row level security;

drop policy if exists "Users can only access their own calendar notes" on public.calendar_days;
create policy "Users can only access their own calendar notes" on public.calendar_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can only access their own todos" on public.todos;
create policy "Users can only access their own todos" on public.todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
