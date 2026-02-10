import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SchoolIcon from '@mui/icons-material/School';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QuizIcon from '@mui/icons-material/Quiz';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';

const SideBar = () => {
    const location = useLocation();
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/" || location.pathname === "/Admin/dashboard" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes">
                    <ListItemIcon>
                        <ClassOutlinedIcon color={location.pathname.startsWith('/Admin/classes') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Admin/subjects") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers">
                    <ListItemIcon>
                        <SchoolIcon color={location.pathname.startsWith("/Admin/teachers") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teachers" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers/assign">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Admin/teachers/assign") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assign Teacher" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/Admin/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/generate-id-cards">
                    <ListItemIcon>
                        <BadgeIcon color={location.pathname.startsWith("/Admin/generate-id-cards") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="ID Cards" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/parents">
                    <ListItemIcon>
                        <FamilyRestroomIcon color={location.pathname.startsWith("/Admin/parents") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Parents" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/staff">
                    <ListItemIcon>
                        <WorkIcon color={location.pathname.startsWith("/Admin/staff") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Staff" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/fees">
                    <ListItemIcon>
                        <PaymentIcon color={location.pathname.startsWith("/Admin/fees") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Fees" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/salary">
                    <ListItemIcon>
                        <AttachMoneyIcon color={location.pathname.startsWith("/Admin/salary") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Salary" />
                </ListItemButton>

                <ListItemButton component={Link} to="/Admin/exam-routine">
                    <ListItemIcon>
                        <QuizIcon color={location.pathname.startsWith("/Admin/exam-routine") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Exam Routine" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notes">
                    <ListItemIcon>
                        <NotesIcon color={location.pathname.startsWith("/Admin/notes") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notes" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/Admin/results">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Admin/results") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Results" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/report-cards">
                    <ListItemIcon>
                        <DescriptionIcon color={location.pathname.startsWith("/Admin/report-cards") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Report Cards" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/attendance">
                    <ListItemIcon>
                        <CheckCircleIcon color={location.pathname.startsWith("/Admin/attendance") && !location.pathname.startsWith("/Admin/teacher-attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Student Attendance" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teacher-attendance">
                    <ListItemIcon>
                        <CheckCircleIcon color={location.pathname.startsWith("/Admin/teacher-attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teacher Attendance" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/staff-attendance">
                    <ListItemIcon>
                        <CheckCircleIcon color={location.pathname.startsWith("/Admin/staff-attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Staff Attendance" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notices">
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={location.pathname.startsWith("/Admin/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notices" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/complains">
                    <ListItemIcon>
                        <ReportIcon color={location.pathname.startsWith("/Admin/complains") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complains" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Admin/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default SideBar;

