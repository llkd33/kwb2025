#!/bin/bash

# Test OpenAI API connection
echo "Testing OpenAI API..."
curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM"

echo -e "\n\nIf successful, you should see:"
echo '{
  "success": true,
  "message": "OpenAI API test successful",
  "response": "안녕하세요",
  "model": "gpt-4o-mini"
}'