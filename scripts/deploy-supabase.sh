#!/usr/bin/env bash
set -euo pipefail

# Deploy Supabase Edge Functions with proper CORS/JWT settings.
# Prereqs:
#  - Supabase CLI installed (brew install supabase/tap/supabase or npm i -g supabase)
#  - Run `supabase login` once (opens browser) or provide SUPABASE_ACCESS_TOKEN
#  - supabase/config.toml has project_id set (this repo does)
#  - Provide secrets via supabase/.env.local or environment variables

PROJECT_REF="gqcruitsupinmhrvygql"
ENV_FILE="supabase/.env.local"

echo "==> Using project: $PROJECT_REF"

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERROR: Supabase CLI not found. Install with: brew install supabase/tap/supabase or npm i -g supabase" >&2
  exit 1
fi

echo "==> Logging into Supabase (skip if already logged in)"
if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Using SUPABASE_ACCESS_TOKEN from env"
  supabase login --token "$SUPABASE_ACCESS_TOKEN"
else
  supabase login || true
fi

echo "==> Linking local project"
supabase link --project-ref "$PROJECT_REF" || true

echo "==> Setting function secrets"
if [[ -f "$ENV_FILE" ]]; then
  supabase functions secrets set --env-file "$ENV_FILE"
else
  echo "WARN: $ENV_FILE not found. You can create it or set secrets manually:"
  echo "  supabase functions secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... OPENAI_API_KEY=... PERPLEXITY_API_KEY=... RESEND_API_KEY=... SITE_URL=https://knowwhere-production.up.railway.app"
fi

echo "==> Deploying public (no-verify-jwt) functions"
supabase functions deploy signup-no-confirm --no-verify-jwt
supabase functions deploy test-openai --no-verify-jwt || true
supabase functions deploy simple-test --no-verify-jwt || true

echo "==> Deploying authenticated functions (JWT verified)"
supabase functions deploy run-gpt-analysis
supabase functions deploy run-perplexity-analysis || true
supabase functions deploy summarize-pdf
supabase functions deploy send-approval-email
supabase functions deploy send-analysis-complete-email || true
supabase functions deploy send-newsletter || true
supabase functions deploy minimal-analysis || true
supabase functions deploy test-secret || true

echo "==> Done. Verify CORS with preflight:"
echo "curl -i -X OPTIONS 'https://$PROJECT_REF.supabase.co/functions/v1/signup-no-confirm' \\
  -H 'Origin: https://knowwhere-production.up.railway.app' \\
  -H 'Access-Control-Request-Method: POST' \\
  -H 'Access-Control-Request-Headers: content-type,apikey,authorization,x-client-info'"

