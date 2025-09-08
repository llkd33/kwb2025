-- Add deleted_at for soft-delete auditing and UI logic
ALTER TABLE public.matching_requests
  ADD COLUMN IF NOT EXISTS deleted_at timestamp without time zone;

