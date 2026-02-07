-- Add language column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'es';
