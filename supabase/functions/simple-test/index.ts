import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Simple test function started');
    
    // Check environment variables
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    console.log('Environment check:', {
      hasOpenAIKey: !!openaiKey,
      hasSupabaseUrl: !!supabaseUrl,
      openaiKeyLength: openaiKey?.length || 0
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Simple test successful',
      environment: {
        hasOpenAIKey: !!openaiKey,
        hasSupabaseUrl: !!supabaseUrl,
        openaiKeyLength: openaiKey?.length || 0,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Simple test error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);