#!/bin/bash

echo "🔍 Testing OpenAI API connection..."
echo ""

response=$(curl -s -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM")

echo "Response:"
echo "$response" | jq . 2>/dev/null || echo "$response"
echo ""

# Check if successful
if echo "$response" | grep -q '"success":true'; then
  echo "✅ API test successful!"
  echo ""
  echo "Next steps:"
  echo "1. ✅ API Keys configured"
  echo "2. ⏳ Run database migrations (copy run-migrations.sql to Supabase SQL Editor)"
  echo "3. ⏳ Create Storage buckets"
  echo "4. ⏳ Test complete workflow"
else
  echo "❌ API test failed. Please check:"
  echo "1. API keys are saved in Supabase Edge Functions Settings"
  echo "2. Functions have been redeployed (may take a few minutes)"
  echo ""
  echo "To redeploy from dashboard:"
  echo "- Go to Edge Functions tab"
  echo "- Click on each function"
  echo "- Click 'Deploy' button"
fi