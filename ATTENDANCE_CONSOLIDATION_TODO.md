# Attendance Icons Consolidation - TODO

## Goal
Consolidate 3 separate attendance icons (Student, Teacher, Staff) into 1 Attendance icon with dropdown menu in Admin SideBar.

## Changes Required

### 1. Modify `frontend/src/pages/admin/SideBar.js`
- [x] Import Collapse and Expand icons from MUI
- [x] Import Event icon for attendance parent menu
- [x] Add state for attendance menu collapse/expand
- [x] Replace 3 separate attendance ListItemButtons with:
  - [x] 1 parent ListItemButton with Attendance icon
  - [x] Expand/collapse chevron icon
  - [x] Collapse container with nested ListItems for Student, Teacher, Staff attendance
- [x] Update styling for nested items

## Status: ✅ COMPLETED

## Summary of Changes:
1. Added imports: `Collapse`, `Box`, `EventIcon`, `ExpandLess`, `ExpandMore`, `PersonIcon`, `GroupsIcon`
2. Added `attendanceExpanded` state for toggle functionality
3. Created `isAttendanceActive` helper to highlight when any attendance page is active
4. Replaced 3 separate attendance buttons with:
   - Single "Attendance" parent button with Event icon
   - Expand/collapse indicator
   - Collapsible nested menu with Student, Teacher, Staff options
5. All routes remain unchanged - functionality preserved

