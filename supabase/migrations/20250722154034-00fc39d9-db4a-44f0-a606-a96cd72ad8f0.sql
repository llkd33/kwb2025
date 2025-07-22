-- Add is_published column and published_at timestamp to matching_requests table
ALTER TABLE matching_requests 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;