import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, password,
      company_name,
      ceo_name,
      manager_name,
      manager_position,
      phone_number,
      industry,
      headquarters_country,
      headquarters_city,
      founding_year,
      employee_count,
      revenue_scale,
      main_products,
      target_market,
      competitive_advantage,
      company_vision,
      website
    } = await req.json();

    if (!email || !password || !company_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create or update the auth user and auto-confirm
    const { data: adminCreate, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_admin: false }
    });

    if (adminErr) {
      // If already registered, update password and continue
      if (adminErr.message?.includes('already been registered')) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.users?.find((u: any) => u.email === email);
        if (existing) {
          await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
        }
      } else {
        throw adminErr;
      }
    }

    // Upsert company profile
    const { error: upsertErr, data: company } = await supabaseAdmin
      .from('companies')
      .upsert({
        email,
        company_name,
        ceo_name: ceo_name || manager_name || '대표',
        manager_name,
        manager_position,
        phone_number,
        industry,
        headquarters_country,
        headquarters_city,
        founding_year,
        employee_count,
        revenue_scale,
        main_products,
        target_market,
        competitive_advantage,
        company_vision,
        website,
        is_approved: false
      }, { onConflict: 'email' })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return new Response(JSON.stringify({ success: true, company }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

