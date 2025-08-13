-- Add approval_status to companies for rejection/re-approval flow
alter table public.companies
  add column if not exists approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  add column if not exists rejection_reason text;

-- Simple index for filtering
create index if not exists idx_companies_approval_status on public.companies(approval_status);

