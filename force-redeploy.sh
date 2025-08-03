#!/bin/bash

echo "Adding timestamp to force function redeployment..."

# Add a comment with timestamp to each function
timestamp=$(date +%s)

for func in test-openai process-pdf-report comprehensive-analysis minimal-analysis; do
  echo "Updating $func..."
  echo "// Force redeploy: $timestamp" >> "supabase/functions/$func/index.ts"
done

echo "Done! Now you need to:"
echo "1. Commit these changes: git add -A && git commit -m 'Force function redeploy'"
echo "2. Push to GitHub: git push"
echo "3. Supabase will automatically redeploy functions from GitHub"