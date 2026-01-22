-- Add target personas table for project-level SME/Enterprise personas
CREATE TABLE IF NOT EXISTS target_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sme_persona JSONB NOT NULL,
  enterprise_persona JSONB NOT NULL,
  source_documents TEXT[] DEFAULT ARRAY['trailmap', 'brand_strategy'],
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one target persona set per project
  UNIQUE(project_id)
);

-- Add index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_target_personas_project_id ON target_personas(project_id);

-- Add comment for documentation
COMMENT ON TABLE target_personas IS 'AI-generated SME and Enterprise target personas derived from project strategic documents';
COMMENT ON COLUMN target_personas.sme_persona IS 'Small-Medium Enterprise decision maker persona generated from strategic documents';
COMMENT ON COLUMN target_personas.enterprise_persona IS 'Enterprise-level decision maker persona generated from strategic documents';
COMMENT ON COLUMN target_personas.source_documents IS 'Array of document types used to generate personas (trailmap, brand_strategy)';

-- Update analysis_results to include enhanced persona with relevance scoring
ALTER TABLE analysis_results 
ADD COLUMN IF NOT EXISTS target_persona_relevance JSONB DEFAULT NULL;

-- Add comment for new column
COMMENT ON COLUMN analysis_results.target_persona_relevance IS 'Relevance scores comparing custom persona to project target personas (SME/Enterprise)';