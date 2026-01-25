import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Chip, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotesIcon from '@mui/icons-material/Notes';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import ClassIcon from '@mui/icons-material/Class';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const teacherId = currentUser?._id;

    useEffect(() => {
        if (teacherId) {
            fetchTeacherClasses();
        }
    }, [teacherId]);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Classes/${teacherId}`);
            if (Array.isArray(result.data) && result.data.length > 0) {
                setTeacherClasses(result.data);
            }
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
        }
        setLoading(false);
    };

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
                
                <ListItemButton component={Link} to="/Teacher/documents">
                    <ListItemIcon>
                        <DescriptionIcon color={isActive("/Teacher/documents") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Documents" />
                </ListItemButton>
            </React.Fragment>

            {/* Show all assigned classes */}
            {teacherClasses.length > 0 && (
                <>
                    <Divider sx={{ my: 1 }} />
                    <ListSubheader component="div" inset>
                        My Classes
                    </ListSubheader>
                    <React.Fragment>
                        {teacherClasses.map((cls) => (
                            <ListItemButton key={cls._id} component={Link} to={`/Teacher/class/${cls._id}`}>
                                <ListItemIcon>
                                    <ClassIcon color={isActive(`/Teacher/class/${cls._id}`) ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText primary={`Class ${cls.sclassName}`} />
                            </ListItemButton>
                        ))}
                    </React.Fragment>
                </>
            )}
            
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

