#!/bin/bash

echo "==============================================="
echo "  KnowWhere Bridge API Keys Setup Script"
echo "==============================================="
echo ""
echo "This script will help you set up the required API keys for the application."
echo ""
echo "You will need:"
echo "1. OpenAI API Key - Get it from: https://platform.openai.com/api-keys"
echo "2. Perplexity API Key - Get it from: https://www.perplexity.ai/settings/api"
echo ""
echo "==============================================="
echo ""

# Check if user is authenticated with Supabase
echo "Checking Supabase authentication..."
if npx supabase projects list &> /dev/null; then
    echo "✅ You are authenticated with Supabase"
else
    echo "❌ You need to authenticate with Supabase first"
    echo "Run: npx supabase login"
    exit 1
fi

echo ""
read -p "Enter your OpenAI API Key (starts with sk-): " OPENAI_KEY
read -p "Enter your Perplexity API Key: " PERPLEXITY_KEY

echo ""
echo "Setting up API keys in Supabase..."

# Set the API keys
npx supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
if [ $? -eq 0 ]; then
    echo "✅ OpenAI API key set successfully"
else
    echo "❌ Failed to set OpenAI API key"
fi

npx supabase secrets set PERPLEXITY_API_KEY="$PERPLEXITY_KEY"
if [ $? -eq 0 ]; then
    echo "✅ Perplexity API key set successfully"
else
    echo "❌ Failed to set Perplexity API key"
fi

echo ""
echo "==============================================="
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy the edge functions: npx supabase functions deploy"
echo "2. Test the PDF submission at: /pdf-report"
echo "==============================================="