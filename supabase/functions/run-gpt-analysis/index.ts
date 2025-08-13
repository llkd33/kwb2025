import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Utility function for retryable API calls
async function retryableApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
  backoffMultiplier = 2
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`API call attempt ${attempt + 1}/${maxRetries}`);
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      console.error(`API call failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('API call failed after all retries');
}

serve(async (req: Request) => {
  console.log('=== GPT ANALYSIS STARTED ===');
  
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
    const { matchingRequestId, adminPrompt } = requestBody;
    console.log(`Matching request ID: ${matchingRequestId}`);

    if (!matchingRequestId) {
      throw new Error('matchingRequestId is required');
    }

    console.log('3. Fetching matching request data...');
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`*, companies:companies!matching_requests_company_id_fkey(*)`)
      .eq('id', matchingRequestId)
      .single();

    if (requestError) throw requestError;
    if (!matchingRequest) throw new Error('Matching request not found');

    console.log(`4. Found company: ${matchingRequest.companies.company_name}`);

    // Fetch admin uploaded excel data
    const { data: excelData, error: excelError } = await supabaseClient
      .from('admin_excel_data')
      .select('data_content')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (excelError) {
      console.warn('Could not fetch admin excel data, proceeding without it.', excelError);
    }
    
    const excelContext = excelData ? `\n\n다음은 관리자가 업로드한 추가적인 시장 데이터입니다. 분석에 반드시 참고하고 언급해주세요:\n\`\`\`json\n${JSON.stringify(excelData.data_content, null, 2)}\n\`\`\`` : "";

    // Helper to replace placeholders in prompt templates
    const replacePlaceholders = (tpl: string): string => {
      return tpl
        .replaceAll('{{company_name}}', String(matchingRequest.companies.company_name || ''))
        .replaceAll('{{industry}}', String(matchingRequest.companies.industry || ''))
        .replaceAll('{{target_countries}}', Array.isArray(matchingRequest.target_countries) ? matchingRequest.target_countries.join(', ') : String(matchingRequest.target_countries || ''))
        .replaceAll('{{company_description}}', String(matchingRequest.company_description || '정보 없음'))
        .replaceAll('{{product_info}}', String(matchingRequest.product_info || '정보 없음'))
        .replaceAll('{{market_info}}', String(matchingRequest.market_info || '정보 없음'))
        .replaceAll('{{pdf_summary}}', String(matchingRequest.pdf_summary || '요약 없음'))
        .replaceAll('{{excel_context}}', excelContext)
        .replaceAll('{{admin_prompt}}', adminPrompt || '');
    };

    // Load GPT basic prompt from DB if available
    let systemPromptBasic = 'You are an expert business analyst specializing in international market expansion. Provide detailed analysis in JSON format with Korean text.';
    let userPromptBasic = `너는 글로벌 IB(투자은행) 출신의 시니어 컨설턴트로서, 골드만삭스 수준의 정밀성과 구조화로 기업 분석 리포트를 작성한다. 단순 요약이 아니라 최신 외부 정보와 정량/정성 데이터를 결합하여 전략적 시사점을 도출하라.\n\n요청 기업 정보:\n- 회사명: {{company_name}}\n- 업종: {{industry}}\n- 타겟 국가: {{target_countries}}\n- 회사 설명: {{company_description}}\n- 제품/서비스: {{product_info}}\n- 시장 경험: {{market_info}}\n- PDF 요약(참고용): {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n\nJSON으로 응답.`;
    try {
      const { data: dbPrompt } = await supabaseClient
        .from('gpt_prompts')
        .select('*')
        .ilike('prompt_type', '%gpt_basic%')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dbPrompt) {
        systemPromptBasic = dbPrompt.system_prompt || systemPromptBasic;
        userPromptBasic = dbPrompt.user_prompt_template || userPromptBasic;
      }
    } catch (e) {
      console.warn('Failed to load gpt_basic prompt from DB, using default');
    }
    const basicAnalysisPrompt = replacePlaceholders(userPromptBasic);

    let openaiAnalysis: any = null;
    let tokensUsed = 0;

    console.log('5. Updating status to processing...');
    await supabaseClient
      .from('matching_requests')
      .update({ workflow_status: 'ai_processing' })
      .eq('id', matchingRequestId);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('6. Starting OpenAI analysis...');
    const openAIResult = await retryableApiCall(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPromptBasic },
            { 
              role: 'user', 
              content: basicAnalysisPrompt 
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API failed (${response.status}): ${errorText}`);
      }
      return response.json();
    });

    console.log('7. OpenAI analysis completed.');
    tokensUsed += openAIResult.usage?.total_tokens || 0;
    const rawContent = openAIResult.choices[0].message.content;

    try {
      // Clean the response content before parsing
      let cleanContent = rawContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON from the content if it's mixed with other text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned OpenAI content:', cleanContent.substring(0, 200) + '...');
      openaiAnalysis = JSON.parse(cleanContent);
      console.log('Successfully parsed OpenAI JSON response');
    } catch (e) {
      console.error('Failed to parse OpenAI JSON response, saving as raw text.', e);
      console.log('Raw content that failed to parse:', rawContent.substring(0, 1000) + '...');
      openaiAnalysis = {
        parsing_error: true,
        error_message: '응답을 JSON으로 파싱할 수 없습니다.',
        raw_content: rawContent,
        note: 'JSON 파싱에 실패했지만 원본 내용이 저장되었습니다. 관리자가 수동으로 검토해주세요.'
      };
    }
    
    // Add metadata to the analysis
    openaiAnalysis.analysis_provider = 'OpenAI';
    openaiAnalysis.generated_at = new Date().toISOString();
    openaiAnalysis.prompt_used = basicAnalysisPrompt;

    // ====== Additional: GPT Market Research ======
    console.log('8. Starting GPT market research...');
    // Load GPT market research prompt from DB if available
    let systemPromptMarket = 'You are a market research analyst. Output strict JSON without code fences.';
    let userPromptMarket = `너는 골드만삭스 리서치 퀄리티의 마켓 애널리스트다. 최신 공개자료/뉴스/규제문서/공시/애널리스트 노트를 교차검증하여 시장조사를 수행하라.\n\n대상 기업: {{company_name}}\n업종: {{industry}}\n타겟 국가: {{target_countries}}\nPDF 요약(참고용): {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n\nJSON으로 응답.`;
    try {
      const { data: dbPrompt2 } = await supabaseClient
        .from('gpt_prompts')
        .select('*')
        .ilike('prompt_type', '%gpt_market%')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dbPrompt2) {
        systemPromptMarket = dbPrompt2.system_prompt || systemPromptMarket;
        userPromptMarket = dbPrompt2.user_prompt_template || userPromptMarket;
      }
    } catch (e) {
      console.warn('Failed to load gpt_market prompt from DB, using default');
    }
    const marketResearchPrompt = replacePlaceholders(userPromptMarket);

    const gptMarket = await retryableApiCall(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPromptMarket },
            { role: 'user', content: marketResearchPrompt }
          ],
          max_tokens: 1800,
          temperature: 0.6,
          response_format: { type: 'json_object' }
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI market research failed (${response.status}): ${errorText}`);
      }
      return response.json();
    });
    tokensUsed += gptMarket.usage?.total_tokens || 0;
    let gptMarketData: any;
    try {
      // Clean the response content before parsing
      let cleanContent = gptMarket.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON from the content if it's mixed with other text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned GPT market content:', cleanContent.substring(0, 200) + '...');
      gptMarketData = JSON.parse(cleanContent);
      console.log('Successfully parsed GPT market JSON response');
    } catch (e) {
      console.error('Failed to parse GPT market JSON response, saving as raw text.', e);
      gptMarketData = { 
        parsing_error: true, 
        raw_content: gptMarket.choices?.[0]?.message?.content,
        error_message: e instanceof Error ? e.message : 'Unknown parsing error',
        note: 'JSON 파싱에 실패했지만 원본 내용이 저장되었습니다.'
      };
    }

    // Merge market_research providers
    const existingMR = matchingRequest.market_research || {};
    const mergedMarketResearch = {
      ...existingMR,
      gpt: {
        status: 'completed',
        data: gptMarketData,
        provider: 'OpenAI',
        prompt_used: marketResearchPrompt,
        generated_at: new Date().toISOString()
      }
    };

    console.log('9. Updating matching request with GPT analysis and market research...');
    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        // Set to gpt_completed to enable Perplexity analysis button
        workflow_status: 'gpt_completed',
        ai_analysis: openaiAnalysis,
        market_research: mergedMarketResearch
      })
      .eq('id', matchingRequestId);

    if (updateError) {
      throw new Error(`Failed to update matching request with GPT analysis: ${updateError.message}`);
    }

    console.log('=== GPT ANALYSIS COMPLETED SUCCESSFULLY ===');
    return new Response(JSON.stringify({
      success: true,
      message: 'GPT 분석이 성공적으로 완료되었습니다.',
      analysisId: matchingRequestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== GPT ANALYSIS FAILED ===', error);
    // Revert status on error
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
            workflow_status: 'gpt_failed',
            error_details: {
              type: 'gpt_analysis',
              message: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', body.matchingRequestId);
      }
    } catch (revertError: any) {
      console.error('Failed to revert status on error:', revertError.message);
    }

    return new Response(JSON.stringify({
      error: error.message,
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});