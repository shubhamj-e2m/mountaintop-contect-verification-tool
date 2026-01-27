-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'keywords_ready',
        'content_ready_for_review',
        'content_approved',
        'revision_requested',
        'analysis_complete'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT NOT NULL,
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false,
    dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_page ON public.notifications(page_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project ON public.notifications(project_id);
