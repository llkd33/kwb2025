# PDF Analysis Setup Guide

## Overview
The PDF analysis feature allows administrators to upload PDF documents and get AI-powered analysis using GPT-4 and Perplexity AI.

## Prerequisites

1. **Supabase Project**: Make sure your Supabase project is properly linked
   ```bash
   npx supabase link
   ```

2. **API Keys**: You need at least one of the following:
   - OpenAI API Key (required)
   - Perplexity API Key (optional, for enhanced market research)

## Setup Steps

### 1. Create Storage Buckets

Run the automated setup script:
```bash
chmod +x scripts/setup-storage.sh
./scripts/setup-storage.sh
```

Or manually create the buckets:
```bash
# Create the PDF uploads bucket (public access)
npx supabase storage create pdf-uploads --public

# Create the business documents bucket (private)
npx supabase storage create business-documents
```

### 2. Set API Keys

Set your API keys as Supabase secrets:
```bash
# Set OpenAI API key (required)
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here

# Set Perplexity API key (optional)
npx supabase secrets set PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Deploy Edge Functions

Deploy all Edge Functions to Supabase:
```bash
# Deploy all functions
npx supabase functions deploy

# Or deploy specific functions
npx supabase functions deploy process-pdf-report
npx supabase functions deploy comprehensive-analysis
npx supabase functions deploy minimal-analysis
```

### 4. Verify Setup

1. Go to the Admin panel (`/admin`)
2. Navigate to the "리포트 리뷰" (Report Review) tab
3. Click "📄 PDF 분석 테스트" button
4. Upload a test PDF file
5. Click "분석 시작" to test the analysis

## Troubleshooting

### Error: "Storage bucket does not exist"
- Run: `npx supabase storage create pdf-uploads --public`
- Make sure you're connected to the right project: `npx supabase status`

### Error: "API key not configured"
- Check if keys are set: `npx supabase secrets list`
- Re-set the keys using the commands in step 2

### Error: "Edge Function not found"
- Deploy the functions: `npx supabase functions deploy`
- Check function logs: `npx supabase functions logs process-pdf-report`

### Error: "Permission denied"
- Make sure the bucket is public: `npx supabase storage update pdf-uploads --public`
- Check RLS policies in Supabase dashboard

## Storage Bucket Policies

The `pdf-uploads` bucket should have the following policies:

1. **Public Read Access**: Anyone can read uploaded PDFs
2. **Authenticated Upload**: Only logged-in users can upload
3. **Authenticated Delete**: Only logged-in users can delete

These policies are automatically set by the setup script.

## API Key Management

### Getting API Keys

1. **OpenAI API Key**:
   - Sign up at https://platform.openai.com
   - Go to API Keys section
   - Create a new key
   - Make sure you have credits or billing set up

2. **Perplexity API Key**:
   - Sign up at https://www.perplexity.ai/api
   - Generate an API key
   - Note: This is optional but provides better market research

### Security Notes

- Never commit API keys to your repository
- Use Supabase secrets for production
- Rotate keys regularly
- Monitor usage in respective dashboards

## Testing

After setup, test the feature with these steps:

1. Upload a company profile PDF (product catalog, company introduction, etc.)
2. The system will:
   - Extract text from the PDF
   - Analyze with GPT-4 for business insights
   - Perform market research with Perplexity (if configured)
   - Generate a comprehensive report

3. View results in the Report Review section

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Review Edge Function logs: `npx supabase functions logs`
3. Verify all setup steps were completed
4. Ensure your Supabase project has sufficient resources