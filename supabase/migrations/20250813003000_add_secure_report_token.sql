-- Secure report token to avoid exposing incremental IDs in public URLs
alter table public.matching_requests
  add column if not exists report_token text unique,
  add column if not exists report_token_expires_at timestamp without time zone;

-- Create function to mint token
create or replace function public.generate_report_token(p_id int)
returns text
language plpgsql
security definer
as $$
declare
  v_token text := encode(gen_random_bytes(24), 'hex');
begin
  update public.matching_requests
    set report_token = v_token,
        report_token_expires_at = now() + interval '14 days'
    where id = p_id;
  return v_token;
end;
$$;

-- RLS policy for selecting own report by token (for anon/authenticated)
-- Assumes matching_requests already has company_id and current_user is mapped to company via application logic.

