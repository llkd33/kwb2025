#!/bin/bash

echo "🔍 Diagnosing Edge Functions Setup"
echo "=================================="
echo ""

# Check if we can reach the Edge Function
echo "1. Testing Edge Function availability..."
response=$(curl -s -w "\n%{http_code}" -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status Code: $http_code"
echo "Response Body: $body"
echo ""

if [ "$http_code" = "500" ]; then
  echo "✅ Edge Function is reachable but environment variables are missing"
  echo ""
  echo "NEXT STEPS:"
  echo "1. Go to: https://supabase.com/dashboard/project/gqcruitsupinmhrvygql/functions/settings"
  echo "2. Make sure you see OPENAI_API_KEY in the Environment Variables section"
  echo "3. If not, add it with the '+' button"
  echo "4. If yes, edit it (add/remove a space) and save to force restart"
elif [ "$http_code" = "200" ]; then
  echo "✅ Edge Function is working!"
else
  echo "❌ Cannot reach Edge Function (HTTP $http_code)"
  echo "The function might still be deploying or there's a network issue"
fi

echo ""
echo "Alternative Test Commands:"
echo "-------------------------"
echo ""
echo "Test your OpenAI key directly:"
echo 'curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY" | head -20'
echo ""
echo "Check Supabase project status:"
echo "curl https://gqcruitsupinmhrvygql.supabase.co/rest/v1/ -I"