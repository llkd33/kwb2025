import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Recipient {
  email: string;
  company_name: string;
  ceo_name: string;
}

interface NewsletterRequest {
  subject: string;
  content: string;
  recipients: Recipient[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, content, recipients }: NewsletterRequest = await req.json();
    
    console.log(`Newsletter sending started for ${recipients.length} recipients`);

    // Validate input
    if (!subject || !content || !recipients?.length) {
      throw new Error('Subject, content, and recipients are required');
    }

    // Initialize Supabase client for logging
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('Email service is not configured. Please contact the administrator.');
    }

    // Email template
    const getEmailHTML = (recipient: Recipient) => {
      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${subject}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px; 
            background-color: #f4f4f4; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
        }
        .content { 
            padding: 30px 20px; 
        }
        .greeting { 
            font-size: 18px; 
            color: #333; 
            margin-bottom: 20px; 
        }
        .message { 
            color: #555; 
            white-space: pre-line; 
            line-height: 1.8; 
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #eee; 
        }
        .footer p { 
            margin: 5px 0; 
            font-size: 12px; 
            color: #666; 
        }
        .brand { 
            color: #667eea; 
            font-weight: 600; 
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌏 KnowWhere Bridge</h1>
            <p>글로벌 비즈니스 매칭 플랫폼</p>
        </div>
        <div class="content">
            <div class="greeting">
                안녕하세요, <strong>${recipient.company_name}</strong> <strong>${recipient.ceo_name}</strong> 대표님!
            </div>
            <div class="message">${content}</div>
            <center>
                <a href="${Deno.env.get('SITE_URL') || 'https://lovable.app'}/dashboard" class="cta-button">
                    대시보드 바로가기
                </a>
            </center>
        </div>
        <div class="footer">
            <p><span class="brand">© 2024 KnowWhere Bridge.</span> All rights reserved.</p>
            <p>이 이메일은 KnowWhere Bridge 회원사에게 발송되는 뉴스레터입니다.</p>
            <p>문의사항이 있으시면 언제든지 연락해 주세요.</p>
        </div>
    </div>
</body>
</html>`;
    };

    // Send individual emails (BCC-style privacy)
    const emailPromises = recipients.map(async (recipient, index) => {
      try {
        // Add small delay to avoid rate limiting (100ms between emails)
        await new Promise(resolve => setTimeout(resolve, index * 100));

        const emailHTML = getEmailHTML(recipient);
        
        console.log(`Sending email to ${recipient.email} (${recipient.company_name})`);
        
        // Send email using Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KnowWhere Bridge <noreply@resend.dev>', // Use Resend's test domain for now
            to: [recipient.email],
            subject: `[KnowWhere Bridge] ${subject}`,
            html: emailHTML,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          console.error(`Failed to send to ${recipient.email}: ${errorData}`);
          throw new Error(`Failed to send email: ${errorData}`);
        }

        const emailResult = await emailResponse.json();
        console.log(`Email sent successfully to ${recipient.email}:`, emailResult.id);

        // Log to database
        await supabaseClient
          .from('mail_log')
          .insert({
            email_type: 'newsletter',
            recipient_email: recipient.email,
            subject: subject,
            content: emailHTML,
            delivery_status: 'sent',
            sent_at: new Date().toISOString()
          });

        return {
          email: recipient.email,
          company_name: recipient.company_name,
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: emailResult.id
        };

      } catch (error: any) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        
        // Log failure to database
        await supabaseClient
          .from('mail_log')
          .insert({
            email_type: 'newsletter',
            recipient_email: recipient.email,
            subject: subject,
            content: getEmailHTML(recipient),
            delivery_status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString()
          });

        return {
          email: recipient.email,
          company_name: recipient.company_name,
          status: 'failed',
          error: error.message,
          sent_at: new Date().toISOString()
        };
      }
    });

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    const successful = results.filter(r => r.status === 'sent');
    const failed = results.filter(r => r.status === 'failed');

    console.log(`Newsletter sending completed: ${successful.length} sent, ${failed.length} failed`);

    // Create newsletter summary log
    await supabaseClient
      .from('newsletter_logs')
      .insert({
        subject: subject,
        content: content,
        total_recipients: recipients.length,
        sent_count: successful.length,
        failed_count: failed.length,
        sent_at: new Date().toISOString(),
        details: results
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      success: true,
      message: `뉴스레터가 성공적으로 발송되었습니다.`,
      results: {
        total: recipients.length,
        sent: successful.length,
        failed: failed.length,
        details: results
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Newsletter sending failed:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});