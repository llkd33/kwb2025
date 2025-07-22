-- Add status column if it doesn't exist and update comprehensive analysis function
DO $$ 
BEGIN
  -- Add status column to matching_requests if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matching_requests' AND column_name = 'status') THEN
    ALTER TABLE matching_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Update existing records to have proper status
UPDATE matching_requests 
SET status = CASE 
  WHEN final_report IS NOT NULL THEN 'completed'
  WHEN ai_analysis IS NOT NULL OR market_research IS NOT NULL THEN 'processing'
  ELSE 'pending'
END
WHERE status = 'pending';