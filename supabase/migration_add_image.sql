-- Migration to add image column to assets table
-- Run this in your Supabase SQL Editor

ALTER TABLE assets ADD COLUMN IF NOT EXISTS image TEXT;

-- Verify
-- SELECT * FROM assets LIMIT 1;
