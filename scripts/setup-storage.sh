#!/bin/bash

echo "🚀 Setting up Supabase Storage for KnowWhere Bridge"
echo "=================================================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI is installed"

# Create storage buckets
echo ""
echo "📦 Creating storage buckets..."

# Create business-documents bucket (private)
echo "Creating 'business-documents' bucket (private)..."
npx supabase storage create business-documents 2>/dev/null || echo "  ⚠️ 'business-documents' bucket already exists or error occurred"

# Create pdf-uploads bucket (public)
echo "Creating 'pdf-uploads' bucket (public)..."
npx supabase storage create pdf-uploads --public 2>/dev/null || echo "  ⚠️ 'pdf-uploads' bucket already exists or error occurred"

# Set bucket policies
echo ""
echo "🔐 Setting bucket policies..."

# Business documents policy (authenticated users can upload)
cat > /tmp/business-docs-policy.sql << 'EOF'
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);
EOF

# PDF uploads policy (public read, authenticated write)
cat > /tmp/pdf-uploads-policy.sql << 'EOF'
-- Allow public to read PDF uploads
CREATE POLICY "Public can read PDF uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pdf-uploads');

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-uploads');

-- Allow authenticated users to delete their PDFs
CREATE POLICY "Authenticated users can delete PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-uploads');
EOF

echo "Applying policies..."
npx supabase db push < /tmp/business-docs-policy.sql 2>/dev/null || echo "  ⚠️ Business docs policies may already exist"
npx supabase db push < /tmp/pdf-uploads-policy.sql 2>/dev/null || echo "  ⚠️ PDF uploads policies may already exist"

# Clean up temp files
rm -f /tmp/business-docs-policy.sql /tmp/pdf-uploads-policy.sql

echo ""
echo "🔧 Checking Edge Functions..."

# Check if functions are deployed
if [ -d "supabase/functions" ]; then
    echo "Found Edge Functions directory"
    echo "Deploying Edge Functions..."
    
    # Deploy each function
    for func in supabase/functions/*/; do
        if [ -d "$func" ]; then
            func_name=$(basename "$func")
            echo "  Deploying function: $func_name"
            npx supabase functions deploy $func_name 2>/dev/null || echo "    ⚠️ Failed to deploy $func_name"
        fi
    done
else
    echo "❌ No Edge Functions directory found"
fi

echo ""
echo "🔑 Checking API Keys..."
echo "Make sure you have set the following environment variables:"
echo "  - OPENAI_API_KEY"
echo "  - PERPLEXITY_API_KEY (optional)"
echo ""
echo "To set them, run:"
echo "  npx supabase secrets set OPENAI_API_KEY=your_key_here"
echo "  npx supabase secrets set PERPLEXITY_API_KEY=your_key_here"

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your Supabase project is linked: npx supabase link"
echo "2. Set your API keys using the commands above"
echo "3. Deploy Edge Functions if needed: npx supabase functions deploy"
echo "4. Test the PDF analysis feature in the Admin panel"