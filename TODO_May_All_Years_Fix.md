# TODO: Fix "May / All Years" data not shown issue

## Issue
When user selects "May / All Years", no data is shown because:
1. Frontend defaults "All Years" to current year (2025)
2. Backend checks for payment records only for May 2025
3. If no payment exists, data doesn't show

## Fix Plan

### Step 1: Fix Backend `getEmployeesWithSalaryStatus` 
- When year is "All", show all employees with salary records regardless of which year they were paid
- Show payment status for ANY year match when "All Years" is selected

### Step 2: Fix Frontend ShowSalary.js
- Show ALL employees with salary records (not just filtered ones)
- Display proper status indicators for paid/unpaid
- Allow viewing all salary records for the selected month across all years

## Changes

### Backend: salary-controller.js
- [x] Modify `getPaymentStatusForMonth` function to handle "All Years"
- [x] When year is "All", check if employee has ANY payment for the selected month in ANY year
- [x] Return proper status indicators

### Frontend: ShowSalary.js  
- [x] Pass null instead of defaulting to current year when "All" is selected
- [x] Backend will handle the "All" case appropriately

## Status
- [x] Implement backend fix
- [x] Implement frontend fix
- [ ] Test the fix

## Summary of Changes

### Backend Fix (salary-controller.js):
Modified `getPaymentStatusForMonth` function to handle "All Years" case:
- When year is "All", the function now checks if there's ANY payment for the selected month across ALL years
- If a payment exists for the selected month in any year, it marks the employee as "Paid"
- This allows users to see data when selecting "May / All Years" - it will show employees who have ever been paid in May (regardless of year)

### Frontend Fix (ShowSalary.js):
Modified the useEffect that fetches employee salary status:
- Changed `effectiveYear` to be `null` when "All" is selected (instead of defaulting to current year)
- This allows the backend to properly handle the "All" case
- Backend receives `year=null` and knows to check across all years


