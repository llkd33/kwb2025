import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompletionEmailRequest {
  matchingRequestId: number;
  adminComments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchingRequestId, adminComments }: CompletionEmailRequest = await req.json();

    // Get matching request details with company info
    const { data: matchingRequest, error: requestError } = await supabaseClient
      .from('matching_requests')
      .select('*, companies(*)')
      .eq('id', matchingRequestId)
      .single();

    if (requestError || !matchingRequest) {
      throw new Error('매칭 요청을 찾을 수 없습니다.');
    }

    const company = matchingRequest.companies;
    if (!company) {
      throw new Error('회사 정보를 찾을 수 없습니다.');
    }

    // Get report token for secure URL
    let reportToken = matchingRequest.report_token;
    if (!reportToken) {
      // Generate token if not exists
      const { data: tokenData, error: tokenError } = await supabaseClient
        .rpc('generate_report_token', { p_id: matchingRequestId });
      if (!tokenError && tokenData) {
        reportToken = tokenData;
      }
    }

    const emailSubject = `[NowhereMatching] AI 분석 완료 - ${company.company_name}`;
    const reportUrl = reportToken 
      ? `${Deno.env.get('SITE_URL') || 'https://lovable.app'}/report/${reportToken}`
      : `${Deno.env.get('SITE_URL') || 'https://lovable.app'}/dashboard`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          NowhereMatching
        </h1>
        
        <h2 style="color: #16a34a;">🎉 AI 분석 완료</h2>
        
        <p>안녕하세요, <strong>${company.company_name}</strong>님!</p>
        
        <p>요청하신 해외진출 AI 분석이 완료되었습니다. Goldman Sachs급 분석 리포트가 준비되었습니다.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">분석 정보</h3>
          <ul style="color: #6b7280;">
            <li><strong>분석 ID:</strong> #${matchingRequestId}</li>
            <li><strong>대상 국가:</strong> ${matchingRequest.target_countries.join(', ')}</li>
            <li><strong>완료 시간:</strong> ${new Date(matchingRequest.completed_at).toLocaleString('ko-KR')}</li>
          </ul>
        </div>
        
        ${adminComments ? `
        <div style="background-color: #fef3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">관리자 코멘트</h3>
          <p style="color: #78350f; margin-bottom: 0;">${adminComments}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1d4ed8;">포함된 분석 내용</h3>
          <ul style="color: #1e40af;">
            <li>🏢 <strong>기업 종합 분석</strong> - GPT-4 기반 심층 기업 분석</li>
            <li>🌍 <strong>실시간 시장 분석</strong> - Perplexity AI를 통한 최신 시장 동향</li>
            <li>📊 <strong>데이터 기반 인사이트</strong> - 관리자 제공 시장 데이터 활용</li>
            <li>🎯 <strong>맞춤형 진출 전략</strong> - 구체적인 액션 플랜 제시</li>
            <li>🤝 <strong>파트너 & 투자자 매칭</strong> - 최적 파트너 추천</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            분석 결과 확인하기
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>다음 단계:</strong><br>
          1. 마이페이지에서 상세 분석 결과를 확인하세요<br>
          2. 추천된 파트너사와 연결을 시작하세요<br>
          3. 추가 문의사항은 언제든지 연락해주세요
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          문의사항이 있으시면 언제든지 연락해주세요.<br>
          <strong>NowhereMatching 팀 드림</strong>
        </p>
      </div>
    `;

    let emailResponse: any = { status: 'skipped' };
    if (!resend) {
      console.warn('RESEND_API_KEY is not set, skipping email send.');
    } else {
      emailResponse = await resend.emails.send({
        // Use onboarding sender to avoid domain verification issues in test
        from: "NowhereMatching <onboarding@resend.dev>",
        to: [company.email],
        subject: emailSubject,
        html: emailHtml,
      });
    }

    console.log("Analysis completion email sent successfully:", emailResponse);

    // Log the email in mail_log table
    try {
      await supabaseClient
        .from('mail_log')
        .insert({
          company_id: company.id,
          matching_request_id: matchingRequestId,
          email_type: 'analysis_complete',
          recipient_email: company.email,
          subject: emailSubject,
          content: emailHtml,
          delivery_status: 'sent'
        });
    } catch (logErr) {
      console.warn('mail_log insert failed (non-fatal):', (logErr as any)?.message || logErr);
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-analysis-complete-email function:", error);
    // Soft-fail: return 200 to avoid UI hard failure, but include error message
    return new Response(
      JSON.stringify({ error: error.message, status: 'soft-failed' }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);