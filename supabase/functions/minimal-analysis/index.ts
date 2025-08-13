import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting minimal analysis test...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchingRequestId } = await req.json();
    console.log(`Testing with matching request ID: ${matchingRequestId}`);

    // 1. Get matching request data only
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`*, companies!matching_requests_company_id_fkey(*)`)
      .eq('id', matchingRequestId)
      .single();

    if (requestError || !matchingRequest) {
      throw new Error('매칭 요청을 찾을 수 없습니다.');
    }

    console.log(`Found company: ${matchingRequest.companies.company_name}`);

    // 2. Test simple OpenAI call with gpt-4o-mini (known working model)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
      console.error('OpenAI API key not configured properly');
      
      // Return a more informative error for missing API key
      return new Response(JSON.stringify({
        success: false,
        error: 'API key not configured',
        message: 'OpenAI API key가 설정되지 않았습니다. Supabase 대시보드에서 환경 변수를 설정해주세요.',
        instructions: 'npx supabase secrets set OPENAI_API_KEY=your_actual_api_key'
      }), {
        status: 503, // Service Unavailable
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a business analyst. Respond in Korean.' },
          { role: 'user', content: `${matchingRequest.companies.company_name} 회사에 대한 간단한 분석을 해주세요.` }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    console.log(`OpenAI response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI error: ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI call successful');

    // 3. Update status but keep as pending for admin review
    await supabaseClient
      .from('matching_requests')
      .update({
        status: 'pending',  // Keep as pending for admin review
        workflow_status: 'ai_completed',
        ai_completed_at: new Date().toISOString(),
        ai_analysis: { simple_analysis: data.choices[0].message.content }
      })
      .eq('id', matchingRequestId);

    console.log('Minimal analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: '최소 분석 완료',
      analysis: data.choices[0].message.content,
      tokens: data.usage?.total_tokens || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Minimal analysis error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});