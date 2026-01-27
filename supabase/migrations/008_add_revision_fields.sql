-- =============================================================================
-- ADD REVISION FIELDS TO PAGES TABLE
-- =============================================================================

-- Add fields to track what needs revision
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS revise_seo BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS revise_content BOOLEAN NOT NULL DEFAULT false;

-- Add index for filtering pages by revision type
CREATE INDEX IF NOT EXISTS idx_pages_revision_seo ON public.pages(revise_seo) WHERE revise_seo = true;
CREATE INDEX IF NOT EXISTS idx_pages_revision_content ON public.pages(revise_content) WHERE revise_content = true;
