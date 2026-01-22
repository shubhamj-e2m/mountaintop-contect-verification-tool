-- Add customer_persona column to analysis_results table
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS customer_persona JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN analysis_results.customer_persona IS 'Customer persona inferred from page content via OpenAI analysis';
