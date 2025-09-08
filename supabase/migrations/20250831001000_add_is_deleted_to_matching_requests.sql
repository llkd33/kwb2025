-- Add soft-delete flag used by API filters and RLS policies
ALTER TABLE public.matching_requests
  ADD COLUMN IF NOT EXISTS is_deleted boolean;

-- Optional: future-proofing index for frequent filters (null or false)
-- CREATE INDEX IF NOT EXISTS idx_matching_requests_is_deleted ON public.matching_requests(is_deleted);

