#!/bin/bash

echo "🔑 Creating test users..."
echo "========================"
echo ""

# Create admin user
echo "1. Creating admin user..."
admin_response=$(curl -s -X POST "https://gqcruitsupinmhrvygql.supabase.co/rest/v1/companies" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "company_name": "KnowWhere Bridge Admin",
    "ceo_name": "Admin User",
    "manager_name": "System Administrator",
    "manager_position": "Admin",
    "phone_number": "+82-10-0000-0000",
    "industry": "Technology",
    "headquarters_country": "South Korea",
    "headquarters_city": "Seoul",
    "founding_year": "2023",
    "employee_count": "10-50",
    "revenue_scale": "1억원 이하",
    "main_products": "Global Business Matching Platform",
    "target_market": "Global Companies",
    "competitive_advantage": "AI-powered matching system",
    "company_vision": "Connect businesses worldwide",
    "website": "https://knowwhere-bridge.com",
    "is_approved": true,
    "is_admin": true
  }')

if echo "$admin_response" | grep -q "email"; then
  echo "✅ Admin user created successfully"
else
  echo "ℹ️  Admin user may already exist or there was an issue:"
  echo "$admin_response"
fi

echo ""
echo "2. Creating test user..."
user_response=$(curl -s -X POST "https://gqcruitsupinmhrvygql.supabase.co/rest/v1/companies" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxY3J1aXRzdXBpbm1ocnZ5Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjE3MTEsImV4cCI6MjA2NjM5NzcxMX0.3ExwSxdRbD_W1Dq6uN90vjVRk6uSDHhCaxOK1rmwnaM" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{
    "email": "user@example.com",
    "password": "user123",
    "company_name": "Test Company Ltd.",
    "ceo_name": "Test CEO",
    "manager_name": "Test Manager",
    "manager_position": "Manager",
    "phone_number": "+82-10-1234-5678",
    "industry": "Manufacturing",
    "headquarters_country": "South Korea",
    "headquarters_city": "Busan",
    "founding_year": "2020",
    "employee_count": "50-100",
    "revenue_scale": "10억원 이상",
    "main_products": "Test Products",
    "target_market": "Asia Pacific",
    "competitive_advantage": "Quality and Innovation",
    "company_vision": "Leading the industry",
    "website": "https://testcompany.com",
    "is_approved": true,
    "is_admin": false
  }')

if echo "$user_response" | grep -q "email"; then
  echo "✅ Test user created successfully"
else
  echo "ℹ️  Test user may already exist or there was an issue:"
  echo "$user_response"
fi

echo ""
echo "🎉 Test users setup complete!"
echo ""
echo "📝 Login credentials:"
echo "================================"
echo "🔑 Admin Account:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo "   Access: Full admin dashboard"
echo ""
echo "👤 Test User Account:"
echo "   Email: user@example.com"
echo "   Password: user123"
echo "   Access: Regular user dashboard"
echo ""
echo "🌐 Test at: http://localhost:8080/auth"