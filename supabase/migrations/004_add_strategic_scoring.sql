-- Migration to add Strategic Analysis scoring fields

-- 1. Add google_drive_url to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS google_drive_url TEXT;

-- 2. Add strategic_analysis_score to analysis_results table
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS strategic_analysis_score INTEGER DEFAULT 0;

-- 3. Add brand_intent_score to analysis_results table
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS brand_intent_score INTEGER DEFAULT 0;
