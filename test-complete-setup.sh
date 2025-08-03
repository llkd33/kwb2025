#!/bin/bash

echo "🔍 Testing Complete Setup"
echo "========================"
echo ""

# Test API
echo "1. Testing OpenAI API..."
api_response=$(curl -s -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM")

if echo "$api_response" | grep -q '"success":true'; then
  echo "✅ OpenAI API: Working"
else
  echo "❌ OpenAI API: Failed"
  echo "$api_response"
fi

# Test database
echo ""
echo "2. Testing Database..."
db_response=$(curl -s -X GET "https://gqcruitsupinmhrvygql.supabase.co/rest/v1/prompt_templates?select=name&limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM")

if echo "$db_response" | grep -q "comprehensive_analysis_gpt"; then
  echo "✅ Database Migrations: Applied"
elif echo "$db_response" | grep -q "relation.*does not exist"; then
  echo "❌ Database Migrations: Not applied yet"
else
  echo "⚠️  Database Status: Unknown"
  echo "$db_response" | head -50
fi

# Test storage
echo ""
echo "3. Testing Storage Buckets..."
storage_response=$(curl -s -X GET "https://gqcruitsupinmhrvygql.supabase.co/storage/v1/bucket/business-documents" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM")

if echo "$storage_response" | grep -q '"name":"business-documents"'; then
  echo "✅ Storage Buckets: Created"
elif echo "$storage_response" | grep -q "Bucket not found"; then
  echo "❌ Storage Buckets: Not created yet"
else
  echo "⚠️  Storage Status: Unknown"
fi

# Summary
echo ""
echo "📊 Setup Summary:"
echo "================="
echo ""
echo "🌐 Application URL: http://localhost:8081/"
echo ""
echo "📱 Key Pages:"
echo "- Homepage: http://localhost:8081/"
echo "- Services (with screenshots): http://localhost:8081/services"
echo "- Admin Login: http://localhost:8081/auth"
echo "- Admin Dashboard: http://localhost:8081/admin"
echo "- Prompt Manager: http://localhost:8081/admin/prompts"
echo "- Excel Manager: http://localhost:8081/admin/excel"
echo ""
echo "🔑 Test Credentials:"
echo "- Admin: admin@example.com / admin123"
echo "- User: user@example.com / user123"
echo ""

# Check what needs to be done
if echo "$db_response" | grep -q "relation.*does not exist"; then
  echo "⚠️  ACTION REQUIRED:"
  echo "1. Run database migrations in Supabase SQL Editor"
  echo "   Copy contents of run-migrations.sql"
fi

if echo "$storage_response" | grep -q "Bucket not found"; then
  echo "2. Create storage buckets in Supabase Storage"
  echo "   - business-documents (private)"
  echo "   - pdf-documents (private)"
fi