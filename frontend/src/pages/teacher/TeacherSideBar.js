import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotesIcon from '@mui/icons-material/Notes';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClassIcon from '@mui/icons-material/Class';
import QuizIcon from '@mui/icons-material/Quiz';
import { useSelector } from 'react-redux';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/" || location.pathname === "/Teacher/dashboard" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
            </React.Fragment>
            
            <Divider sx={{ my: 1 }} />
            
            <ListSubheader component="div" inset>
                Academic
            </ListSubheader>
            
            <React.Fragment>
                <ListItemButton component={Link} to="/Teacher/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={isActive("/Teacher/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/Teacher/attendance">
                    <ListItemIcon>
                        <CheckCircleIcon color={isActive("/Teacher/attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Take Attendance" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/Teacher/homework">
                    <ListItemIcon>
                        <AssignmentIcon color={isActive("/Teacher/homework") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Homework" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/Teacher/notes">
                    <ListItemIcon>
                        <NotesIcon color={isActive("/Teacher/notes") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notes" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/Teacher/marks">
                    <ListItemIcon>
                        <GradeIcon color={isActive("/Teacher/marks") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Marks" />
                </ListItemButton>
            </React.Fragment>

            {/* Link to view all classes - classes are shown on Home page */}
            <Divider sx={{ my: 1 }} />
            
            <ListSubheader component="div" inset>
                Classes
            </ListSubheader>
            
            <React.Fragment>
                <ListItemButton component={Link} to="/Teacher/class">
                    <ListItemIcon>
                        <ClassIcon color={isActive("/Teacher/class") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/exam-routine">
                    <ListItemIcon>
                        <QuizIcon color={isActive("/Teacher/exam-routine") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Exam Routine" />
                </ListItemButton>
            </React.Fragment>
            
            <Divider sx={{ my: 1 }} />
            
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
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

export default TeacherSideBar;

