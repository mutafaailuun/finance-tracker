-- Migration: Add iOS Shortcuts support

-- Add shortcut_api_key to user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS shortcut_api_key TEXT UNIQUE;

-- Add index for fast API key lookup (used by edge function on every request)
CREATE INDEX IF NOT EXISTS idx_user_preferences_shortcut_api_key
  ON user_preferences(shortcut_api_key);

-- The existing source check constraint doesn't include ios_shortcut.
-- Drop and recreate it to add the new value.
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_source_check;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_source_check
  CHECK (source IN ('web', 'whatsapp', 'ai', 'ios_shortcut'));
