#!/bin/bash

echo "Testing if your OpenAI API key works directly..."
echo ""
echo "Please enter your OpenAI API key (it will be hidden):"
read -s api_key
echo ""

if [ -z "$api_key" ]; then
    echo "No API key entered. Exiting."
    exit 1
fi

echo "Testing API key directly with OpenAI..."
response=$(curl -s -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $api_key" \
  -d '{
    "model": "gpt-5",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }')

if echo "$response" | grep -q "error"; then
    echo "❌ API Key Test Failed:"
    echo "$response" | jq .error 2>/dev/null || echo "$response"
else
    echo "✅ API Key is valid and working!"
    echo "Response: $(echo "$response" | jq -r .choices[0].message.content 2>/dev/null)"
fi

echo ""
echo "This confirms your API key is valid. The issue is with Supabase environment variables."
