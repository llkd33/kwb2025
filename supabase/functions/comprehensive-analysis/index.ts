import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  matchingRequestId: number;
}

interface CompanyData {
  id: number;
  company_name: string;
  industry: string;
  target_countries: string[];
  company_description?: string;
  product_info?: string;
  market_info?: string;
  additional_questions?: string;
  main_products?: string;
  target_market?: string;
  competitive_advantage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting comprehensive analysis function');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { matchingRequestId }: AnalysisRequest = requestBody;

    if (!matchingRequestId) {
      throw new Error('matchingRequestId is required');
    }

    console.log(`Starting comprehensive analysis for request ${matchingRequestId}`);

    // 1. Get matching request and company data
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', matchingRequestId)
      .single();

    if (requestError) {
      console.error('Error fetching matching request:', requestError);
      throw new Error(`매칭 요청을 찾을 수 없습니다: ${requestError.message}`);
    }

    if (!matchingRequest) {
      throw new Error('매칭 요청을 찾을 수 없습니다.');
    }

    const company = matchingRequest.companies;
    if (!company) {
      throw new Error('회사 정보를 찾을 수 없습니다.');
    }
    
    console.log(`Analyzing company: ${company.company_name}`);

    // 2. Get active prompts
    const { data: prompts, error: promptError } = await supabaseClient
      .from('gpt_prompts')
      .select('*')
      .eq('is_active', true);

    if (promptError) {
      console.error('Error fetching prompts:', promptError);
      throw new Error(`프롬프트를 불러오는데 실패했습니다: ${promptError.message}`);
    }

    const companyAnalysisPrompt = prompts?.find(p => p.prompt_type === 'company_analysis');
    const marketResearchPrompt = prompts?.find(p => p.prompt_type === 'market_research');
    const finalReportPrompt = prompts?.find(p => p.prompt_type === 'final_report');

    console.log(`Found prompts - company: ${!!companyAnalysisPrompt}, market: ${!!marketResearchPrompt}, final: ${!!finalReportPrompt}`);

    // 3. Get relevant market data
    let marketData = [];
    try {
      const { data, error: marketError } = await supabaseClient
        .from('market_data')
        .select('*')
        .eq('is_active', true);

      if (marketError) {
        console.error('Error fetching market data:', marketError);
      } else {
        marketData = data || [];
      }
    } catch (marketErr) {
      console.error('Market data fetch failed:', marketErr);
      // Continue without market data
    }

    console.log(`Found ${marketData?.length || 0} relevant market data entries`);

    // 4. Step 1: Company Analysis with GPT
    console.log('Starting company analysis...');
    const companyAnalysis = await performGPTAnalysis(
      companyAnalysisPrompt?.system_prompt || 'You are a business analyst.',
      fillPromptTemplate(companyAnalysisPrompt?.user_prompt_template || '', {
        company_name: company.company_name,
        industry: company.industry,
        target_countries: matchingRequest.target_countries.join(', '),
        company_description: matchingRequest.company_description || company.main_products || '',
        product_info: matchingRequest.product_info || company.main_products || '',
        market_info: matchingRequest.market_info || company.target_market || ''
      }),
      'company_analysis'
    );

    // Save intermediate result
    await supabaseClient
      .from('gpt_analysis')
      .insert({
        matching_request_id: matchingRequestId,
        analysis_type: 'company_analysis',
        prompt_used: companyAnalysisPrompt?.user_prompt_template,
        raw_response: companyAnalysis.content,
        structured_data: { analysis: companyAnalysis.content },
        tokens_used: companyAnalysis.tokens,
        processing_time: companyAnalysis.processingTime
      });

    // 5. Step 2: Market Research with Perplexity
    const marketResearch = await performPerplexityResearch(
      fillPromptTemplate(marketResearchPrompt?.user_prompt_template || '', {
        company_name: company.company_name,
        target_countries: matchingRequest.target_countries.join(', '),
        industry: company.industry,
        additional_questions: matchingRequest.additional_questions || ''
      })
    );

    // Save intermediate result
    await supabaseClient
      .from('gpt_analysis')
      .insert({
        matching_request_id: matchingRequestId,
        analysis_type: 'market_research',
        prompt_used: marketResearchPrompt?.user_prompt_template,
        raw_response: marketResearch.content,
        structured_data: { research: marketResearch.content },
        tokens_used: marketResearch.tokens,
        processing_time: marketResearch.processingTime
      });

    // 6. Step 3: Final Comprehensive Report with GPT
    const finalReport = await performGPTAnalysis(
      finalReportPrompt?.system_prompt || 'You are creating a comprehensive business report.',
      fillPromptTemplate(finalReportPrompt?.user_prompt_template || '', {
        company_analysis: companyAnalysis.content,
        market_research: marketResearch.content,
        reference_data: formatMarketData(marketData || [])
      }),
      'final_report'
    );

    // Save final result
    await supabaseClient
      .from('gpt_analysis')
      .insert({
        matching_request_id: matchingRequestId,
        analysis_type: 'final_report',
        prompt_used: finalReportPrompt?.user_prompt_template,
        raw_response: finalReport.content,
        structured_data: { 
          final_report: finalReport.content,
          company_analysis: companyAnalysis.content,
          market_research: marketResearch.content
        },
        tokens_used: finalReport.tokens,
        processing_time: finalReport.processingTime
      });

     // 7. Parse and structure the results
     let parsedCompanyAnalysis: any;
     let parsedMarketResearch: any;
     
     try {
       parsedCompanyAnalysis = JSON.parse(companyAnalysis.content);
     } catch {
       parsedCompanyAnalysis = { analysis: companyAnalysis.content };
     }
     
     try {
       parsedMarketResearch = JSON.parse(marketResearch.content);
     } catch {
       parsedMarketResearch = { research: marketResearch.content };
     }

     // 8. Update matching request status
     await supabaseClient
       .from('matching_requests')
       .update({
         status: 'completed',
         completed_at: new Date().toISOString(),
         ai_analysis: parsedCompanyAnalysis,
         market_research: parsedMarketResearch,
         final_report: {
           content: finalReport.content,
           generated_at: new Date().toISOString(),
           total_tokens: companyAnalysis.tokens + marketResearch.tokens + finalReport.tokens,
           total_processing_time: companyAnalysis.processingTime + marketResearch.processingTime + finalReport.processingTime
         }
       })
       .eq('id', matchingRequestId);

    // 8. Send completion email
    try {
      await supabaseClient.functions.invoke('send-analysis-complete-email', {
        body: {
          companyId: company.id,
          matchingRequestId: matchingRequestId,
          reportSummary: finalReport.content.substring(0, 500) + '...'
        }
      });
    } catch (emailError) {
      console.error('Failed to send completion email:', emailError);
    }

    console.log(`Analysis completed for request ${matchingRequestId}`);

    return new Response(JSON.stringify({
      success: true,
      message: '종합 분석이 완료되었습니다.',
      analysis: {
        company_analysis: companyAnalysis.content,
        market_research: marketResearch.content,
        final_report: finalReport.content
      },
      metadata: {
        total_tokens: companyAnalysis.tokens + marketResearch.tokens + finalReport.tokens,
        total_processing_time: companyAnalysis.processingTime + marketResearch.processingTime + finalReport.processingTime
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function performGPTAnalysis(systemPrompt: string, userPrompt: string, analysisType: string) {
  const startTime = Date.now();
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.statusText}`);
  }

  const data = await response.json();
  const processingTime = Date.now() - startTime;

  return {
    content: data.choices[0].message.content,
    tokens: data.usage?.total_tokens || 0,
    processingTime
  };
}

async function performPerplexityResearch(query: string) {
  const startTime = Date.now();
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a market research expert. Provide comprehensive, current market analysis with specific data points, trends, and actionable insights. Include recent developments and regulatory changes.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 4000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  const processingTime = Date.now() - startTime;

  return {
    content: data.choices[0].message.content,
    tokens: data.usage?.total_tokens || 0,
    processingTime
  };
}

function fillPromptTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '정보 없음');
  });
  
  return result;
}

function formatMarketData(marketData: any[]): string {
  if (!marketData.length) {
    return '참조 가능한 시장 데이터가 없습니다.';
  }

  return marketData.map(data => {
    const header = `=== ${data.data_category} ===`;
    const location = data.country ? `국가: ${data.country}` : '';
    const industry = data.industry ? `업종: ${data.industry}` : '';
    const content = typeof data.data_content === 'object' 
      ? JSON.stringify(data.data_content, null, 2)
      : data.data_content;
    
    return [header, location, industry, content].filter(Boolean).join('\n');
  }).join('\n\n');
}

serve(handler);