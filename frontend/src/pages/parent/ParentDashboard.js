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
    Collapse,
    FormControl,
    Select,
    MenuItem,
    Stack
} from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FilterListIcon from '@mui/icons-material/FilterList';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GradeIcon from '@mui/icons-material/Grade';
import BookIcon from '@mui/icons-material/Book';
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

// Styled components for beautiful UI
const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
    },
}));

 
 
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

                                    {/* Subjects List */}
                                    {student.subjects && student.subjects.length > 0 && (
                                        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0f4ff', borderRadius: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <BookIcon sx={{ mr: 1, color: '#7f56da' }} />
                                                <Typography variant="body2" fontWeight="bold">
                                                    Subjects ({student.subjects.length})
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {student.subjects.map((subject, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={`${subject.subName}${subject.subCode ? ` (${subject.subCode})` : ''}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'white',
                                                            border: '1px solid #7f56da',
                                                            '& .MuiChip-label': {
                                                                color: '#7f56da'
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Marks Section */}
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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { studentId } = useParams();
    const { currentUser } = useSelector(state => state.user);
    const { userDetails, loading } = useSelector(state => state.parent);
    
    const [studentMarks, setStudentMarks] = useState([]);
    const [loadingMarks, setLoadingMarks] = useState(false);
    const [examTypeFilter, setExamTypeFilter] = useState('all');
    
    // Available exam types
    const examTypes = ['First Terminal', 'Second Terminal', 'Mid-Terminal', 'Annual', 'Test'];
    
    // Find the selected child from the students list
    const child = userDetails?.students?.find(s => s.studentId === studentId);

    useEffect(() => {
        if (studentId) {
            fetchStudentMarks();
        }
    }, [studentId, examTypeFilter]);

    const fetchStudentMarks = async () => {
        setLoadingMarks(true);
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/Marks/Student/${studentId}`;
            if (examTypeFilter !== 'all') {
                url += `?examType=${encodeURIComponent(examTypeFilter)}`;
            }
            const result = await axios.get(url);
            if (result.data && result.data.message) {
                setStudentMarks([]);
            } else if (Array.isArray(result.data)) {
                setStudentMarks(result.data);
            } else {
                setStudentMarks([]);
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
            setStudentMarks([]);
        }
        setLoadingMarks(false);
    };

    // Calculate grade from percentage
    const calculateGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        return 'F';
    };

    // Get grade color
    const getGradeColor = (grade) => {
        const colors = {
            'A+': '#2e7d32',
            'A': '#1976d2',
            'B+': '#0288d1',
            'B': '#00796b',
            'C+': '#f57c00',
            'C': '#ffa000',
            'F': '#d32f2f'
        };
        return colors[grade] || '#757575';
    };

    // Get exam type color
    const getExamTypeColor = (examType) => {
        const colors = {
            'First Terminal': '#667eea',
            'Second Terminal': '#764ba2',
            'Mid-Terminal': '#f093fb',
            'Annual': '#4facfe',
            'Test': '#ff6b6b'
        };
        return colors[examType] || '#757575';
    };

    // Calculate statistics
    const calculateStats = () => {
        if (studentMarks.length === 0) return { average: 0, total: '0/0', percentage: 0 };

        const totalObtained = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = studentMarks.reduce((sum, m) => sum + m.maxMarks, 0);
        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;

        return {
            average: (totalObtained / studentMarks.length).toFixed(1),
            total: `${totalObtained}/${totalMax}`,
            percentage: percentage.toFixed(1)
        };
    };

    const stats = calculateStats();

    // Clear filter
    const clearFilters = () => {
        setExamTypeFilter('all');
    };

    // Check if any filter is active
    const hasActiveFilters = examTypeFilter !== 'all';

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
                    Academic Performance
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
            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="text" 
                    startIcon={<KeyboardArrowLeft />}
                    onClick={() => navigate(`/Parent/child/${studentId}`)}
                    sx={{ mb: 2 }}
                >
                    Back to Child Details
                </Button>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Academic Performance
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Detailed marks and results for <strong>{child.name}</strong>
                </Typography>
            </Box>

            {/* Student Info Header */}
            <GlassCard sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                                src={child.photo ? `http://localhost:5000/${child.photo}` : null}
                                sx={{ bgcolor: '#7f56da', width: 60, height: 60, mr: 2 }}
                            >
                                <Person />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    {child.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Roll No: {child.rollNum} | Class: {child.class}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {/* Filter Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FilterListIcon sx={{ color: '#7f56da' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                Filter by Exam Type
                            </Typography>
                            {hasActiveFilters && (
                                <Chip
                                    label="Clear"
                                    size="small"
                                    onClick={clearFilters}
                                    onDelete={clearFilters}
                                    color="error"
                                    variant="outlined"
                                    sx={{ ml: 'auto' }}
                                />
                            )}
                        </Box>
                        
                        <FormControl fullWidth size="small">
                            <Select
                                value={examTypeFilter}
                                onChange={(e) => setExamTypeFilter(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="all">All Exam Types</MenuItem>
                                {examTypes.map(type => (
                                    <MenuItem key={type} value={type}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Chip
                                                size="small"
                                                sx={{
                                                    mr: 1,
                                                    backgroundColor: getExamTypeColor(type),
                                                    color: 'white',
                                                    height: 20,
                                                    minWidth: 20
                                                }}
                                            />
                                            {type}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Active Filter Chips */}
                        {hasActiveFilters && (
                            <Box sx={{ mt: 1 }}>
                                <Chip
                                    size="small"
                                    icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                                    label={examTypeFilter}
                                    onDelete={() => setExamTypeFilter('all')}
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </GlassCard>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Average Marks
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#7f56da' }}>
                            {stats.average}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            out of 100
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Total Marks
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            across {studentMarks.length} exam(s)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Overall Percentage
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4facfe' }}>
                            {stats.percentage}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(parseFloat(stats.percentage), 100)}
                            sx={{
                                mt: 2,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: parseFloat(stats.percentage) >= 40 ? '#4caf50' : '#f44336',
                                    borderRadius: 5
                                }
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Results Table */}
            <GlassCard sx={{ overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        <AssessmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Exam Results
                    </Typography>
                </Box>

                {loadingMarks ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress size={60} />
                    </Box>
                ) : studentMarks.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <GradeIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                        <Typography variant="h5" color="textSecondary" gutterBottom>
                            No Results Found
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            {examTypeFilter === 'all'
                                ? 'No exam results have been entered for this student yet'
                                : `No results found for ${examTypeFilter} exam`}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5fa' }}>
                                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Exam Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Subject</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Marks</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Percentage</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Grade</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentMarks.map((mark) => {
                                    const percentage = mark.maxMarks > 0
                                        ? ((mark.marksObtained / mark.maxMarks) * 100)
                                        : 0;
                                    const grade = calculateGrade(percentage);
                                    return (
                                        <TableRow 
                                            key={mark._id}
                                            sx={{ 
                                                '&:hover': { bgcolor: 'rgba(127, 86, 218, 0.05)' },
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Chip
                                                    label={mark.examType}
                                                    sx={{
                                                        backgroundColor: getExamTypeColor(mark.examType),
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <BookIcon sx={{ fontSize: 18, mr: 1, color: '#764ba2' }} />
                                                    {mark.subject?.subName || 'N/A'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {mark.marksObtained} / {mark.maxMarks}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 60 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(percentage, 100)}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: '#e0e0e0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: getGradeColor(grade),
                                                                    borderRadius: 4
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {percentage.toFixed(1)}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={grade}
                                                    sx={{
                                                        backgroundColor: getGradeColor(grade),
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 50
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </GlassCard>

            {/* Back Button */}
            <Box sx={{ mt: 3 }}>
                <Button 
                    variant="text" 
                    startIcon={<KeyboardArrowLeft />}
                    onClick={() => navigate(`/Parent/child/${studentId}`)}
                >
                    Back to Child Details
                </Button>
            </Box>
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

