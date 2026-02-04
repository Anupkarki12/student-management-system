# ESLint Fixes TODO List

## Phase 1: Fix Teacher Pages
- [x] TeacherHomePage.js - Fix missing useEffect dependencies (fetchTeacherClasses) useCallback
- [ ] TeacherMarks.js - Fix unused imports and missing useEffect dependencies
- [ ] TeacherNotes.js - Fix unused imports and missing useEffect dependencies

## Phase 2: Fix Component Files
- [ ] AccountTypeChooser.js - Remove unused 'pulse' variable
- [ ] NepaliDatePicker.js - Remove unused imports and constants
- [ ] ParentChooser.js - Fix missing useEffect dependency (fetchParents)

## Phase 3: Fix Page Files
- [ ] ChooserDemo.js - Remove unused 'navigate' variable
- [ ] ForgotPassword.js - Fix mixed operators (add parentheses)
- [ ] LoginPage.js - Remove unused 'Button' import

## Phase 4: Fix Admin Pages - Class Related
- [ ] AddClass.js - Fix missing useEffect dependency (sclassDetails)
- [ ] ClassDetails.js - Remove unused functions (deleteUser, resetSubjects)
- [ ] ShowClasses.js - Remove unused 'setMessage' variable

## Phase 5: Fix Admin Pages - Exam Routine
- [ ] AdminExamRoutine.js - Fix unused imports and missing useEffect dependencies

## Phase 6: Fix Admin Pages - Fee Related
- [ ] AddFee.js - Remove unused 'getAllFees' function
- [ ] ShowAllFees.js - Remove unused imports and functions

## Phase 7: Fix Admin Pages - Notes Related
- [ ] AdminNotes.js - Fix unused imports and missing useEffect dependencies

## Phase 8: Fix Admin Pages - Parent Related
- [ ] AddParent.js - Remove unused icon imports and 'InfoRow' variable
- [ ] ParentDetails.js - Remove unused 'useState' import
- [ ] ShowParents.js - Remove unused imports and 'setMessage' variable

## Phase 9: Fix Admin Pages - Result Related
- [ ] AdminResults.js - Fix unused imports and missing useEffect dependencies

## Phase 10: Fix Admin Pages - Routine Related
- [ ] AddRoutine.js - Remove unused 'loading' variable

## Phase 11: Fix Admin Pages - Salary Related
- [ ] AddSalary.js - Fix unused imports and missing useEffect dependencies
- [ ] ShowSalary.js - Fix unused imports and useEffect issues

## Phase 12: Fix Admin Pages - Staff Related
- [ ] ShowStaff.js - Remove unused imports and 'setMessage' variable
- [ ] StaffDetails.js - Remove unused 'useState' import

## Phase 13: Fix Admin Pages - Student Related
- [ ] AddStudent.js - Remove unused 'ArrowForwardIcon' import
- [ ] AllStudentMarks.js - Fix unused imports and missing useEffect dependencies
- [ ] ClassAttendance.js - Fix unused imports and missing useEffect dependencies
- [ ] ShowStudents.js - Remove unused 'getAllStudents' function
- [ ] StudentAttendance.js - Fix unused 'FormControl' and 'InputLabel' imports

## Phase 14: Fix Admin Pages - SideBar
- [ ] SideBar.js - Remove unused icon imports

## Summary
- Total useEffect dependency fixes: ~25
- Total unused variable fixes: ~50+
- Total mixed operator fixes: 1 file (multiple issues)

