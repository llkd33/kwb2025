import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log('=== PDF SUMMARY STARTED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchingRequestId, pdfContent } = await req.json(); // Assuming pdfContent is passed
    if (!matchingRequestId) throw new Error('matchingRequestId is required');
    if (!pdfContent) throw new Error('pdfContent is required for summary');

    // Prevent huge payloads from causing model errors
    const MAX_INPUT_CHARS = 12000;
    const inputLength = typeof pdfContent === 'string' ? pdfContent.length : 0;
    const truncatedContent =
      typeof pdfContent === 'string'
        ? (inputLength > MAX_INPUT_CHARS ? pdfContent.slice(0, MAX_INPUT_CHARS) + '\n\n...[truncated]' : pdfContent)
        : '';
    console.log('SUMMARY_INPUT_LENGTH', { inputLength, usedLength: truncatedContent.length });

    // Move to an allowed status while background work runs
    await supabaseClient
      .from('matching_requests')
      .update({ workflow_status: 'ai_processing' })
      .eq('id', matchingRequestId);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const summaryPrompt = `다음 텍스트는 사업 계획서 또는 회사 소개서의 내용입니다. 이 내용을 한국어로 3~5 문장으로 요약해주세요.\n\n---\n\n${truncatedContent}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes business documents concisely.' },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 500,
        temperature: 0.5
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('OPENAI_SUMMARY_ERROR', { status: gptResponse.status, errorText: errorText?.slice(0, 500) });
      throw new Error(`OpenAI API for summary failed (${gptResponse.status}): ${errorText}`);
    }

    const gptData = await gptResponse.json();
    const summary = gptData.choices[0].message.content;

    const { error: updateError } = await supabaseClient
      .from('matching_requests')
      .update({
        // After summary is ready, hand off to admin for review
        workflow_status: 'admin_review',
        pdf_summary: summary,
      })
      .eq('id', matchingRequestId);

    if (updateError) {
      throw new Error(`Failed to update request with summary: ${updateError.message}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'PDF 요약이 완료되었습니다.',
      summary: summary,
      analysisId: matchingRequestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== PDF SUMMARY FAILED ===', error);
    
    // Attempt to update status to failed
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
                // Keep the request actionable by admin even if summary fails
                workflow_status: 'admin_review',
                error_details: {
                    type: 'pdf_summary',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }
            })
            .eq('id', body.matchingRequestId);
        }
    } catch (revertError) {
        // Ignore errors during error handling
    }

    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});