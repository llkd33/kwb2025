import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Lang = 'ko' | 'ja' | 'en';

const LANGUAGE_CONFIG: Record<Lang, { systemPrompt: string; userPromptTemplate: string; marketPrompt: string; }> = {
  ko: {
    systemPrompt: '당신은 해외시장 진출 자문과 기업 분석에 능숙한 애널리스트입니다. 반드시 JSON 형식으로만 응답하세요.',
    userPromptTemplate: `당신은 글로벌 투자은행(골드만삭스 급)의 시니어 컨설턴트입니다. 최신 정량/정성 데이터를 결합해 전략 인사이트를 도출하세요.

회사 정보:\n- 회사명: {{company_name}}\n- 업종: {{industry}}\n- 타겟 국가: {{target_countries}}\n- 회사 소개: {{company_description}}\n- 제품/서비스: {{product_info}}\n- 시장 경험: {{market_info}}\n- PDF 요약: {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n\n다음 JSON 형식으로만 응답하세요:\n{\n  "executive_summary": "전체 요약 (200-300자)",\n  "market_analysis": {\n    "market_size": "시장 규모 분석",\n    "growth_trends": "성장 트렌드",\n    "key_players": "주요 경쟁사",\n    "market_barriers": "진입 장벽"\n  },\n  "company_analysis": {\n    "strengths": ["강점1", "강점2", "강점3"],\n    "weaknesses": ["약점1", "약점2"],\n    "opportunities": ["기회1", "기회2", "기회3"],\n    "threats": ["위협1", "위협2"]\n  },\n  "target_market_insights": {\n    "cultural_considerations": "문화적 고려사항",\n    "regulatory_environment": "규제 환경",\n    "consumer_behavior": "소비자 행동",\n    "pricing_strategy": "가격 전략"\n  },\n  "financial_projections": {\n    "revenue_forecast": "매출 전망",\n    "cost_structure": "비용 구조",\n    "investment_requirements": "투자 필요",\n    "roi_timeline": "ROI 타임라인"\n  },\n  "strategic_recommendations": {\n    "market_entry_strategy": "시장 진입 전략",\n    "partnership_opportunities": "파트너십 기회",\n    "risk_mitigation": "리스크 완화",\n    "success_metrics": "성공 지표"\n  },\n  "implementation_roadmap": {\n    "phase_1": "1단계 (0-6개월)",\n    "phase_2": "2단계 (6-18개월)",\n    "phase_3": "3단계 (18개월+)"\n  }\n}`,
    marketPrompt: `시장 조사 전문가로서 {{company_name}}의 {{target_countries}} 진출을 위한 상세 분석을 수행하세요.\n\n회사 정보:\n- 업종: {{industry}}\n- PDF 요약: {{pdf_summary}}\n{{excel_context}}\n\n관리자 추가 지시사항:\n{{admin_prompt}}\n\n다음 JSON 형식으로만 응답하세요:\n{\n  "market_overview": {\n    "market_size_usd": "시장 규모(USD)",\n    "growth_rate": "연평균 성장률",\n    "key_segments": ["핵심 세그먼트1", "핵심 세그먼트2"]\n  },\n  "competitive_landscape": {\n    "major_players": [{"company": "회사명", "market_share": "점유율", "key_strengths": "핵심 강점"}],\n    "market_concentration": "시장 집중도",\n    "competitive_intensity": "경쟁 강도"\n  },\n  "regulatory_analysis": {\n    "key_regulations": ["핵심 규제1", "핵심 규제2"],\n    "compliance_requirements": "컴플라이언스 요구사항",\n    "regulatory_changes": "최근 규제 변화"\n  },\n  "consumer_insights": {\n    "target_demographics": "타겟 인구통계",\n    "buying_behavior": "구매 행태",\n    "price_sensitivity": "가격 민감도",\n    "brand_preferences": "브랜드 선호"\n  },\n  "market_entry_analysis": {\n    "entry_barriers": ["장벽1", "장벽2"],\n    "success_factors": ["성공요인1", "성공요인2"],\n    "recommended_approach": "권장 접근법"\n  }\n}`,
  },
  ja: {
    systemPrompt: 'あなたは海外市場進出と企業分析に精通したアナリストです。必ずJSON形式のみで回答してください。',
    userPromptTemplate: `あなたはゴールドマンサックス級のシニアコンサルタントです。最新の定量/定性データを組み合わせて戦略的示唆を導出してください。\n\n企業情報:\n- 企業名: {{company_name}}\n- 業種: {{industry}}\n- 対象国: {{target_countries}}\n- 企業説明: {{company_description}}\n- 製品/サービス: {{product_info}}\n- 市場経験: {{market_info}}\n- PDF要約: {{pdf_summary}}\n{{excel_context}}\n\n管理者からの追加指示:\n{{admin_prompt}}\n\n以下のJSON形式のみで回答してください:\n{\n  "executive_summary": "全体サマリー (200-300字)",\n  "market_analysis": {\n    "market_size": "市場規模分析",\n    "growth_trends": "成長トレンド",\n    "key_players": "主要競合",\n    "market_barriers": "参入障壁"\n  },\n  "company_analysis": {\n    "strengths": ["強み1", "強み2", "強み3"],\n    "weaknesses": ["弱み1", "弱み2"],\n    "opportunities": ["機会1", "機会2", "機会3"],\n    "threats": ["脅威1", "脅威2"]\n  },\n  "target_market_insights": {\n    "cultural_considerations": "文化的考慮点",\n    "regulatory_environment": "規制環境",\n    "consumer_behavior": "消費者行動",\n    "pricing_strategy": "価格戦略"\n  },\n  "financial_projections": {\n    "revenue_forecast": "売上予測",\n    "cost_structure": "コスト構造",\n    "investment_requirements": "投資要件",\n    "roi_timeline": "ROIタイムライン"\n  },\n  "strategic_recommendations": {\n    "market_entry_strategy": "市場参入戦略",\n    "partnership_opportunities": "提携機会",\n    "risk_mitigation": "リスク低減",\n    "success_metrics": "成功指標"\n  },\n  "implementation_roadmap": {\n    "phase_1": "フェーズ1 (0-6ヶ月)",\n    "phase_2": "フェーズ2 (6-18ヶ月)",\n    "phase_3": "フェーズ3 (18ヶ月以上)"\n  }\n}`,
    marketPrompt: `市場調査の専門家として、{{company_name}}の{{target_countries}}進出に関する詳細分析を実施してください。\n\n企業情報:\n- 業種: {{industry}}\n- PDF要約: {{pdf_summary}}\n{{excel_context}}\n\n管理者からの追加指示:\n{{admin_prompt}}\n\n以下のJSON形式のみで回答してください:\n{\n  "market_overview": {\n    "market_size_usd": "市場規模(USD)",\n    "growth_rate": "年間成長率",\n    "key_segments": ["主要セグメント1", "主要セグメント2"]\n  },\n  "competitive_landscape": {\n    "major_players": [{"company": "企業名", "market_share": "シェア", "key_strengths": "強み"}],\n    "market_concentration": "市場集中度",\n    "competitive_intensity": "競争の激しさ"\n  },\n  "regulatory_analysis": {\n    "key_regulations": ["主要規制1", "主要規制2"],\n    "compliance_requirements": "コンプライアンス要件",\n    "regulatory_changes": "最近の規制変更"\n  },\n  "consumer_insights": {\n    "target_demographics": "ターゲット層",\n    "buying_behavior": "購買行動",\n    "price_sensitivity": "価格感度",\n    "brand_preferences": "ブランド嗜好"\n  },\n  "market_entry_analysis": {\n    "entry_barriers": ["障壁1", "障壁2"],\n    "success_factors": ["成功要因1", "成功要因2"],\n    "recommended_approach": "推奨アプローチ"\n  }\n}`,
  },
  en: {
    systemPrompt: 'You are an expert in international market expansion and a business analyst. Please provide detailed analysis in English and respond in JSON format.',
    userPromptTemplate: `You are a senior consultant from a Goldman Sachs-level global investment bank, creating corporate analysis reports. Please combine the latest information with quantitative and qualitative data to derive strategic insights.\n\nCompany Information:\n- Company Name: {{company_name}}\n- Industry: {{industry}}\n- Target Countries: {{target_countries}}\n- Company Description: {{company_description}}\n- Products/Services: {{product_info}}\n- Market Experience: {{market_info}}\n- PDF Summary: {{pdf_summary}}\n{{excel_context}}\n\nAdditional Administrator Instructions:\n{{admin_prompt}}\n\nPlease respond in the following JSON format:\n{\n  "executive_summary": "Overall summary (200-300 words)",\n  "market_analysis": {\n    "market_size": "Market size analysis",\n    "growth_trends": "Growth trends",\n    "key_players": "Key competitors",\n    "market_barriers": "Market entry barriers"\n  },\n  "company_analysis": {\n    "strengths": ["Strength 1", "Strength 2", "Strength 3"],\n    "weaknesses": ["Weakness 1", "Weakness 2"],\n    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],\n    "threats": ["Threat 1", "Threat 2"]\n  },\n  "target_market_insights": {\n    "cultural_considerations": "Cultural considerations",\n    "regulatory_environment": "Regulatory environment",\n    "consumer_behavior": "Consumer behavior patterns",\n    "pricing_strategy": "Pricing strategy recommendations"\n  },\n  "financial_projections": {\n    "revenue_forecast": "Revenue forecast",\n    "cost_structure": "Cost structure",\n    "investment_requirements": "Investment requirements",\n    "roi_timeline": "ROI timeline"\n  },\n  "strategic_recommendations": {\n    "market_entry_strategy": "Market entry strategy",\n    "partnership_opportunities": "Partnership opportunities",\n    "risk_mitigation": "Risk mitigation measures",\n    "success_metrics": "Success metrics"\n  },\n  "implementation_roadmap": {\n    "phase_1": "Phase 1 (0-6 months)",\n    "phase_2": "Phase 2 (6-18 months)",\n    "phase_3": "Phase 3 (18+ months)"\n  }\n}`,
    marketPrompt: `As a market research expert, please conduct a detailed market analysis for {{company_name}}'s expansion into {{target_countries}}.\n\nCompany Information:\n- Industry: {{industry}}\n- PDF Summary: {{pdf_summary}}\n{{excel_context}}\n\nAdditional Administrator Instructions:\n{{admin_prompt}}\n\nPlease respond in the following JSON format:\n{\n  "market_overview": {\n    "market_size_usd": "Market size (USD)",\n    "growth_rate": "Annual growth rate",\n    "key_segments": ["Key segment 1", "Key segment 2"]\n  },\n  "competitive_landscape": {\n    "major_players": [{"company": "Company name", "market_share": "Market share", "key_strengths": "Key strengths"}],\n    "market_concentration": "Market concentration",\n    "competitive_intensity": "Competitive intensity"\n  },\n  "regulatory_analysis": {\n    "key_regulations": ["Key regulation 1", "Key regulation 2"],\n    "compliance_requirements": "Compliance requirements",\n    "regulatory_changes": "Recent regulatory changes"\n  },\n  "consumer_insights": {\n    "target_demographics": "Target demographics",\n    "buying_behavior": "Buying behavior",\n    "price_sensitivity": "Price sensitivity",\n    "brand_preferences": "Brand preferences"\n  },\n  "market_entry_analysis": {\n    "entry_barriers": ["Entry barrier 1", "Entry barrier 2"],\n    "success_factors": ["Success factor 1", "Success factor 2"],\n    "recommended_approach": "Recommended approach"\n  }\n}`,
  },
};

async function retryableApiCall<T>(apiCall: () => Promise<T>, maxRetries = 3, delay = 1000, backoffMultiplier = 2): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        const wait = delay * Math.pow(backoffMultiplier, attempt);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastError || new Error('API call failed after all retries');
}

function determineLanguage(headers: Headers, userPreference?: string): Lang {
  if (userPreference && ['ko', 'ja', 'en'].includes(userPreference)) return userPreference as Lang;
  const acceptLanguage = headers.get('accept-language') || '';
  if (acceptLanguage.includes('ko') || acceptLanguage.includes('kr')) return 'ko';
  if (acceptLanguage.includes('ja') || acceptLanguage.includes('jp')) return 'ja';
  return 'en';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchingRequestId, adminPrompt, language: requestLanguage } = await req.json();
    if (!matchingRequestId) throw new Error('matchingRequestId is required');

    const language = determineLanguage(req.headers, requestLanguage);

    const { data: matchingRequest, error: reqErr } = await supabaseClient
      .from('matching_requests')
      .select(`*, companies:companies!matching_requests_company_id_fkey(*)`)
      .eq('id', matchingRequestId)
      .single();
    if (reqErr) throw reqErr;
    if (!matchingRequest) throw new Error('Matching request not found');

    const { data: excelData } = await supabaseClient
      .from('admin_excel_data')
      .select('data_content')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const excelContext = excelData
      ? `\n\n관리자가 업로드한 참조 데이터(JSON):\n\`\`\`json\n${JSON.stringify(excelData.data_content, null, 2)}\n\`\`\``
      : '';

    const replacePlaceholders = (tpl: string): string =>
      tpl
        .replaceAll('{{company_name}}', String(matchingRequest.companies.company_name || ''))
        .replaceAll('{{industry}}', String(matchingRequest.companies.industry || ''))
        .replaceAll('{{target_countries}}', Array.isArray(matchingRequest.target_countries) ? matchingRequest.target_countries.join(', ') : String(matchingRequest.target_countries || ''))
        .replaceAll('{{company_description}}', String(matchingRequest.company_description || 'N/A'))
        .replaceAll('{{product_info}}', String(matchingRequest.product_info || 'N/A'))
        .replaceAll('{{market_info}}', String(matchingRequest.market_info || 'N/A'))
        .replaceAll('{{pdf_summary}}', String(matchingRequest.pdf_summary || 'N/A'))
        .replaceAll('{{excel_context}}', excelContext)
        .replaceAll('{{admin_prompt}}', adminPrompt || '');

    const langCfg = LANGUAGE_CONFIG[language];
    let systemPromptBasic = langCfg.systemPrompt;
    let userPromptBasic = langCfg.userPromptTemplate;
    // DB override for prompts
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
    } catch (_) {}

    await supabaseClient
      .from('matching_requests')
      .update({ workflow_status: 'gpt_processing' })
      .eq('id', matchingRequestId);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY is not configured');

    // Primary GPT analysis
    const basicAnalysisPrompt = replacePlaceholders(userPromptBasic);
    const openAIResult = await retryableApiCall(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [ { role: 'system', content: systemPromptBasic }, { role: 'user', content: basicAnalysisPrompt } ],
          max_tokens: 3000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API failed (${response.status}): ${await response.text()}`);
      return response.json();
    });

    let openaiAnalysis: any;
    try {
      openaiAnalysis = JSON.parse((openAIResult.choices?.[0]?.message?.content || '').trim());
    } catch (_) {
      openaiAnalysis = { parsing_error: true, raw_content: openAIResult.choices?.[0]?.message?.content };
    }
    openaiAnalysis.analysis_provider = 'OpenAI';
    openaiAnalysis.generated_at = new Date().toISOString();
    openaiAnalysis.prompt_used = basicAnalysisPrompt;
    openaiAnalysis.analysis_language = language;

    // Market research via GPT
    let systemPromptMarket = langCfg.systemPrompt;
    let userPromptMarket = langCfg.marketPrompt;
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
    } catch (_) {}

    const marketResearchPrompt = replacePlaceholders(userPromptMarket);
    const gptMarket = await retryableApiCall(async () => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [ { role: 'system', content: systemPromptMarket }, { role: 'user', content: marketResearchPrompt } ],
          max_tokens: 2500,
          temperature: 0.6,
          response_format: { type: 'json_object' }
        }),
      });
      if (!response.ok) throw new Error(`OpenAI market research failed (${response.status}): ${await response.text()}`);
      return response.json();
    });

    let gptMarketData: any;
    try {
      gptMarketData = JSON.parse((gptMarket.choices?.[0]?.message?.content || '').trim());
    } catch (e) {
      gptMarketData = { parsing_error: true, raw_content: gptMarket.choices?.[0]?.message?.content };
    }
    gptMarketData.analysis_language = language;

    const existingMR = matchingRequest.market_research || {};
    const mergedMarketResearch = {
      ...existingMR,
      gpt: {
        status: 'completed',
        data: gptMarketData,
        provider: 'OpenAI',
        prompt_used: marketResearchPrompt,
        generated_at: new Date().toISOString(),
        analysis_language: language,
      },
    };

    const isValidAnalysis = openaiAnalysis && typeof openaiAnalysis === 'object' && !openaiAnalysis.parsing_error && Object.keys(openaiAnalysis).length > 0;
    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        workflow_status: isValidAnalysis ? 'gpt_completed' : 'gpt_failed',
        ai_analysis: openaiAnalysis,
        market_research: mergedMarketResearch,
      })
      .eq('id', matchingRequestId);
    if (updateError) throw new Error(`Failed to update matching request with GPT analysis: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, message: `GPT analysis completed`, analysisId: matchingRequestId, language }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    // Attempt to set failure status
    try {
      const body = await req.clone().json();
      if (body?.matchingRequestId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        await supabaseClient
          .from('matching_requests')
          .update({
            workflow_status: 'gpt_failed',
            error_details: { type: 'gpt_analysis', message: error?.message, timestamp: new Date().toISOString() },
          })
          .eq('id', body.matchingRequestId);
      }
    } catch (_) {}

    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
