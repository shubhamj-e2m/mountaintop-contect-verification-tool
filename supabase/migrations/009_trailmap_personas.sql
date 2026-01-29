-- Add trailmap_personas table for storing personas extracted from Google Slides trailmap
CREATE TABLE IF NOT EXISTS trailmap_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  personas JSONB NOT NULL,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one trailmap persona set per project
  UNIQUE(project_id)
);

-- Add index for faster project lookups
CREATE INDEX IF NOT EXISTS idx_trailmap_personas_project_id ON trailmap_personas(project_id);

-- Add comments for documentation
COMMENT ON TABLE trailmap_personas IS 'Customer personas extracted directly from Google Slides digital trailmap document';
COMMENT ON COLUMN trailmap_personas.personas IS 'Array of persona objects with id, name, and persona data extracted from trailmap';
COMMENT ON COLUMN trailmap_personas.extracted_at IS 'Timestamp when personas were extracted from trailmap';
COMMENT ON COLUMN trailmap_personas.source_document IS 'Source document identifier (e.g., trailmap file name)';
