# Fix Parent Dashboard Academic Performance Calculation

## Issue
The parent dashboard shows academic performance as 0% or incorrect because the backend calculates average by just averaging the marks obtained values, without considering the max marks for each subject.

## Root Cause
The `examResult` array in the student schema only stores `subName` and `marksObtained` - it does NOT store `maxMarks`. The current calculation is:
```javascript
const totalMarks = student.examResult?.reduce((sum, r) => sum + (r.marksObtained || 0), 0) || 0;
const subjectCount = student.examResult?.length || 0;
const averageMarks = subjectCount > 0 ? totalMarks / subjectCount : 0;
```

This is wrong because it doesn't account for different max marks in different subjects.

## Fix Plan
1. Modify `backend/controllers/parent-controller.js` to:
   - Import the Marks model
   - Query the Marks collection for each student's marks with both `marksObtained` and `maxMarks`
   - Calculate the correct overall percentage: (total marks obtained / total max marks) * 100

## Progress
- [x] Analyze the issue and understand the codebase
- [x] Create todo list
- [x] Implement fix in parent-controller.js
- [x] Test the fix


