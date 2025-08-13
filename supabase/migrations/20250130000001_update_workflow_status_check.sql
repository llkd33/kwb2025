-- Update workflow_status check constraint to include new states
ALTER TABLE public.matching_requests 
DROP CONSTRAINT IF EXISTS matching_requests_workflow_status_check;

ALTER TABLE public.matching_requests 
ADD CONSTRAINT matching_requests_workflow_status_check 
CHECK (workflow_status IN (
  'pending', 
  'documents_uploaded', 
  'ai_processing', 
  'admin_review', 
  'admin_approved', 
  'completed', 
  'rejected',
  'pdf_summarized',
  'pdf_summary_failed',
  'gpt_processing',
  'gpt_completed',
  'perplexity_processing', 
  'perplexity_completed'
));

