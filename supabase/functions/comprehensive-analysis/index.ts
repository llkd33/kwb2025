import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('=== COMPREHENSIVE ANALYSIS STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('1. Initializing Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('2. Parsing request body...');
    const requestBody = await req.json();
    const { matchingRequestId } = requestBody;
    console.log(`Matching request ID: ${matchingRequestId}`);

    if (!matchingRequestId) {
      throw new Error('matchingRequestId is required');
    }

    console.log('3. Fetching matching request data...');
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`*, companies(*)`)
      .eq('id', matchingRequestId)
      .single();

    if (requestError) {
      console.error('Request fetch error:', requestError);
      throw new Error(`Failed to fetch matching request: ${requestError.message}`);
    }

    if (!matchingRequest) {
      throw new Error('Matching request not found');
    }

    console.log(`4. Found company: ${matchingRequest.companies.company_name}`);

    console.log('5. Checking OpenAI API key...');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }
    console.log(`OpenAI key length: ${openaiApiKey.length}`);

    console.log('6. Making OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a business analyst. Provide analysis in JSON format with Korean text. Respond with a simple analysis object.' 
          },
          { 
            role: 'user', 
            content: `회사명: ${matchingRequest.companies.company_name}
업종: ${matchingRequest.companies.industry}
타겟 국가: ${matchingRequest.target_countries.join(', ')}

이 회사에 대한 간단한 분석을 JSON 형태로 제공해주세요. 다음 형식을 사용하세요:
{
  "회사_개요": "...",
  "강점": "...",
  "시장_기회": "...",
  "추천사항": "..."
}` 
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    console.log(`OpenAI response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI error response: ${errorText}`);
      throw new Error(`OpenAI API failed with status ${response.status}: ${errorText}`);
    }

    const openaiData = await response.json();
    console.log('7. OpenAI call successful, tokens used:', openaiData.usage?.total_tokens);

    const analysisContent = openaiData.choices[0].message.content;
    
    // Try to parse as JSON, fallback to text
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisContent);
    } catch {
      parsedAnalysis = { analysis: analysisContent };
    }

    console.log('8. Updating matching request...');
    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ai_analysis: parsedAnalysis,
        market_research: { message: "시장 분석은 단순화된 버전에서 제외됨" },
        final_report: { 
          content: analysisContent,
          tokens: openaiData.usage?.total_tokens || 0,
          generated_at: new Date().toISOString()
        }
      })
      .eq('id', matchingRequestId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update matching request: ${updateError.message}`);
    }

    console.log('9. Sending completion email...');
    try {
      await supabaseClient.functions.invoke('send-analysis-complete-email', {
        body: {
          companyId: matchingRequest.companies.id,
          matchingRequestId: matchingRequestId,
          reportSummary: analysisContent.substring(0, 200) + '...'
        }
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email failed (continuing anyway):', emailError);
    }

    console.log('=== ANALYSIS COMPLETED SUCCESSFULLY ===');
    return new Response(JSON.stringify({
      success: true,
      message: '분석이 성공적으로 완료되었습니다.',
      tokens: openaiData.usage?.total_tokens || 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== ANALYSIS FAILED ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try to revert status on error
    try {
      const body = await req.clone().json();
      if (body.matchingRequestId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient
          .from('matching_requests')
          .update({ 
            status: 'pending',
            admin_comments: `분석 실패: ${error.message}`
          })
          .eq('id', body.matchingRequestId);
      }
    } catch (revertError) {
      console.error('Failed to revert status:', revertError);
    }

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