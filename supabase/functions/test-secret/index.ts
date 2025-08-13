import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (_req) => {
  try {
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    return new Response(
      JSON.stringify({
        message: "Secret test result",
        hasPerplexityApiKey: !!perplexityKey,
        keyLast4Chars: perplexityKey ? `...${perplexityKey.slice(-4)}` : null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

