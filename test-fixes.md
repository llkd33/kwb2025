# Test Plan for Admin and Auth Fixes

## 1. Database Migration
First, run the following SQL in your Supabase SQL Editor:
```sql
-- Add approved_at field to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITHOUT TIME ZONE;

-- Update existing approved companies
UPDATE public.companies 
SET approved_at = created_at 
WHERE is_approved = true AND approved_at IS NULL;
```

## 2. Test Admin Approval Process
1. Create a new test user account with signup
2. Check that the user receives a "pending approval" message
3. Login as admin
4. Go to Admin page (/admin)
5. Find the new company in the Companies list
6. Click "승인" (Approve) button
7. Verify the approved_at timestamp is set in database
8. Verify user can now login without issues

## 3. Test Login Flickering Fix
1. Clear browser cache and cookies
2. Login with a valid user account
3. Observe that login process is smooth without multiple flickers
4. Check browser console for any errors
5. Navigate between pages to ensure auth state is stable

## 4. Test Admin Navigation Menu
1. Login as admin user
2. Check navigation menu shows "관리자" (Admin) instead of "navigation.admin"
3. Test in different languages:
   - Korean: "관리자"
   - English: "Admin"  
   - Japanese: "管理者"
4. Verify clicking Admin menu navigates to /admin page

## 5. Verification Checklist
- [ ] approved_at field exists in companies table
- [ ] Admin can approve/reject companies properly
- [ ] Login doesn't flicker multiple times
- [ ] Admin menu shows correct translation
- [ ] Auth state persists correctly across page navigation
- [ ] No console errors during login/logout
- [ ] Company approval status updates correctly

## Fixed Issues Summary
1. **Admin Approval**: Added missing `approved_at` field to database
2. **Login Flickering**: Fixed race condition in AuthContext with proper mounted state check
3. **Admin Menu**: Added missing translations for admin navigation item
4. **Auth State**: Improved auth state change handling to prevent unnecessary re-renders