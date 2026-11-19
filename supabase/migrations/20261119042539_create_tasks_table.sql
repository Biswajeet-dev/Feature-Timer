/*
# Create tasks table (single-tenant, no auth)

1. New Tables
- `tasks`
- `id` (uuid, primary key)
- `title` (text, not null) — the task name
- `status` (text, not null) — one of: proposed, progress, halted, finished, rejected
- `task_date` (date, not null) — the date the task is saved under, for date-wise grouping
- `duration_seconds` (int, not null, default 0) — total countdown duration in seconds
- `remaining_seconds` (int, not null, default 0) — remaining time at the last checkpoint
- `running_since` (timestamptz, nullable) — timestamp when the timer last started running (status=progress); null when paused/stopped
- `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `tasks`.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  task_date date NOT NULL DEFAULT current_date,
  duration_seconds int NOT NULL DEFAULT 0,
  remaining_seconds int NOT NULL DEFAULT 0,
  running_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);
