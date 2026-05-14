-- Run in Supabase SQL Editor before importing unmatched experiences.
-- Allows user_id to be NULL temporarily and stores the Glide username for later linking.

ALTER TABLE experiences ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS pending_username text;
