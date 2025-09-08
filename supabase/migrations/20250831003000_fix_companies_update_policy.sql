-- Fix companies UPDATE RLS to allow admins to update any row
DO $$
BEGIN
  -- Drop overly-permissive/incorrect own-data policy if present
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Companies can update own data'
  ) THEN
    DROP POLICY "Companies can update own data" ON public.companies;
  END IF;

  -- Own row updates (by email)
  CREATE POLICY companies_update_own ON public.companies
    FOR UPDATE
    USING (auth.email() = email)
    WITH CHECK (auth.email() = email);

  -- Admins can update any row
  CREATE POLICY companies_update_admin ON public.companies
    FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.email = auth.email() AND c.is_admin = true
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.email = auth.email() AND c.is_admin = true
    ));
END$$;

