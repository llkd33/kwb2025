-- Check for any invalid workflow_status values
SELECT id, workflow_status, status, created_at
FROM matching_requests
WHERE workflow_status NOT IN ('pending', 'documents_uploaded', 'ai_processing', 'admin_review', 'admin_approved', 'completed', 'rejected')
   OR workflow_status IS NULL;

-- Fix any invalid workflow_status values
-- If you have records with 'actions' status, update them to a valid status
UPDATE matching_requests
SET workflow_status = 'admin_review'
WHERE workflow_status = 'actions';

-- If you have records with 'approve' status, update them to the correct status
UPDATE matching_requests
SET workflow_status = 'admin_approved'
WHERE workflow_status = 'approve';

-- Verify the fix
SELECT id, workflow_status, status, created_at
FROM matching_requests
ORDER BY created_at DESC
LIMIT 10;