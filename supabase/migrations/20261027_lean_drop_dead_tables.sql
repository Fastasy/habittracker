-- Streakly lean pass (2026-10-27): drop provably-dead backend tables.
--
-- These four have NO user_id column and NO frontend reads/writes — they were
-- legacy scaffolding from before the Supabase move. Dropping them removes
-- clutter from the schema and from backups. Run only after confirming counts
-- and with the management token working. NOT run yet — token was stale (401)
-- on 2026-10-27; executes after Ruan refreshes ~/supabase-access-token.

-- Sanity check first (should all exist):
--   select relname from pg_class where relname in ('reminders','push_subscriptions','pillars','user_settings');
--   select count(*) from reminders;
--   select count(*) from push_subscriptions;
--   select count(*) from pillars;
--   select count(*) from user_settings;

drop table if exists reminders;
drop table if exists push_subscriptions;
drop table if exists pillars;
drop table if exists user_settings;

-- NOTE: `goals` is intentionally KEPT (it holds Ruan's real objective rows;
-- only the UI was removed — data preserved).
