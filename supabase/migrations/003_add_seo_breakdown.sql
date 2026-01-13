-- =============================================================================
-- ADD SEO SCORE BREAKDOWN COLUMN TO ANALYSIS RESULTS
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Add the seo_score_breakdown column (JSONB for storing structured breakdown)
ALTER TABLE public.analysis_results 
ADD COLUMN IF NOT EXISTS seo_score_breakdown JSONB;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analysis_results' 
AND column_name = 'seo_score_breakdown';
