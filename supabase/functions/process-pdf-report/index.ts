import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  console.log('=== PDF REPORT PROCESSING STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchingRequestId, pdfUrl } = await req.json();
    console.log(`Processing PDF for matching request: ${matchingRequestId}`);

    // 1. Get matching request and company data
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`
        *,
        companies(*),
        pdf_uploads(*)
      `)
      .eq('id', matchingRequestId)
      .single();

    if (requestError) throw new Error(`Failed to fetch matching request: ${requestError.message}`);

    // 2. Get prompt templates
    const { data: promptTemplates } = await supabaseClient
      .from('prompt_templates')
      .select('*')
      .eq('is_active', true);

    const gptPromptTemplate = promptTemplates?.find(p => p.name === 'comprehensive_analysis_gpt');
    const perplexityPromptTemplate = promptTemplates?.find(p => p.name === 'market_research_perplexity');

    // 3. Get Excel reference data
    const { data: excelData } = await supabaseClient
      .from('excel_reference')
      .select('*')
      .eq('is_active', true);

    // 4. Prepare prompts with template variables
    const templateVars = {
      company_name: matchingRequest.companies.company_name,
      industry: matchingRequest.companies.industry,
      target_countries: matchingRequest.target_countries.join(', '),
      business_goals: matchingRequest.business_goals || '',
      documents: matchingRequest.pdf_uploads?.map((p: any) => p.file_name).join(', ') || 'PDF 문서',
      excel_reference_data: JSON.stringify(excelData, null, 2)
    };

    // Replace template variables
    let gptPrompt = gptPromptTemplate?.template || '';
    let perplexityPrompt = perplexityPromptTemplate?.template || '';

    Object.entries(templateVars).forEach(([key, value]) => {
      gptPrompt = gptPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      perplexityPrompt = perplexityPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    });

    // 5. Update status to processing
    await supabaseClient
      .from('matching_requests')
      .update({ 
        workflow_status: 'ai_processing',
        gpt_prompt_used: gptPrompt,
        perplexity_prompt_used: perplexityPrompt
      })
      .eq('id', matchingRequestId);

    // 6. Call GPT-4 for comprehensive analysis
    console.log('Calling GPT-4 for analysis...');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OpenAI API key not found');

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a Goldman Sachs-level business analyst. Provide comprehensive analysis in JSON format with Korean text.' 
          },
          { role: 'user', content: gptPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`OpenAI API failed: ${await gptResponse.text()}`);
    }

    const gptData = await gptResponse.json();
    const gptAnalysis = JSON.parse(gptData.choices[0].message.content);

    // 7. Call Perplexity for real-time market research
    console.log('Calling Perplexity for market research...');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    let marketResearch = null;

    if (perplexityApiKey) {
      try {
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              { role: 'user', content: perplexityPrompt }
            ],
            temperature: 0.2,
            top_p: 0.9,
            search_domain_filter: ["perplexity.ai"],
            return_citations: true,
            search_recency_filter: "month",
            top_k: 0,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 1
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          marketResearch = {
            content: perplexityData.choices[0].message.content,
            citations: perplexityData.citations || []
          };
        }
      } catch (perplexityError) {
        console.error('Perplexity API error:', perplexityError);
      }
    }

    // 8. Save analysis results
    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        workflow_status: 'admin_review',
        ai_analysis: gptAnalysis,
        market_research: marketResearch,
        completed_at: new Date().toISOString()
      })
      .eq('id', matchingRequestId);

    if (updateError) throw new Error(`Failed to update analysis: ${updateError.message}`);

    // 9. Create GPT analysis record
    await supabaseClient
      .from('gpt_analysis')
      .insert({
        matching_request_id: matchingRequestId,
        analysis_type: 'comprehensive_pdf_analysis',
        prompt_used: gptPrompt,
        raw_response: gptData.choices[0].message.content,
        structured_data: gptAnalysis,
        tokens_used: gptData.usage?.total_tokens || 0,
        processing_time: 0
      });

    console.log('=== PDF REPORT PROCESSING COMPLETED ===');
    
    return new Response(JSON.stringify({
      success: true,
      message: '분석이 완료되어 관리자 검토 대기 중입니다.',
      analysisId: matchingRequestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== PDF PROCESSING FAILED ===');
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});