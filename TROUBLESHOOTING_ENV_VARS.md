# Troubleshooting: Edge Functions Not Seeing Environment Variables

## Common Issues and Solutions

### 1. Environment Variable Not Saved Properly

**Check in Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/gqcruitsupinmhrvygql/functions/settings
2. Look for "Environment Variables" section
3. You should see:
   - Name: `OPENAI_API_KEY` (exactly this, case-sensitive)
   - Value: Your API key starting with `sk-`
   - ✅ "Add to all functions" should be checked

### 2. Functions Need Manual Restart

**Force Restart Method 1 (Edit Variable):**
1. In Environment Variables section, click edit (pencil icon) on `OPENAI_API_KEY`
2. Add a space at the end of the value
3. Click "Save"
4. Edit again, remove the space
5. Click "Save" again
6. Wait 3-5 minutes

**Force Restart Method 2 (Add Dummy Variable):**
1. Add a new environment variable:
   - Name: `RESTART_TRIGGER`
   - Value: `1`
2. Save it
3. Wait 3-5 minutes
4. Delete this variable later

### 3. Variable Name Issues

Make sure the environment variable name is EXACTLY:
- `OPENAI_API_KEY` (all caps, underscores)
- NOT `OpenAI_API_Key` or `openai_api_key`

### 4. API Key Format Issues

Your API key should:
- Start with `sk-proj-` or `sk-`
- Be one long string with no spaces
- Not have quotes around it

### 5. Supabase Platform Issues

Sometimes Supabase has delays. Try:
1. Wait 10-15 minutes for propagation
2. Check Supabase status: https://status.supabase.com/
3. Try adding the variable through different method

### 6. Alternative: Add Secret via URL

You can also try adding secrets through this direct link:
https://supabase.com/dashboard/project/gqcruitsupinmhrvygql/settings/secrets

### 7. Verify with Function Logs

1. Go to Edge Functions → Functions
2. Click on `test-openai`
3. Go to "Logs" tab
4. Run the test script
5. Check what errors appear in logs

### If Nothing Works

The issue might be:
1. Your Supabase project has restrictions
2. Edge Functions are disabled
3. There's a platform issue

Try creating a simple test function to verify Edge Functions work at all:
```bash
curl -X POST https://gqcruitsupinmhrvygql.supabase.co/functions/v1/simple-test
```

## Expected Working Response

When it finally works, you'll see:
```json
{
  "success": true,
  "message": "OpenAI API test successful",
  "response": "안녕하세요",
  "model": "gpt-4o-mini"
}
```