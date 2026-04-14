-- 005_skills_and_challenges.sql

-- Tracks skills a remnon has learned, and their current charge state
CREATE TABLE IF NOT EXISTS remnon_skills (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  remnon_id       UUID        NOT NULL REFERENCES remnons(id) ON DELETE CASCADE,
  skill_id        TEXT        NOT NULL,
  charges         INTEGER     NOT NULL DEFAULT 0 CHECK (charges >= 0),
  max_charges     INTEGER     NOT NULL DEFAULT 1 CHECK (max_charges >= 1),
  discovered_from TEXT        NOT NULL DEFAULT 'hatch'
                              CHECK (discovered_from IN ('hatch', 'evolution', 'mission', 'challenge')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A remnon can only hold each skill once
CREATE UNIQUE INDEX IF NOT EXISTS remnon_skills_unique_skill
  ON remnon_skills (remnon_id, skill_id);

ALTER TABLE remnon_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their remnon skills"
  ON remnon_skills
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM remnons
      WHERE remnons.id = remnon_skills.remnon_id
        AND remnons.user_id = auth.uid()
    )
  );

-- Tracks results of wild encounters at end of each activity
CREATE TABLE IF NOT EXISTS wild_challenges (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  remnon_id        UUID        REFERENCES remnons(id) ON DELETE SET NULL,
  activity_id      UUID        REFERENCES activities(id) ON DELETE SET NULL,
  wild_name        TEXT        NOT NULL,
  wild_type        TEXT        NOT NULL,
  wild_level       INTEGER     NOT NULL,
  outcome          TEXT        NOT NULL CHECK (outcome IN ('win', 'loss')),
  exp_reward       INTEGER     NOT NULL DEFAULT 0,
  new_skill_id     TEXT,
  battle_log       JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wild_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wild challenges"
  ON wild_challenges
  FOR ALL
  USING (auth.uid() = user_id);
