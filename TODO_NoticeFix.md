# Task: Fix notices not showing in admin dashboard

## Problem
Notices created by the admin are not displaying in the admin dashboard.

## Root Cause Analysis
After analyzing the code:
1. `SeeNotice.js` component fetches notices using `getAllNotices(schoolId, 'Notice')` 
2. The backend route is `/NoticeList/:id` which expects a school/admin ID
3. The `noticeHandle.js` makes the API call to fetch notices
4. Issues found:
   - No manual refresh mechanism
   - Limited error visibility
   - No retry logic when fetching fails

## Plan
1. **Add refresh button** - Allow users to manually refresh notices
2. **Improve error handling** - Show meaningful error messages
3. **Add debug logging** - Help identify API issues
4. **Add retry mechanism** - Auto-retry on failure
5. **Add manual refresh in AdminHomePage** - Allow refreshing from dashboard

## Files to Edit
- `frontend/src/components/SeeNotice.js` - Main component with improvements
- `frontend/src/pages/admin/noticeRelated/ShowNotices.js` - Show notices page
- `frontend/src/redux/noticeRelated/noticeHandle.js` - Add logging and refresh function
- `frontend/src/redux/noticeRelated/noticeSlice.js` - Improve state handling

## Implementation Steps
- [x] 1. Add refresh button to SeeNotice component
- [x] 2. Improve error display with "Try Again" option
- [x] 3. Add debug logging for API calls
- [x] 4. Add manual refresh method to noticeHandle.js
- [x] 5. Improve noticeSlice to handle "No notices found" better
- [x] 6. Update ShowNotices.js with better refresh after delete

## Testing
1. Add a notice via /Admin/addnotice
2. Check if it shows in /Admin/notices
3. Check if it shows on Admin dashboard (AdminHomePage)
4. Try the refresh button
5. Check browser console for API logs

