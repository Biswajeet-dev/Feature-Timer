/*
# Add people_count column to tasks

1. Modified Tables
- `tasks`
  - Add `people_count` (int, not null, default 1) — number of people assigned to the task.
    Each person multiplies the burn rate: with N people, N task-seconds are deducted per
    real work-second. Minimum 1.

2. Security
- No policy changes. Existing anon/authenticated CRUD policies already cover the new column
  since grants are table-level (SELECT, INSERT, UPDATE, DELETE on all columns).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'people_count'
  ) THEN
    ALTER TABLE tasks ADD COLUMN people_count int NOT NULL DEFAULT 1;
  END IF;
END $$;
