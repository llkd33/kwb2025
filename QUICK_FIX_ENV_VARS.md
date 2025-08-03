# Quick Fix: Force Edge Functions to Use New Environment Variables

## The Problem
Your API keys are saved in Supabase but the Edge Functions aren't picking them up yet.

## Fastest Solution

### In Supabase Dashboard:

1. Go to your project: https://supabase.com/dashboard/project/gqcruitsupinmhrvygql

2. Navigate to **Edge Functions** → **Settings**

3. In the **Environment Variables** section:
   - Click the edit icon (pencil) next to `OPENAI_API_KEY`
   - Add a space at the end of the API key value
   - Click **Save**
   - Remove the space and click **Save** again

4. This forces ALL Edge Functions to restart with the new environment variables

5. Wait 2-3 minutes for the restart to complete

6. Test again with: `./test-api-final.sh`

## Alternative: Check Function Logs

While waiting, check if the function is receiving calls:
1. Go to **Edge Functions** → **Functions**
2. Click on `test-openai`
3. Click **Logs** tab
4. Run `./test-api-final.sh` and watch for new log entries

## Expected Success Response

When it's working, you'll see:
```json
{
  "success": true,
  "message": "OpenAI API test successful",
  "response": "안녕하세요",
  "model": "gpt-4o-mini"
}
```

## If Still Not Working

The issue might be:
1. API key format is incorrect (should start with `sk-`)
2. API key doesn't have proper permissions
3. Supabase is having deployment issues

You can verify your API key works by testing it directly:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```