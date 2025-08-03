import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, index * 100));

        const emailHTML = getEmailHTML(recipient);
        
        // Simulate email sending (replace with actual email service)
        // You would integrate with services like:
        // - Resend
        // - SendGrid
        // - AWS SES
        // - Mailgun
        
        console.log(`Sending email to ${recipient.email} (${recipient.company_name})`);
        
        // Example with fetch to email service:
        /*
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'KnowWhere Bridge <newsletter@knowwhere-bridge.com>',
            to: [recipient.email],
            subject: subject,
            html: emailHTML,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error(`Failed to send to ${recipient.email}`);
        }
        */

        // For demo purposes, just simulate success
        return {
          email: recipient.email,
          company_name: recipient.company_name,
          status: 'sent',
          sent_at: new Date().toISOString()
        };

      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
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