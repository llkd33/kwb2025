// Debug version of the Edge Function to test environment variables
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // List all environment variables (safely)
    const envVars = Deno.env.toObject();
    const hasOpenAI = 'OPENAI_API_KEY' in envVars;
    const openAIKeyLength = envVars.OPENAI_API_KEY ? envVars.OPENAI_API_KEY.length : 0;
    const openAIKeyPrefix = envVars.OPENAI_API_KEY ? envVars.OPENAI_API_KEY.substring(0, 7) : 'not set';
    
    // Check different possible names
    const possibleKeys = [
      'OPENAI_API_KEY',
      'openai_api_key',
      'OpenAI_API_Key',
      'OPENAI_KEY',
      'openai_key'
    ];
    
    const foundKeys = possibleKeys.filter(key => key in envVars);
    
    return new Response(JSON.stringify({
      debug: true,
      hasOpenAI,
      openAIKeyLength,
      openAIKeyPrefix,
      foundKeys,
      totalEnvVars: Object.keys(envVars).length,
      // List non-sensitive env var names
      envVarNames: Object.keys(envVars).filter(k => !k.includes('KEY') && !k.includes('SECRET'))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});