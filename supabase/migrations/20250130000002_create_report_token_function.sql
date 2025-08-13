-- Create function to generate secure report token
CREATE OR REPLACE FUNCTION public.generate_report_token(p_id INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token TEXT;
    v_exists BOOLEAN;
BEGIN
    -- Check if matching request exists
    SELECT EXISTS(
        SELECT 1 FROM matching_requests WHERE id = p_id
    ) INTO v_exists;
    
    IF NOT v_exists THEN
        RAISE EXCEPTION 'Matching request not found';
    END IF;
    
    -- Generate a secure random token
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Store token in matching_requests table
    UPDATE matching_requests 
    SET 
        report_token = v_token,
        report_token_created_at = NOW()
    WHERE id = p_id;
    
    RETURN v_token;
END;
$$;

-- Add columns for report token if they don't exist
ALTER TABLE matching_requests 
ADD COLUMN IF NOT EXISTS report_token TEXT,
ADD COLUMN IF NOT EXISTS report_token_created_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_matching_requests_report_token 
ON matching_requests(report_token) 
WHERE report_token IS NOT NULL;

-- Add function to validate report token (optional, for secure report access)
CREATE OR REPLACE FUNCTION public.validate_report_token(p_token TEXT)
RETURNS TABLE(
    id INTEGER,
    company_id INTEGER,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token_age_hours INTEGER := 168; -- Token valid for 7 days
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.company_id,
        CASE 
            WHEN mr.report_token_created_at > NOW() - INTERVAL '1 hour' * v_token_age_hours 
            THEN TRUE 
            ELSE FALSE 
        END as is_valid
    FROM matching_requests mr
    WHERE mr.report_token = p_token
    AND mr.workflow_status = 'admin_approved'
    LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_report_token(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_report_token(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_report_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_report_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_report_token(TEXT) TO service_role;