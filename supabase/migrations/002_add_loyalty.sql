-- Add loyalty column to monsters table
ALTER TABLE monsters ADD COLUMN IF NOT EXISTS loyalty INTEGER DEFAULT 50 CHECK (loyalty >= 0 AND loyalty <= 100);
