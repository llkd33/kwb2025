import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  companyId: number;
  type: 'approval' | 'rejection';
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, type, rejectionReason }: ApprovalEmailRequest = await req.json();

    // Get company details
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('회사 정보를 찾을 수 없습니다.');
    }

    let emailSubject: string;
    let emailHtml: string;

    if (type === 'approval') {
      emailSubject = `[NowhereMatching] 회원가입이 승인되었습니다 - ${company.company_name}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            NowhereMatching
          </h1>
          
          <h2 style="color: #16a34a;">🎉 회원가입 승인 완료</h2>
          
          <p>안녕하세요, <strong>${company.company_name}</strong>님!</p>
          
          <p>회원가입이 성공적으로 승인되었습니다. 이제 NowhereMatching의 모든 서비스를 이용하실 수 있습니다.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">승인된 계정 정보</h3>
            <ul style="color: #6b7280;">
              <li><strong>회사명:</strong> ${company.company_name}</li>
              <li><strong>대표자:</strong> ${company.ceo_name}</li>
              <li><strong>담당자:</strong> ${company.manager_name} (${company.manager_position})</li>
              <li><strong>이메일:</strong> ${company.email}</li>
            </ul>
          </div>
          
          <p>이제 로그인하여 해외진출 매칭 서비스를 시작해보세요!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://lovable.app'}/auth" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              지금 로그인하기
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            문의사항이 있으시면 언제든지 연락해주세요.<br>
            NowhereMatching 팀 드림
          </p>
        </div>
      `;
    } else {
      emailSubject = `[NowhereMatching] 회원가입 승인이 거부되었습니다 - ${company.company_name}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            NowhereMatching
          </h1>
          
          <h2 style="color: #dc2626;">❌ 회원가입 승인 거부</h2>
          
          <p>안녕하세요, <strong>${company.company_name}</strong>님!</p>
          
          <p>죄송하지만 회원가입 승인이 거부되었습니다.</p>
          
          ${rejectionReason ? `
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">거부 사유</h3>
              <p style="color: #7f1d1d; margin-bottom: 0;">${rejectionReason}</p>
            </div>
          ` : ''}
          
          <p>위 사유를 확인하시고 필요한 경우 다시 신청해주시기 바랍니다.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            문의사항이 있으시면 언제든지 연락해주세요.<br>
            NowhereMatching 팀 드림
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "NowhereMatching <noreply@resend.dev>",
      to: [company.email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Approval email sent successfully:", emailResponse);

    // Log the email in mail_log table
    await supabaseClient
      .from('mail_log')
      .insert({
        company_id: companyId,
        email_type: type === 'approval' ? 'approval_notification' : 'rejection_notification',
        recipient_email: company.email,
        subject: emailSubject,
        content: emailHtml,
        delivery_status: 'sent'
      });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);