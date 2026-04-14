-- Add theme_song column to store the randomly assigned song at hatch time
ALTER TABLE remnons ADD COLUMN IF NOT EXISTS theme_song jsonb;
