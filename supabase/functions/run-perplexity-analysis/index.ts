import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
  console.log('=== PERPLEXITY ANALYSIS STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { matchingRequestId, adminPrompt } = requestBody;
    if (!matchingRequestId) throw new Error('matchingRequestId is required');

    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select(`*, companies:companies!matching_requests_company_id_fkey(*)`)
      .eq('id', matchingRequestId)
      .single();

    if (requestError) throw requestError;
    if (!matchingRequest) throw new Error('Matching request not found');

    // Build prompt from DB (gpt_prompts) with placeholders
    const replacePlaceholders = (tpl: string): string => {
      return tpl
        .replaceAll('{{company_name}}', String(matchingRequest.companies.company_name || ''))
        .replaceAll('{{industry}}', String(matchingRequest.companies.industry || ''))
        .replaceAll('{{target_countries}}', Array.isArray(matchingRequest.target_countries) ? matchingRequest.target_countries.join(', ') : String(matchingRequest.target_countries || ''))
        .replaceAll('{{admin_prompt}}', adminPrompt || '');
    };

    let systemPrompt = 'You are a market research analyst with access to real-time web data. CRITICAL FORMATTING RULES: 1) Response must be ONLY valid JSON - no markdown, backticks, explanations, or additional text. 2) Start with { and end with }. 3) Use double quotes for all strings. 4) Escape quotes inside strings with \\". 5) No trailing commas. 6) Use Korean text for content values. 7) Focus on recent trends, news, and data from the last 6 months. 8) If you cannot provide complete data, use "정보 확인 필요" as placeholder text.';
    let userPrompt = `너는 골드만삭스 리서치 퀄리티의 실시간 마켓 애널리스트다. 웹 최신 정보를 교차 확인하여 시장조사를 수행하라.\n\n대상 기업: {{company_name}}\n업종: {{industry}}\n타겟 국가: {{target_countries}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n\n다음 JSON 구조로만 응답하라 (다른 텍스트나 마크다운 없이): { "market_analysis": {"country_markets": "", "market_size": "", "recent_changes": ""}, "competitors": {"top_companies": "", "positioning": "", "recent_performance": ""}, "partnerships": {"recent_deals": "", "success_cases": "", "failure_analysis": ""}, "potential_partners": {"priority_companies": "", "approach_strategy": "", "contact_methods": ""}, "risks": {"regulatory_risks": "", "cultural_risks": "", "competitive_risks": "", "mitigation_strategies": ""}, "summary": {"key_points": "", "recommendations": "", "next_steps": ""} }`;
    try {
      const { data: dbPrompt } = await supabaseClient
        .from('gpt_prompts')
        .select('*')
        .ilike('prompt_type', '%perplexity%')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dbPrompt) {
        systemPrompt = dbPrompt.system_prompt || systemPrompt;
        userPrompt = dbPrompt.user_prompt_template || userPrompt;
      }
    } catch (e) {
      console.warn('Failed to load perplexity prompt from DB, using default');
    }
    const marketResearchPrompt = replacePlaceholders(userPrompt);

    // Use allowed status value while processing
    await supabaseClient
      .from('matching_requests')
      .update({ workflow_status: 'ai_processing' })
      .eq('id', matchingRequestId);

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    console.log('Starting Perplexity market research...');
    console.log('Perplexity API Key present:', !!perplexityApiKey);
    console.log('Prompt length:', marketResearchPrompt.length);
    
    let perplexityResult: any = null;
    const perplexityCall = await (async () => {
      try {
        const requestBody = {
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: marketResearchPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          return_citations: true,
        };
        
        console.log('Sending request to Perplexity API...');
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Perplexity API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('PERPLEXITY_API_ERROR', { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText?.slice(0, 1000) 
          });
          return { ok: false, status: response.status, errorText, statusText: response.statusText };
        }
        
        const jsonResponse = await response.json();
        console.log('Perplexity API response received, choices count:', jsonResponse.choices?.length);
        if (jsonResponse.choices?.[0]?.message?.content) {
          console.log('Content preview:', jsonResponse.choices[0].message.content.substring(0, 200) + '...');
        }
        
        // Log citations structure for debugging
        console.log('Response has citations at root:', !!jsonResponse.citations);
        console.log('Response citations count:', jsonResponse.citations?.length || 0);
        if (jsonResponse.citations && jsonResponse.citations.length > 0) {
          console.log('First citation example:', JSON.stringify(jsonResponse.citations[0], null, 2));
        }
        
        return { ok: true, json: jsonResponse };
      } catch (fetchError: any) {
        console.error('PERPLEXITY_FETCH_ERROR', { message: fetchError.message, stack: fetchError.stack });
        return { ok: false, error: fetchError.message, type: 'fetch_error' };
      }
    })();

    if (perplexityCall.ok) {
      perplexityResult = perplexityCall.json;
    }

    let marketResearchData: any;
    if (perplexityResult) {
      console.log('Perplexity research completed.');
      const rawContent = perplexityResult.choices[0].message.content;
      let perplexityAnalysis: any;
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
        
        // Additional cleaning for common JSON issues
        cleanContent = cleanContent
          // Fix common quote issues
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          // Fix trailing commas
          .replace(/,(\s*[}\]])/g, '$1')
          // Fix missing quotes around keys
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
          // Fix unescaped quotes in strings (basic attempt)
          .replace(/:\s*"([^"]*)"([^",}\]]*)"([^",}\]]*)/g, ':"$1\\"$2\\"$3"');
        
        console.log('Attempting to parse cleaned content:', cleanContent.substring(0, 200) + '...');
        
        // Try multiple parsing strategies
        let parsed = false;
        
        // Strategy 1: Direct parsing
        try {
          perplexityAnalysis = JSON.parse(cleanContent);
          parsed = true;
          console.log('Successfully parsed Perplexity JSON response (direct)');
        } catch (e1) {
          console.log('Direct parsing failed, trying alternative methods...');
          
          // Strategy 2: Try to fix common issues and parse again
          try {
            let fixedContent = cleanContent
              // Remove any trailing text after the last }
              .replace(/\}[^}]*$/, '}')
              // Fix double commas
              .replace(/,,+/g, ',')
              // Fix spaces in property names
              .replace(/"([^"]*)\s+([^"]*)"\s*:/g, '"$1_$2":');
            
            perplexityAnalysis = JSON.parse(fixedContent);
            parsed = true;
            console.log('Successfully parsed Perplexity JSON response (fixed)');
          } catch (e2) {
            console.log('Fixed parsing also failed, trying manual extraction...');
            
            // Strategy 3: Manual extraction of key-value pairs
            try {
              const manualParsed: any = {};
              const keyValueRegex = /"([^"]+)"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g;
              let match;
              
              while ((match = keyValueRegex.exec(cleanContent)) !== null) {
                manualParsed[match[1]] = match[2].replace(/\\"/g, '"');
              }
              
              if (Object.keys(manualParsed).length > 0) {
                perplexityAnalysis = manualParsed;
                parsed = true;
                console.log('Successfully extracted data using manual parsing');
              }
            } catch (e3) {
              console.log('Manual parsing also failed');
            }
          }
        }
        
        if (!parsed) {
          throw new Error('All parsing strategies failed');
        }
      } catch (e) {
        console.error('Failed to parse Perplexity JSON response, saving as raw text.', e);
        console.log('Raw content that failed to parse:', rawContent.substring(0, 1000) + '...');
        
        // Try to create a structured response from the raw content using text extraction
        const extractTextSection = (content: string, keywords: string[]) => {
          for (const keyword of keywords) {
            const regex = new RegExp(`${keyword}[^\\n]*\\n([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
            const match = content.match(regex);
            if (match) {
              return match[1].trim().substring(0, 500);
            }
          }
          return '해당 섹션의 정보를 원본 내용에서 확인해주세요.';
        };
        
        perplexityAnalysis = {
          parsing_error: true,
          raw_content: rawContent,
          error_message: e instanceof Error ? e.message : 'Unknown parsing error',
          
          // Try to extract structured information from raw text
          market_analysis: {
            country_markets: extractTextSection(rawContent, ['국가별', '시장', 'market']),
            market_size: extractTextSection(rawContent, ['시장규모', '성장률', 'market size', 'growth']),
            recent_changes: extractTextSection(rawContent, ['최근', '변경', 'recent', 'changes'])
          },
          competitors: {
            top_companies: extractTextSection(rawContent, ['경쟁사', '경쟁업체', 'competitor', 'competition']),
            positioning: extractTextSection(rawContent, ['포지셔닝', 'positioning', '전략', 'strategy']),
            recent_performance: extractTextSection(rawContent, ['성과', '실적', 'performance', 'results'])
          },
          partnerships: {
            recent_deals: extractTextSection(rawContent, ['MoU', 'Agreement', 'M&A', '제휴', '협약']),
            success_cases: extractTextSection(rawContent, ['성공', 'success', '사례', 'case']),
            failure_analysis: extractTextSection(rawContent, ['실패', 'failure', '교훈', 'lesson'])
          },
          potential_partners: {
            priority_companies: extractTextSection(rawContent, ['우선순위', 'priority', '파트너', 'partner']),
            approach_strategy: extractTextSection(rawContent, ['접근', 'approach', '전략', 'strategy']),
            contact_methods: extractTextSection(rawContent, ['연락', 'contact', '방법', 'method'])
          },
          risks: {
            regulatory_risks: extractTextSection(rawContent, ['규제', 'regulatory', '리스크', 'risk']),
            cultural_risks: extractTextSection(rawContent, ['문화', 'cultural', '리스크', 'risk']),
            competitive_risks: extractTextSection(rawContent, ['경쟁', 'competitive', '리스크', 'risk']),
            mitigation_strategies: extractTextSection(rawContent, ['대응', 'mitigation', '완화', 'strategy'])
          },
          summary: {
            key_points: extractTextSection(rawContent, ['핵심', 'key', '요약', 'summary']),
            recommendations: extractTextSection(rawContent, ['추천', 'recommendation', '제안', 'suggestion']),
            next_steps: extractTextSection(rawContent, ['다음', 'next', '단계', 'step'])
          },
          
          note: 'JSON 파싱에 실패했지만 텍스트에서 구조화된 정보를 추출했습니다. 원본 내용도 함께 저장되었습니다.'
        };
      }
      // Extract citations from Perplexity response
      // According to Perplexity API docs, citations are returned at root level when return_citations: true
      const citations = perplexityResult.citations || [];
      
      // Log citations for debugging
      console.log('Extracted citations:', citations);
      console.log('Citations count:', citations.length);
      marketResearchData = {
        status: 'completed',
        data: perplexityAnalysis,
        citations,
        prompt_used: marketResearchPrompt,
        provider: 'Perplexity',
        generated_at: new Date().toISOString()
      };
    } else {
      // Soft-fail path - still update with error info
      console.error('Perplexity call failed, details:', perplexityCall);
      marketResearchData = {
        status: 'failed',
        error: perplexityCall?.errorText || perplexityCall?.error || 'Perplexity call failed',
        error_type: perplexityCall?.type || 'api_error',
        status_code: perplexityCall?.status,
        status_text: perplexityCall?.statusText,
        prompt_used: marketResearchPrompt,
        provider: 'Perplexity',
        generated_at: new Date().toISOString()
      };
    }
    
    console.log('Updating matching request with Perplexity results...');
    console.log('Market research data status:', marketResearchData.status);
    
    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        // Set to perplexity_completed even if failed (so admin can review)
        workflow_status: 'perplexity_completed',
        market_research: marketResearchData
      })
      .eq('id', matchingRequestId);

    if (updateError) {
      throw new Error(`Failed to update matching request with Perplexity analysis: ${updateError.message}`);
    }

    console.log('=== PERPLEXITY ANALYSIS COMPLETED SUCCESSFULLY ===');
    return new Response(JSON.stringify({
      success: true,
      message: 'Perplexity 분석이 성공적으로 완료되었습니다.',
      analysisId: matchingRequestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== PERPLEXITY ANALYSIS FAILED ===', error);
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
            // Keep in admin_review even on failure
            workflow_status: 'admin_review',
            error_details: {
              type: 'perplexity_analysis',
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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});