-- Migration: Add WhatsApp bot support
-- Add phone number mapping table for WhatsApp integration

-- Table to map phone numbers to users
CREATE TABLE IF NOT EXISTS user_phone_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_phone_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own phone mappings"
  ON user_phone_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phone mappings"
  ON user_phone_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phone mappings"
  ON user_phone_mappings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own phone mappings"
  ON user_phone_mappings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_user_phone_mappings_updated_at
  BEFORE UPDATE ON user_phone_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for faster lookup
CREATE INDEX idx_user_phone_mappings_phone ON user_phone_mappings(phone_number);
CREATE INDEX idx_user_phone_mappings_user ON user_phone_mappings(user_id);

-- Add source column to transactions to track input method
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'web' CHECK (source IN ('web', 'whatsapp', 'ai'));

-- Add index for source
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);

-- Update user_preferences to store AI settings
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(20) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS ai_api_key TEXT;
