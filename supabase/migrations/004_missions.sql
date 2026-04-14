-- 004_missions.sql
-- Tracks user-accepted missions and their progress

CREATE TABLE IF NOT EXISTS user_missions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id   TEXT        NOT NULL,
  remnon_id    UUID        REFERENCES remnons(id) ON DELETE SET NULL,
  status       TEXT        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'completed')),
  progress     NUMERIC     NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate active missions of the same type per user
CREATE UNIQUE INDEX IF NOT EXISTS user_missions_one_active_per_mission
  ON user_missions (user_id, mission_id)
  WHERE status = 'active';

ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own missions"
  ON user_missions
  FOR ALL
  USING (auth.uid() = user_id);
