-- Public-safe report fetcher: returns only allowed fields for end users
CREATE OR REPLACE FUNCTION public.get_public_report_by_token(p_token text)
RETURNS TABLE(
  id integer,
  created_at timestamptz,
  status text,
  workflow_status text,
  ai_analysis jsonb,
  market_research jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id,
    mr.created_at,
    mr.status,
    mr.workflow_status,
    -- only analysis payloads; exclude admin-only fields
    mr.ai_analysis,
    mr.market_research
  FROM public.matching_requests mr
  WHERE mr.report_token = p_token
    AND (mr.workflow_status IS NULL OR mr.workflow_status <> 'deleted')
    AND (mr.is_deleted IS NULL OR mr.is_deleted = false)
    AND (mr.report_token_expires_at IS NULL OR mr.report_token_expires_at > now())
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_report_by_token(text) TO anon, authenticated, service_role;

