# TODO: Fix Teacher Details Not Showing on Class Details Page

## Plan Overview
Add functionality to fetch and display teacher details on the class details page.

## Tasks

### Backend Changes
- [x] 1. Add `getSclassTeachers` endpoint to `backend/controllers/class-controller.js`
- [x] 2. Update `backend/routes/route.js` with new route `/Sclass/Teachers/:id`

### Frontend Changes
- [x] 3. Update `frontend/src/redux/sclassRelated/sclassSlice.js` with new state and actions
- [x] 4. Update `frontend/src/redux/sclassRelated/sclassHandle.js` with new async thunk
- [x] 5. Update `frontend/src/pages/admin/classRelated/ClassDetails.js` to fetch and display teachers

## Implementation Details

### 1. Backend: class-controller.js
Added new function `getSclassTeachers` to fetch teachers for a class using TeacherClassAssignment model

### 2. Backend: route.js
Added route: GET `/Sclass/Teachers/:id`

### 3. Frontend: sclassSlice.js
Added:
- `sclassTeachers` to initial state
- `getTeachersSuccess` action
- `getTeachersFailed` action

### 4. Frontend: sclassHandle.js
Added:
- `getClassTeachers` async thunk

### 5. Frontend: ClassDetails.js
- Imported `getClassTeachers` action
- Dispatched action in useEffect
- Updated `ClassTeachersSection` component with table template displaying:
  - Teacher Name
  - Teacher Email
  - Subject Name
- Added "Assign Teacher" button and SpeedDialTemplate actions

## Testing Instructions
1. Restart the backend server
2. Restart the frontend development server
3. Navigate to a class details page (e.g., `/Admin/classes/class/6980435832f8ab1eeeeec53e`)
4. Click on the "Teachers" tab
5. Verify that teachers assigned to the class are displayed in a table format
6. Verify that the "Assign Teacher" button is available to assign new teachers

