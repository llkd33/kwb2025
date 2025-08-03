# OpenAI API Key Setup Guide

## Important Security Notice
⚠️ **NEVER commit API keys to version control**
⚠️ **The API key you provided has been exposed - please regenerate it immediately**

## Setting Up OpenAI API Key in Supabase

### Step 1: Regenerate Your API Key
Since your API key was exposed in the conversation, you should:
1. Go to https://platform.openai.com/api-keys
2. Delete the exposed key
3. Generate a new API key
4. Copy the new key immediately (it won't be shown again)

### Step 2: Configure in Supabase Edge Functions

1. **Access Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/gqcruitsupinmhrvygql
   ```

2. **Navigate to Edge Functions Settings**
   - Click on "Edge Functions" in the left sidebar
   - Click on "Settings" tab

3. **Add Environment Variable**
   - Click "Add new secret"
   - Name: `OPENAI_API_KEY`
   - Value: Your new OpenAI API key
   - Click "Save"

### Step 3: Test the Configuration

1. **Test using the test-openai function**
   ```bash
   curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/test-openai \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

2. **Expected Response**
   ```json
   {
     "success": true,
     "message": "OpenAI API test successful",
     "response": "안녕하세요",
     "model": "gpt-4o-mini"
   }
   ```

### Step 4: Verify AI Analysis Functions

Once the API key is set, test the main analysis functions:

1. **Test Minimal Analysis**
   ```bash
   curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/minimal-analysis \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"matchingRequestId": 1}'
   ```

2. **Test Comprehensive Analysis**
   ```bash
   curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/comprehensive-analysis \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"matchingRequestId": 1}'
   ```

## Local Development Testing

For local development with Supabase CLI:

```bash
# Set environment variable locally
export OPENAI_API_KEY="your_new_api_key_here"

# Run function locally
supabase functions serve test-openai --env-file .env.local
```

## Security Best Practices

1. **API Key Rotation**
   - Rotate keys every 90 days
   - Immediately rotate if exposed

2. **Access Control**
   - Limit API key permissions if possible
   - Use different keys for dev/staging/production

3. **Monitoring**
   - Monitor API usage in OpenAI dashboard
   - Set up usage alerts

4. **Never Store Keys In**
   - Source code
   - Frontend code
   - Public repositories
   - Client-side storage

## Troubleshooting

### Common Issues

1. **"OpenAI API key not found" error**
   - Verify the key is set in Supabase Edge Functions settings
   - Check for typos in the environment variable name

2. **"Invalid API key" error**
   - Ensure you're using a valid OpenAI API key
   - Check that the key starts with `sk-proj-`

3. **Rate limiting errors**
   - Check your OpenAI usage limits
   - Implement retry logic with exponential backoff

## Cost Management

- The app uses `gpt-4o-mini` model for cost efficiency
- Monitor usage at: https://platform.openai.com/usage
- Set usage limits in OpenAI dashboard to prevent overages

## Next Steps

After setting up the OpenAI API key:
1. Test all AI analysis functions
2. Configure email service for notifications
3. Set up storage buckets for file uploads
4. Complete the remaining Task Master tasks