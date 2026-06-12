-- Add display name column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
