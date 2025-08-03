#!/bin/bash

echo "🔍 Testing Perplexity API connection..."
echo ""

# Create a test Edge Function for Perplexity
cat > /tmp/test-perplexity.ts << 'EOF'
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
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!perplexityKey) {
      return new Response(JSON.stringify({
        success: false,
        message: "Perplexity API key not configured",
        info: "The system will work without real-time market research"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'user',
            content: 'What is the current date and a recent news headline?'
          }
        ],
        temperature: 0.1,
        top_p: 0.9,
        search_domain_filter: ["perplexity.ai"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "day",
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: "Perplexity API test successful",
      response: data.choices[0].message.content,
      model: data.model || 'perplexity-llama',
      hasRealTimeData: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
EOF

echo "To test Perplexity API:"
echo "1. Create a new Edge Function called 'test-perplexity' in Supabase"
echo "2. Copy the code from /tmp/test-perplexity.ts"
echo "3. Deploy it"
echo ""
echo "Or check the process-pdf-report function which uses Perplexity if available."
echo ""

# Check if Perplexity is mentioned in the existing functions
echo "Checking if Perplexity is integrated in existing functions..."
grep -l "PERPLEXITY_API_KEY" supabase/functions/*/index.ts 2>/dev/null | while read file; do
  echo "✅ Found Perplexity integration in: $file"
done

echo ""
echo "Note: Perplexity API is optional. The system works without it but won't have:"
echo "- Real-time market research"
echo "- Latest industry news"
echo "- Current competitor information"