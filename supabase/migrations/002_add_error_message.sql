-- Add error_message column to pages table for storing API processing errors
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS error_message TEXT;
