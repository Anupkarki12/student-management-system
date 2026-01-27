import { useEffect, useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
    Person,
    Description,
    Feedback,
    School,
    Assignment,
    TrendingUp,
    CalendarToday,
    Visibility
} from '@mui/icons-material';
import ParentSideBar from './ParentSideBar';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getParentDashboard } from '../../redux/parentRelated/parentHandle';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import SeeNotice from '../../components/SeeNotice';
import StudentComplain from '../student/StudentComplain';
import ParentViewAttendance from './ParentViewAttendance';
import ParentViewHomework from './ParentViewHomework';
import ParentViewFee from './ParentViewFee';

// Placeholder components for Parent pages
const ParentHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { loading, userDetails } = useSelector(state => state.parent);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParentDashboard(currentUser._id));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (userDetails?.students) {
            setDashboardData(userDetails);
        }
    }, [userDetails]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Parent Dashboard
            </Typography>
            
            {/* Welcome Message */}
            <Card sx={{ mb: 3, bgcolor: '#7f56da', color: 'white' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Welcome, {currentUser?.fatherName || currentUser?.motherName || currentUser?.guardianName}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Monitor your children's academic progress and stay connected with the school.
                    </Typography>
                </CardContent>
            </Card>

            {/* Children Overview */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Your Children
            </Typography>
            
            {dashboardData?.students && dashboardData.students.length > 0 ? (
                <Grid container spacing={3}>
                    {dashboardData.students.map((student) => (
                        <Grid item xs={12} md={6} key={student.studentId}>
                            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: '#7f56da', width: 56, height: 56, mr: 2 }}>
                                            <Person />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {student.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Roll No: {student.rollNum} | Class: {student.class}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Academic Progress */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">Attendance</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {student.attendancePercentage}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={parseFloat(student.attendancePercentage)} 
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                    color={parseFloat(student.attendancePercentage) >= 75 ? 'success' : 'warning'}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">Average Marks</Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {student.averageMarks}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={Math.min(parseFloat(student.averageMarks), 100)} 
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                    color={parseFloat(student.averageMarks) >= 60 ? 'success' : 'warning'}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Subjects: {student.subjectsCount} | 
                                            Attendance: {student.attendancePercentage}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        startIcon={<Visibility />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}`)}
                                    >
                                        View Details
                                    </Button>
                                    <Button 
                                        size="small" 
                                        startIcon={<Assignment />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}/marks`)}
                                    >
                                        View Marks
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="text.secondary">
                        No children linked to your account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Please contact the school administration to link your children to your parent account.
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

const ParentChildren = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { loading, userDetails } = useSelector(state => state.parent);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParentDashboard(currentUser._id));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (userDetails?.students) {
            setDashboardData(userDetails);
        }
    }, [userDetails]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                My Children
            </Typography>

            {dashboardData?.students && dashboardData.students.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#7f56da' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Roll No</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Class</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Attendance</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Avg. Marks</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dashboardData.students.map((student) => (
                                <TableRow key={student.studentId} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: '#7f56da', mr: 2 }}>
                                                <Person />
                                            </Avatar>
                                            {student.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{student.rollNum}</TableCell>
                                    <TableCell>{student.class}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`${student.attendancePercentage}%`}
                                            color={parseFloat(student.attendancePercentage) >= 75 ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={`${student.averageMarks}%`}
                                            color={parseFloat(student.averageMarks) >= 60 ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            size="small" 
                                            startIcon={<Visibility />}
                                            onClick={() => navigate(`/Parent/child/${student.studentId}`)}
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" color="text.secondary">
                        No children linked to your account
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

const ChildDetails = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { loading, userDetails } = useSelector(state => state.parent);
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedChild, setSelectedChild] = useState(null);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParentDashboard(currentUser._id));
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (userDetails?.students) {
            setDashboardData(userDetails);
        }
    }, [userDetails]);

    // Get student details from userDetails.students
    const student = userDetails?.students?.find(s => s.studentId === selectedChild);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Child Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Select a child from "My Children" to view detailed academic information.
            </Typography>
        </Box>
    );
};

const ChildMarks = () => {
    const { currentUser } = useSelector(state => state.user);
    const { loading, userDetails } = useSelector(state => state.parent);

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Academic Performance
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Detailed marks and performance reports for your children will be displayed here.
            </Typography>
        </Box>
    );
};

const ParentNotices = () => (
    <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>School Notices</Typography>
        <SeeNotice />
    </Box>
);

const ParentComplain = () => (
    <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>Send Complain</Typography>
        <StudentComplain />
    </Box>
);

const ParentProfile = () => (
    <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>My Profile</Typography>
        <Typography variant="body1">Parent profile information will be displayed here.</Typography>
    </Box>
);

const ParentDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar open={open} position='absolute'>
                    <Toolbar sx={{ pr: '24px' }}>
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
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            Parent Dashboard
                        </Typography>
                        <AccountMenu />
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={styles.drawerStyled}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <ParentSideBar />
                    </List>
                </Drawer>
                <Box component="main" sx={styles.boxStyled}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<ParentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Parent/dashboard" element={<ParentHomePage />} />
                        <Route path="/Parent/children" element={<ParentChildren />} />
                        <Route path="/Parent/child/:studentId" element={<ChildDetails />} />
                        <Route path="/Parent/child/:studentId/marks" element={<ChildMarks />} />
                        <Route path="/Parent/child/:studentId/attendance" element={<ParentViewAttendance />} />
                        <Route path="/Parent/child/:studentId/homework" element={<ParentViewHomework />} />
                        <Route path="/Parent/child/:studentId/fees" element={<ParentViewFee />} />
                        <Route path="/Parent/attendance" element={<ParentViewAttendance />} />
                        <Route path="/Parent/homework" element={<ParentViewHomework />} />
                        <Route path="/Parent/fees" element={<ParentViewFee />} />
                        <Route path="/Parent/notices" element={<ParentNotices />} />
                        <Route path="/Parent/complain" element={<ParentComplain />} />
                        <Route path="/Parent/profile" element={<ParentProfile />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}

export default ParentDashboard

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
}

