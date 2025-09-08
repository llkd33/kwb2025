-- Add missing columns for token TTL
ALTER TABLE public.matching_requests
  ADD COLUMN IF NOT EXISTS report_token_expires_at timestamptz;

-- Generate report token with TTL (defaults to 7 days)
CREATE OR REPLACE FUNCTION public.generate_report_token(p_id integer, p_ttl_hours integer DEFAULT 168)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.matching_requests WHERE id = p_id) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Matching request not found';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');

  UPDATE public.matching_requests
  SET report_token = v_token,
      report_token_created_at = now(),
      report_token_expires_at = now() + make_interval(hours => p_ttl_hours)
  WHERE id = p_id;

  RETURN v_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_report_token(integer, integer) TO anon, authenticated, service_role;

-- Public report fetcher via token with TTL and deleted checks
CREATE OR REPLACE FUNCTION public.get_report_by_token(p_token text)
RETURNS public.matching_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.matching_requests;
BEGIN
  SELECT * INTO v_row
  FROM public.matching_requests mr
  WHERE mr.report_token = p_token
    AND (mr.workflow_status IS NULL OR mr.workflow_status <> 'deleted')
    AND (mr.is_deleted IS NULL OR mr.is_deleted = false)
    AND (mr.report_token_expires_at IS NULL OR mr.report_token_expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_report_by_token(text) TO anon, authenticated, service_role;

-- RLS: matching_requests - company can read/update own only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matching_requests' AND policyname = 'mr_select_own_company'
  ) THEN
    CREATE POLICY mr_select_own_company ON public.matching_requests
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.email = auth.email()
            AND c.id = matching_requests.company_id
        )
        OR EXISTS (
          SELECT 1 FROM public.companies c2
          WHERE c2.email = auth.email() AND c2.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'matching_requests' AND policyname = 'mr_update_own_company'
  ) THEN
    CREATE POLICY mr_update_own_company ON public.matching_requests
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.email = auth.email()
            AND c.id = matching_requests.company_id
        )
        OR EXISTS (
          SELECT 1 FROM public.companies c2
          WHERE c2.email = auth.email() AND c2.is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.email = auth.email()
            AND c.id = matching_requests.company_id
        )
        OR EXISTS (
          SELECT 1 FROM public.companies c2
          WHERE c2.email = auth.email() AND c2.is_admin = true
        )
      );
  END IF;
END$$;

-- Storage RLS for pdf-uploads and business-documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_read_company_or_admin'
  ) THEN
    CREATE POLICY storage_read_company_or_admin ON storage.objects
      FOR SELECT
      USING (
        (
          bucket_id IN ('pdf-uploads', 'business-documents') AND
          (
            EXISTS (
              SELECT 1 FROM public.companies c
              WHERE c.email = auth.email() AND c.is_admin = true
            )
            OR EXISTS (
              SELECT 1 FROM public.companies c
              WHERE c.email = auth.email()
                AND c.id::text = split_part(objects.name, '/', 1)
            )
          )
        )
        OR bucket_id NOT IN ('pdf-uploads', 'business-documents')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_insert_company_only'
  ) THEN
    CREATE POLICY storage_insert_company_only ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id IN ('pdf-uploads', 'business-documents') AND
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.email = auth.email()
            AND c.id::text = split_part(objects.name, '/', 1)
        )
      );
  END IF;
END$$;

