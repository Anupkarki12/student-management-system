import { useState, useEffect } from 'react';
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
import StudentSideBar from './StudentSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import ViewFee from './ViewFee';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentHomework from './StudentHomework';
import StudentExamRoutine from './examRoutineRelated/StudentExamRoutine';
import StudentNotes from './StudentNotes';
import StudentResults from './StudentResults';
import styled, { keyframes, css } from 'styled-components';
import { useSelector } from 'react-redux';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(100, 181, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0); }
`;

const StudentDashboard = () => {
    const [open, setOpen] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { currentUser } = useSelector((state) => state.user);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    // Update date every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const studentName = currentUser?.name || "Student";
    
    const formatDate = (date) => {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <StyledAppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                onClick={toggleDrawer}
                                sx={{
                                    marginRight: '36px',
                                    ...(open && { display: 'none' }),
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <WelcomeText>Welcome back, {studentName}! 👋</WelcomeText>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DateBadge>
                                📅 {formatDate(currentDate)}
                            </DateBadge>
                            <AccountMenu />
                        </Box>
                    </Toolbar>
                </StyledAppBar>
                <Drawer variant="permanent" open={open} sx={styles.drawerStyled}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer} sx={styles.chevronButton}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <StudentSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />
                        <Route path="/Student/subjects" element={<StudentSubjects />} />
                        <Route path="/Student/notes" element={<StudentNotes />} />
                        <Route path="/Student/attendance" element={<ViewStdAttendance />} />
                        <Route path="/Student/fee" element={<ViewFee />} />
                        <Route path="/Student/complain" element={<StudentComplain />} />
                        <Route path="/Student/homework" element={<StudentHomework />} />
                        <Route path="/Student/exam-routine" element={<StudentExamRoutine />} />
                        <Route path="/Student/results" element={<StudentResults />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default StudentDashboard

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
    drawerStyled: {
        display: "flex"
    },
    chevronButton: {
        animation: css`${pulse} 2s infinite`,
    }
}

// Styled Components
const StyledAppBar = styled(AppBar)`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3) !important;
`;

const WelcomeText = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    animation: ${fadeIn} 0.5s ease-out;
    
    @media (max-width: 600px) {
        display: none;
    }
`;

const DateBadge = styled(Box)`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: white;
    font-weight: 500;
    font-size: 0.85rem;
    backdrop-filter: blur(10px);
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
    
    &:hover {
        background: rgba(255, 255, 255, 0.25);
    }
    
    @media (max-width: 600px) {
        display: none;
    }
`;

