-- Create admin_excel_data table for storing admin uploaded excel data
create table if not exists public.admin_excel_data (
  id uuid default gen_random_uuid() primary key,
  data_category text not null,
  country text not null,
  industry text,
  data_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.admin_excel_data enable row level security;

-- Create policies
create policy "Admin users can manage excel data" on public.admin_excel_data
  for all using (
    exists (
      select 1 from companies 
      where companies.email = auth.jwt() ->> 'email' 
      and companies.is_admin = true
    )
  );

-- Allow authenticated users to read excel data for analysis
create policy "Authenticated users can read excel data" on public.admin_excel_data
  for select using (auth.role() = 'authenticated');

-- Create indexes for better performance
create index if not exists admin_excel_data_category_idx on public.admin_excel_data(data_category);
create index if not exists admin_excel_data_country_idx on public.admin_excel_data(country);
create index if not exists admin_excel_data_industry_idx on public.admin_excel_data(industry);

