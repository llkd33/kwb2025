#!/bin/bash

echo "🔍 Testing development server..."
echo "================================"
echo ""

# Check if port 8080 is open
echo "1. Checking if port 8080 is open..."
if lsof -i:8080 >/dev/null 2>&1; then
    echo "✅ Port 8080 is in use"
else
    echo "❌ Port 8080 is not in use"
    exit 1
fi

# Wait a moment for server to fully start
echo ""
echo "2. Waiting for server to start (5 seconds)..."
sleep 5

# Test HTTP response
echo ""
echo "3. Testing HTTP response..."
response=$(curl -s -w "HTTP_STATUS:%{http_code}" http://localhost:8080/ || echo "CURL_ERROR")

if [[ "$response" == *"CURL_ERROR"* ]]; then
    echo "❌ Could not connect to server"
elif [[ "$response" == *"HTTP_STATUS:200"* ]]; then
    echo "✅ Server is responding (HTTP 200)"
    echo ""
    echo "🎉 SUCCESS! You can access the app at:"
    echo "   http://localhost:8080/"
elif [[ "$response" == *"HTTP_STATUS:"* ]]; then
    status_code=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
    echo "⚠️  Server responded with HTTP $status_code"
else
    echo "❌ Unexpected response: $response"
fi

echo ""
echo "4. Browser instructions:"
echo "   - Open your web browser"
echo "   - Go to: http://localhost:8080/"
echo "   - If it doesn't load, wait a minute and refresh"
echo ""
echo "5. Troubleshooting:"
echo "   - Check browser console (F12) for errors"
echo "   - Try incognito/private browsing mode"
echo "   - Clear browser cache"