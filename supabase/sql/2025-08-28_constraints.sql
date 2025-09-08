-- Unique constraint for companies.email to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'companies_email_unique_idx'
  ) THEN
    CREATE UNIQUE INDEX companies_email_unique_idx ON public.companies (email);
  END IF;
END$$;

-- Optional: normalize status enums via CHECK constraints (adjust values to your canonical set)
DO $$
BEGIN
  -- status: pending | in-progress | completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' AND table_name = 'matching_requests' AND constraint_name = 'matching_requests_status_check'
  ) THEN
    ALTER TABLE public.matching_requests
      ADD CONSTRAINT matching_requests_status_check
      CHECK (status IN ('pending', 'in-progress', 'completed'));
  END IF;

  -- workflow_status: documents_uploaded | admin_review | rejected | deleted | completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' AND table_name = 'matching_requests' AND constraint_name = 'matching_requests_workflow_status_check'
  ) THEN
    ALTER TABLE public.matching_requests
      ADD CONSTRAINT matching_requests_workflow_status_check
      CHECK (workflow_status IN ('documents_uploaded', 'admin_review', 'rejected', 'deleted', 'completed'));
  END IF;
END$$;

-- Optional: ensure report_token TTL is present when token exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_schema = 'public' AND table_name = 'matching_requests' AND constraint_name = 'matching_requests_token_ttl_check'
  ) THEN
    ALTER TABLE public.matching_requests
      ADD CONSTRAINT matching_requests_token_ttl_check
      CHECK (
        (report_token IS NULL AND report_token_expires_at IS NULL)
        OR (report_token IS NOT NULL AND report_token_expires_at IS NOT NULL)
      );
  END IF;
END$$;

