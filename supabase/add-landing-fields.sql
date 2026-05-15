-- Add landing page fields to festivals and experiences
-- Run in Supabase SQL Editor

ALTER TABLE festivals
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS landing_blurb text;

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS landing_blurb text;
