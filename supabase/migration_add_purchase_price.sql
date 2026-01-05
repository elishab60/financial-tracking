-- Migration to add purchase_price column to assets table
-- Run this in your Supabase SQL Editor

-- Purchase Price (Average Unit Cost)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS purchase_price DECIMAL;

-- Verify
-- SELECT * FROM assets LIMIT 1;
