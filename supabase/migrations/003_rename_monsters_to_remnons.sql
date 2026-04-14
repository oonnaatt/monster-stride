-- Rename table monsters → remnons
ALTER TABLE monsters RENAME TO remnons;

-- Rename the primary key constraint (optional but keeps names tidy)
ALTER TABLE remnons RENAME CONSTRAINT monsters_pkey TO remnons_pkey;

-- Update RLS policies that reference the old table name
-- (Supabase policies are bound to the table; renaming the table keeps them intact,
--  but their display names may still say "monsters" — recreate them for clarity)

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own monsters" ON remnons;
DROP POLICY IF EXISTS "Users can insert own monsters" ON remnons;
DROP POLICY IF EXISTS "Users can update own monsters" ON remnons;

-- Recreate with updated names
CREATE POLICY "Users can view own remnons"
  ON remnons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own remnons"
  ON remnons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own remnons"
  ON remnons FOR UPDATE
  USING (auth.uid() = user_id);
