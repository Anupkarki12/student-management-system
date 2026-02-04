import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import AssignTeacher from './teacherRelated/AssignTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';
import { ViewStudent } from './studentRelated/ViewStudent';
import styled from 'styled-components';
import AddFee from './feeRelated/AddFee';
import ShowAllFees from './feeRelated/ShowAllFees';
import ViewStudentFee from './feeRelated/ViewStudentFee';
import AllStudentMarks from './studentRelated/AllStudentMarks';
import ClassAttendance from './studentRelated/ClassAttendance';
import ShowSalary from './salaryRelated/ShowSalary';
import AddSalary from './salaryRelated/AddSalary';
import AddRoutine from './routineRelated/AddRoutine';
import ShowRoutines from './routineRelated/ShowRoutines';
import AdminExamRoutine from './examRoutineRelated/AdminExamRoutine';
import AdminNotes from './notesRelated/AdminNotes';
import AdminResults from './resultRelated/AdminResults';

// Staff imports
import AddStaff from './staffRelated/AddStaff';
import ShowStaff from './staffRelated/ShowStaff';
import StaffDetails from './staffRelated/StaffDetails';
import TeacherAttendance from './teacherRelated/TeacherAttendance';
import StaffAttendance from './staffRelated/StaffAttendance';

// Parent imports
import AddParent from './parentRelated/AddParent';
import ShowParents from './parentRelated/ShowParents';
import ParentDetails from './parentRelated/ParentDetails';

const AdminDashboard = () => {
    const [open, setOpen] = useState(false);
    const toggleDrawer = () => setOpen(!open);

    return (
        <DashboardContainer>
            <CssBaseline />
            <AppBarStyled open={open} position="absolute" elevation={4}>
                <Toolbar sx={{ pr: '24px', backdropFilter: 'blur(8px)' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{ marginRight: '36px', ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1, fontWeight: 'bold' }}
                    >
                        Admin Dashboard
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBarStyled>

            <DrawerStyled variant="permanent" open={open}>
                <ToolbarStyled>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </ToolbarStyled>
                <Divider />
                <List component="nav">
                    <SideBar />
                </List>
            </DrawerStyled>

            <MainContent>
                <Toolbar />
                <Routes>
                    <Route path="/" element={<AdminHomePage />} />
                    <Route path='*' element={<Navigate to="/" />} />
                    <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                    <Route path="/Admin/profile" element={<AdminProfile />} />
                    <Route path="/Admin/complains" element={<SeeComplains />} />

                    {/* Notice */}
                    <Route path="/Admin/addnotice" element={<AddNotice />} />
                    <Route path="/Admin/notices" element={<ShowNotices />} />

                    {/* Subject */}
                    <Route path="/Admin/subjects" element={<ShowSubjects />} />
                    <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                    <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                    <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                    <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />

                    <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                    <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                    {/* Class */}
                    <Route path="/Admin/addclass" element={<AddClass />} />
                    <Route path="/Admin/editclass/:id" element={<AddClass />} />
                    <Route path="/Admin/classes" element={<ShowClasses />} />
                    <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                    <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                    {/* Student */}
                    <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                    <Route path="/Admin/students" element={<ShowStudents />} />
                    <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                    <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                    <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                    {/* Teacher */}
                    <Route path="/Admin/teachers" element={<ShowTeachers />} />
                    <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                    <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                    <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                    <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                    <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />
                    <Route path="/Admin/teachers/assign" element={<AssignTeacher />} />

                    {/* Parent */}
                    <Route path="/Admin/addparent" element={<AddParent />} />
                    <Route path="/Admin/parents" element={<ShowParents />} />
                    <Route path="/Admin/parents/:id" element={<ParentDetails />} />

                    {/* Staff */}
                    <Route path="/Admin/addstaff" element={<AddStaff />} />
                    <Route path="/Admin/staff" element={<ShowStaff />} />
                    <Route path="/Admin/staff/:id" element={<StaffDetails />} />

                    {/* Fee */}
                    <Route path="/Admin/addfee" element={<AddFee />} />
                    <Route path="/Admin/fees" element={<ShowAllFees />} />
                    <Route path="/Admin/students/student/fee/:id" element={<ViewStudentFee />} />

                    {/* Notes */}
                    <Route path="/Admin/notes" element={<AdminNotes />} />

                    {/* Marks */}
                    <Route path="/Admin/allmarks" element={<AllStudentMarks />} />

                    {/* Results */}
                    <Route path="/Admin/results" element={<AdminResults />} />

                    {/* Attendance */}
                    <Route path="/Admin/attendance" element={<ClassAttendance />} />
                    <Route path="/Admin/teacher-attendance" element={<TeacherAttendance />} />
                    <Route path="/Admin/staff-attendance" element={<StaffAttendance />} />

                    {/* Salary */}
                    <Route path="/Admin/salary" element={<ShowSalary />} />
                    <Route path="/Admin/salary/add" element={<AddSalary />} />

                    {/* Routines */}
                    <Route path="/Admin/routines" element={<ShowRoutines />} />
                    <Route path="/Admin/routines/add" element={<AddRoutine />} />

                    {/* Exam Routine */}
                    <Route path="/Admin/exam-routine" element={<AdminExamRoutine />} />

                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </MainContent>
        </DashboardContainer>
    );
};

export default AdminDashboard;

// ===== Styled Components =====
const DashboardContainer = styled(Box)`
    display: flex;
    background: linear-gradient(135deg, #1f1f38, #2c2c6c);
    min-height: 100vh;
`;

const AppBarStyled = styled(AppBar)`
    background: rgba(30,30,60,0.85) !important;
    backdrop-filter: blur(10px);
    color: #fff !important;
`;

const DrawerStyled = styled(Drawer)`
    background: rgba(40, 40, 80, 0.95) !important;
    color: #fff;
    & .MuiListItemButton-root:hover {
        background-color: rgba(127,86,218,0.3);
    }
`;

const ToolbarStyled = styled(Toolbar)`
    display: flex;
    alignItems: center;
    justifyContent: flex-end;
`;

const MainContent = styled(Box)`
    flex-grow: 1;
    height: 100vh;
    overflow-y: auto;
    padding: 24px;
    background: #f0f2f5;
`;

