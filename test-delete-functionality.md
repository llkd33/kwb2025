# Test Plan for Matching Request Delete Functionality

## Prerequisites
1. Apply the RLS policies by running `apply-delete-policy.sql` in Supabase SQL Editor
2. Ensure you have admin access to the application

## Test Steps

### 1. Setup Test Data
1. Create a test matching request if needed
2. Note the request ID and company name

### 2. Test Delete UI
1. Login as admin user
2. Navigate to `/admin` 
3. Go to "Matching Requests" tab
4. Verify each row shows:
   - "보기" (View) button with document icon
   - "삭제" (Delete) button with trash icon in red

### 3. Test Delete Confirmation Dialog
1. Click "삭제" button on a test request
2. Verify confirmation dialog appears with:
   - Title: "리포트 삭제 확인"
   - Company name in the message
   - Warning message in red about irreversible action
   - "취소" (Cancel) and "삭제" (Delete) buttons

### 4. Test Cancel Operation
1. Click "취소" button
2. Verify dialog closes
3. Verify request is still in the list

### 5. Test Delete Operation
1. Click "삭제" button again on the same request
2. Click "삭제" in the confirmation dialog
3. Verify:
   - Loading spinner appears with "삭제 중..." text
   - Success toast: "리포트 삭제 완료"
   - Request is removed from the list
   - List refreshes automatically

### 6. Test Database Cascade
Run in Supabase SQL Editor to verify cascade deletion:
```sql
-- Check if related data was deleted
SELECT 'matching_requests' as table_name, COUNT(*) as count 
FROM matching_requests WHERE id = [deleted_id]
UNION ALL
SELECT 'pdf_uploads', COUNT(*) 
FROM pdf_uploads WHERE matching_request_id = [deleted_id]
UNION ALL
SELECT 'ai_insights', COUNT(*) 
FROM ai_insights WHERE matching_request_id = [deleted_id];
```

All counts should be 0.

### 7. Test Permission Restrictions
1. Login as a non-admin user
2. Try to delete via API/database directly
3. Verify operation is denied

## Expected Results
- ✅ Admin can see delete buttons
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Delete operation removes the request and all related data
- ✅ UI updates immediately after deletion
- ✅ Success/error messages display appropriately
- ✅ Non-admin users cannot delete requests

## Troubleshooting
If delete fails:
1. Check browser console for errors
2. Verify RLS policies are applied correctly
3. Check if user has admin privileges
4. Verify foreign key constraints are set to CASCADE