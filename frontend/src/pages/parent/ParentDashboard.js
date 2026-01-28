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
    CircularProgress,
    Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
    Person,
    Assignment,
    Visibility,
    AttachMoney,
    School,
    ExpandMore,
    ExpandLess,
    Grade,
    KeyboardArrowLeft
} from '@mui/icons-material';
import ParentSideBar from './ParentSideBar';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
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

// Section to show detailed marks for a student
const StudentMarksSection = ({ examResult }) => {
    const [expanded, setExpanded] = useState(false);

    if (!examResult || examResult.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No exam results available
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Button 
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ mb: 1 }}
            >
                {expanded ? 'Hide Marks' : 'View Marks'}
            </Button>
            <Collapse in={expanded}>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Subject</strong></TableCell>
                                <TableCell align="right"><strong>Marks</strong></TableCell>
                                <TableCell align="right"><strong>Grade</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {examResult.map((result, index) => {
                                const grade = getGrade(result.marksObtained);
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{result.subject}</TableCell>
                                        <TableCell align="right">{result.marksObtained}</TableCell>
                                        <TableCell align="right">
                                            <Chip 
                                                label={grade} 
                                                size="small"
                                                color={grade === 'A+' || grade === 'A' ? 'success' : 
                                                       grade === 'B+' || grade === 'B' ? 'primary' : 
                                                       grade === 'C' ? 'warning' : 'error'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};

// Helper function to get grade from marks
const getGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
};

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
                                        <Avatar 
                                            src={student.photo ? `http://localhost:5000/${student.photo}` : null}
                                            sx={{ bgcolor: '#7f56da', width: 56, height: 56, mr: 2 }}
                                        >
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
                                                    value={Math.min(parseFloat(student.attendancePercentage), 100)} 
                                                    sx={{ height: 8, borderRadius: 4 }}
                                                    color={parseFloat(student.attendancePercentage) >= 75 ? 'success' : 'warning'}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">Avg. Marks</Typography>
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

                                    {/* Fee Status */}
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AttachMoney sx={{ mr: 1, color: student.feeStatus?.status === 'Paid' ? 'success.main' : 'error.main' }} />
                                                <Typography variant="body2">
                                                    Fee Status: 
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={student.feeStatus?.status || 'No Record'} 
                                                size="small"
                                                color={
                                                    student.feeStatus?.status === 'Paid' ? 'success' :
                                                    student.feeStatus?.status === 'Partial' ? 'warning' :
                                                    student.feeStatus?.status === 'Unpaid' ? 'error' : 'default'
                                                }
                                            />
                                        </Box>
                                        {student.feeStatus?.dueAmount > 0 && (
                                            <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: 'block' }}>
                                                Due: ₹{student.feeStatus.dueAmount.toFixed(2)}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Marks Section */}
                                    <StudentMarksSection examResult={student.examResult} />

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Subjects: {student.subjectsCount} | 
                                            Attendance: {student.attendancePercentage}% ({student.attendanceCount})
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        startIcon={<Visibility />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}`)}
                                    >
                                        Details
                                    </Button>
                                    <Button 
                                        size="small" 
                                        startIcon={<Grade />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}/marks`)}
                                    >
                                        Results
                                    </Button>
                                    <Button 
                                        size="small" 
                                        startIcon={<School />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}/attendance`)}
                                    >
                                        Attendance
                                    </Button>
                                    <Button 
                                        size="small" 
                                        startIcon={<AttachMoney />}
                                        onClick={() => navigate(`/Parent/child/${student.studentId}/fees`)}
                                    >
                                        Fees
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
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fee Status</TableCell>
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
                                        <Chip 
                                            label={student.feeStatus?.status || 'No Record'}
                                            color={
                                                student.feeStatus?.status === 'Paid' ? 'success' :
                                                student.feeStatus?.status === 'Partial' ? 'warning' :
                                                student.feeStatus?.status === 'Unpaid' ? 'error' : 'default'
                                            }
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
    const navigate = useNavigate();
    const { studentId } = useParams();
    const { currentUser } = useSelector(state => state.user);
    const { userDetails, loading } = useSelector(state => state.parent);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParentDashboard(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Find the selected child from the students list
    const child = userDetails?.students?.find(s => s.studentId === studentId);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!child) {
        return (
            <Box>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Child Details
                </Typography>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Child not found. Please select a child from "My Children".
                    </Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/Parent/children')}
                    >
                        View My Children
                    </Button>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Child Details
            </Typography>

            {/* Student Overview Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                            src={child.photo ? `http://localhost:5000/${child.photo}` : null}
                            sx={{ bgcolor: '#7f56da', width: 80, height: 80, mr: 3 }}
                        >
                            <Person sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {child.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Roll No: {child.rollNum} | Class: {child.class}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Student ID: {child.studentId}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Quick Stats */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="h4" color="primary" fontWeight="bold">
                                    {child.attendancePercentage}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Attendance
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {child.averageMarks}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Average Marks
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="h4" color="info.main" fontWeight="bold">
                                    {child.subjectsCount || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Subjects
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Chip 
                                    label={child.feeStatus?.status || 'No Record'}
                                    color={
                                        child.feeStatus?.status === 'Paid' ? 'success' :
                                        child.feeStatus?.status === 'Partial' ? 'warning' :
                                        child.feeStatus?.status === 'Unpaid' ? 'error' : 'default'
                                    }
                                    sx={{ fontSize: '1rem', py: 2.5 }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Fee Status
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Detailed Information */}
            <Grid container spacing={3}>
                {/* Attendance Details */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Attendance Summary
                                </Typography>
                                <Chip 
                                    label={`${child.attendancePercentage}%`}
                                    color={parseFloat(child.attendancePercentage) >= 75 ? 'success' : 'warning'}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Present Days</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {child.attendanceCount?.present || 0} / {child.attendanceCount?.total || 0}
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={child.attendanceCount?.total ? (child.attendanceCount.present / child.attendanceCount.total) * 100 : 0}
                                    sx={{ height: 10, borderRadius: 5 }}
                                    color={parseFloat(child.attendancePercentage) >= 75 ? 'success' : 'warning'}
                                />
                            </Box>
                            <Button 
                                variant="outlined" 
                                fullWidth
                                startIcon={<School />}
                                onClick={() => navigate(`/Parent/child/${studentId}/attendance`)}
                            >
                                View Detailed Attendance
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Academic Performance */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Academic Performance
                                </Typography>
                                <Chip 
                                    label={`${child.averageMarks}%`}
                                    color={parseFloat(child.averageMarks) >= 60 ? 'success' : 'warning'}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {child.examResult?.length || 0} exam(s) recorded
                            </Typography>
                            {child.examResult && child.examResult.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                        Recent Performance
                                    </Typography>
                                    {child.examResult.slice(0, 3).map((exam, index) => (
                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                            <Typography variant="body2">{exam.subject}</Typography>
                                            <Typography variant="body2" fontWeight="bold">{exam.marksObtained}%</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <Button 
                                variant="outlined" 
                                fullWidth
                                startIcon={<Grade />}
                                onClick={() => navigate(`/Parent/child/${studentId}/marks`)}
                            >
                                View Results
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Fee Information */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Fee Information
                                </Typography>
                                <Chip 
                                    label={child.feeStatus?.status || 'No Record'}
                                    color={
                                        child.feeStatus?.status === 'Paid' ? 'success' :
                                        child.feeStatus?.status === 'Partial' ? 'warning' :
                                        child.feeStatus?.status === 'Unpaid' ? 'error' : 'default'
                                    }
                                />
                            </Box>
                            {child.feeStatus && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                        <Typography variant="body2">Total Fee</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            ₹{child.feeStatus.totalAmount?.toFixed(2) || '0.00'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                        <Typography variant="body2">Paid Amount</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
                                            ₹{child.feeStatus.paidAmount?.toFixed(2) || '0.00'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                                        <Typography variant="body2">Due Amount</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="error.main">
                                            ₹{child.feeStatus.dueAmount?.toFixed(2) || '0.00'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                            <Button 
                                variant="outlined" 
                                fullWidth
                                startIcon={<AttachMoney />}
                                onClick={() => navigate(`/Parent/child/${studentId}/fees`)}
                            >
                                View Fee Details
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Quick Actions
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth
                                        startIcon={<School />}
                                        onClick={() => navigate(`/Parent/child/${studentId}/attendance`)}
                                    >
                                        Attendance
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth
                                        startIcon={<Grade />}
                                        onClick={() => navigate(`/Parent/child/${studentId}/marks`)}
                                    >
                                        Results
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth
                                        startIcon={<AttachMoney />}
                                        onClick={() => navigate(`/Parent/child/${studentId}/fees`)}
                                    >
                                        Fees
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth
                                        startIcon={<Assignment />}
                                        onClick={() => navigate(`/Parent/child/${studentId}/homework`)}
                                    >
                                        Homework
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Back Button */}
            <Box sx={{ mt: 3 }}>
                <Button 
                    variant="text" 
                    startIcon={<KeyboardArrowLeft />}
                    onClick={() => navigate('/Parent/children')}
                >
                    Back to My Children
                </Button>
            </Box>
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

