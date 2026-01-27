import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getStudentFee } from '../../../redux/feeRelated/feeHandle';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Button, Tab, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, Grid,
    Card, CardContent, TextField, MenuItem, Select, FormControl,
    InputLabel, CircularProgress, Alert
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CustomPieChart from '../../../components/CustomPieChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { formatNepaliDate } from '../../../utils/nepaliDate';

const ViewStudent = () => {
    const [value, setValue] = useState('1');
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();

    const studentID = params.id;
    const address = "Student";

    // Redux state
    const { userDetails, loading: studentLoading, error: studentError } = useSelector((state) => state.user);
    const { feesList: feeData, loading: feeLoading } = useSelector((state) => state.fee);

    // Local states
    const [marks, setMarks] = useState([]);
    const [marksLoading, setMarksLoading] = useState(false);
    const [marksError, setMarksError] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('');

    // Fetch student details
    useEffect(() => {
        if (studentID) {
            dispatch(getUserDetails(studentID, address));
            dispatch(getStudentFee(studentID));
            fetchStudentMarks();
        }
    }, [dispatch, studentID]);

    const fetchStudentMarks = async () => {
        setMarksLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Marks/Student/${studentID}`);
            if (result.data && result.data.message) {
                setMarks([]);
            } else if (Array.isArray(result.data)) {
                setMarks(result.data);
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
            setMarksError('Error loading marks data');
        }
        setMarksLoading(false);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Calculate attendance statistics
    const calculateAttendanceStats = () => {
        if (!userDetails?.attendance || userDetails.attendance.length === 0) {
            return { present: 0, absent: 0, total: 0, percentage: 0 };
        }

        const present = userDetails.attendance.filter(a => a.status === 'Present').length;
        const absent = userDetails.attendance.filter(a => a.status === 'Absent').length;
        const total = userDetails.attendance.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return { present, absent, total, percentage };
    };

    const attendanceStats = calculateAttendanceStats();

    // Get pie chart data
    const getAttendanceChartData = () => {
        if (attendanceStats.total === 0) return [];
        return [
            { name: 'Present', value: attendanceStats.present },
            { name: 'Absent', value: attendanceStats.absent }
        ];
    };

    // Filter attendance by month
    const getFilteredAttendance = () => {
        if (!userDetails?.attendance) return [];
        if (!selectedMonth) return userDetails.attendance;

        return userDetails.attendance.filter(a => {
            const attendanceDate = new Date(a.date);
            const filterDate = new Date(selectedMonth);
            return (
                attendanceDate.getMonth() === filterDate.getMonth() &&
                attendanceDate.getFullYear() === filterDate.getFullYear()
            );
        });
    };

    // Calculate marks statistics
    const calculateMarksStats = () => {
        if (!marks || marks.length === 0) {
            return { totalExams: 0, averagePercentage: 0, totalMarks: 0, obtainedMarks: 0 };
        }

        let totalMarks = 0;
        let obtainedMarks = 0;

        marks.forEach(mark => {
            totalMarks += mark.maxMarks || 0;
            obtainedMarks += mark.marksObtained || 0;
        });

        const averagePercentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;

        return {
            totalExams: marks.length,
            averagePercentage,
            totalMarks,
            obtainedMarks
        };
    };

    const marksStats = calculateMarksStats();

    // Get grade color
    const getGradeColor = (percentage) => {
        const percent = parseFloat(percentage);
        if (percent >= 90) return 'success';
        if (percent >= 80) return 'primary';
        if (percent >= 70) return 'info';
        if (percent >= 60) return 'warning';
        return 'error';
    };

    // Calculate fee statistics
    const calculateFeeStats = () => {
        if (!feeData || !Array.isArray(feeData) || feeData.length === 0) {
            return { total: 0, paid: 0, unpaid: 0, partial: 0 };
        }

        let total = 0;
        let paid = 0;
        let unpaid = 0;
        let partial = 0;

        // Check if feeData[0] has feeDetails array
        const feeDetails = feeData[0]?.feeDetails || feeData;

        if (Array.isArray(feeDetails)) {
            feeDetails.forEach(fee => {
                total += fee.amount || 0;
                if (fee.status === 'Paid') {
                    paid += fee.amount || 0;
                } else if (fee.status === 'Partial') {
                    partial += fee.paidAmount || 0;
                    unpaid += (fee.amount || 0) - (fee.paidAmount || 0);
                } else {
                    unpaid += fee.amount || 0;
                }
            });
        }

        return { total, paid, unpaid, partial };
    };

    const feeStats = calculateFeeStats();

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Unpaid': return 'error';
            case 'Partial': return 'warning';
            default: return 'default';
        }
    };

    // Get unique months from attendance
    const getUniqueMonths = () => {
        if (!userDetails?.attendance) return [];

        const months = new Set();
        userDetails.attendance.forEach(a => {
            const date = new Date(a.date);
            months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        });

        return Array.from(months).sort().reverse();
    };

    if (studentLoading || feeLoading) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading student details...</Typography>
            </Container>
        );
    }

    if (studentError) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">Error fetching student details: {studentError}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Go Back
            </Button>

            <TabContext value={value}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange} variant="scrollable" scrollButtons="auto">
                            <Tab label="Details" value="1" />
                            <Tab label="Attendance" value="2" />
                            <Tab label="Marks" value="3" />
                            <Tab label="Fee" value="4" />
                        </TabList>
                    </Box>

                    {/* Tab 1: Student Details */}
                    <TabPanel value="1">
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Student Details
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Basic Info Card */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary">
                                                Basic Information
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="textSecondary">Name</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {userDetails?.name || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="textSecondary">Roll Number</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {userDetails?.rollNum || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="textSecondary">Class</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {userDetails?.sclassName?.sclassName || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="textSecondary">School</Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {userDetails?.school?.schoolName || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Attendance Summary Card */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary">
                                                Attendance Overview
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="success.main">
                                                        {attendanceStats.percentage}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Attendance Rate
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="success.main">
                                                        {attendanceStats.present}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Present Days
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="error.main">
                                                        {attendanceStats.absent}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Absent Days
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            {getAttendanceChartData().length > 0 && (
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                                    <CustomPieChart data={getAttendanceChartData()} />
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Marks Summary Card */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary">
                                                Academic Performance
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="primary.main">
                                                        {marksStats.averagePercentage}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Average Score
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4">
                                                        {marksStats.obtainedMarks}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Total Marks Obtained
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4">
                                                        {marksStats.totalExams}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Exams Taken
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Fee Summary Card */}
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary">
                                                Fee Status
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="primary.main">
                                                        ₹{feeStats.total.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Total Fee
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="success.main">
                                                        ₹{feeStats.paid.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Paid
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Typography variant="h4" color="error.main">
                                                        ₹{feeStats.unpaid.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Due
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>

                    {/* Tab 2: Attendance */}
                    <TabPanel value="2">
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Attendance Details
                            </Typography>

                            {/* Filters */}
                            <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Filter by Month</InputLabel>
                                            <Select
                                                value={selectedMonth}
                                                label="Filter by Month"
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                            >
                                                <MenuItem value="">All Months</MenuItem>
                                                {getUniqueMonths().map(month => (
                                                    <MenuItem key={month} value={month}>
                                                        {formatNepaliDate(new Date(month + '-01'), { format: 'monthYear' })}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label={`Present: ${userDetails?.attendance?.filter(a => a.status === 'Present').length || 0}`}
                                            color="success"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<CancelIcon />}
                                            label={`Absent: ${userDetails?.attendance?.filter(a => a.status === 'Absent').length || 0}`}
                                            color="error"
                                            variant="outlined"
                                            sx={{ ml: 1 }}
                                        />
                                    </Grid>
                                    </Grid>
                            </Paper>

                            {/* Attendance Table */}
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getFilteredAttendance().length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <Typography color="textSecondary">
                                                        No attendance records found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            getFilteredAttendance().map((attendance, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>
                                                        {formatNepaliDate(new Date(attendance.date), { format: 'full', showDayName: false })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attendance.subName?.subName || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={attendance.status === 'Present' ? <CheckCircleIcon /> : <CancelIcon />}
                                                            label={attendance.status}
                                                            color={attendance.status === 'Present' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>

                    {/* Tab 3: Marks */}
                    <TabPanel value="3">
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Marks & Exam Results
                            </Typography>

                            {marksLoading ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CircularProgress />
                                    <Typography sx={{ mt: 2 }}>Loading marks...</Typography>
                                </Box>
                            ) : marksError ? (
                                <Alert severity="error" sx={{ mb: 2 }}>{marksError}</Alert>
                            ) : (
                                <>
                                    {/* Marks Summary */}
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                                <Typography variant="h6">Total Exams</Typography>
                                                <Typography variant="h4">{marksStats.totalExams}</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                                                <Typography variant="h6">Average</Typography>
                                                <Typography variant="h4" color="success.main">
                                                    {marksStats.averagePercentage}%
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                                                <Typography variant="h6">Total Marks</Typography>
                                                <Typography variant="h4">{marksStats.totalMarks}</Typography>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                                                <Typography variant="h6">Obtained</Typography>
                                                <Typography variant="h4">{marksStats.obtainedMarks}</Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Marks Table */}
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {marks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                            <Typography color="textSecondary">
                                                                No marks records found
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    marks.map((mark) => {
                                                        const percentage = mark.maxMarks > 0
                                                            ? ((mark.marksObtained / mark.maxMarks) * 100).toFixed(1)
                                                            : 0;
                                                        return (
                                                            <TableRow key={mark._id} hover>
                                                                <TableCell>
                                                                    {formatNepaliDate(new Date(mark.examDate), { format: 'full', showDayName: false })}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={mark.examType}
                                                                        color="primary"
                                                                        variant="outlined"
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {mark.subject?.subName || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {mark.teacher?.name || 'N/A'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {mark.marksObtained} / {mark.maxMarks}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={`${percentage}%`}
                                                                        color={getGradeColor(percentage)}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        {mark.grade || '-'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2">
                                                                        {mark.comments || '-'}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    </TabPanel>

                    {/* Tab 4: Fee */}
                    <TabPanel value="4">
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                Fee Details
                            </Typography>

                            {/* Fee Summary Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                                        <Typography variant="h6">Total Fee</Typography>
                                        <Typography variant="h4" color="primary.main">
                                            ₹{feeStats.total.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                                        <Typography variant="h6">Paid</Typography>
                                        <Typography variant="h4" color="success.main">
                                            ₹{feeStats.paid.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                                        <Typography variant="h6">Due</Typography>
                                        <Typography variant="h4" color="error.main">
                                            ₹{feeStats.unpaid.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                                        <Typography variant="h6">Partial</Typography>
                                        <Typography variant="h4" color="warning.main">
                                            ₹{feeStats.partial.toFixed(2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Fee Details Table */}
                            <Paper sx={{ p: 2 }} variant="outlined">
                                <Typography variant="h6" gutterBottom>
                                    Monthly Fee Breakdown
                                </Typography>
                                {feeData && Array.isArray(feeData) && feeData.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Month</TableCell>
                                                    <TableCell align="right">Amount</TableCell>
                                                    <TableCell>Due Date</TableCell>
                                                    <TableCell>Payment Date</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Description</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(() => {
                                                    const feeDetails = feeData[0]?.feeDetails || feeData;
                                                    return feeDetails.map((fee, index) => (
                                                        <TableRow key={fee?._id || index}>
                                                            <TableCell>{fee?.month}</TableCell>
                                                            <TableCell align="right">
                                                                ₹{fee?.amount?.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {fee?.dueDate
                                                                    ? formatNepaliDate(new Date(fee.dueDate), { format: 'full', showDayName: false })
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {fee?.paymentDate
                                                                    ? formatNepaliDate(new Date(fee.paymentDate), { format: 'full', showDayName: false })
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={fee?.status || 'Unknown'}
                                                                    color={getStatusColor(fee?.status)}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{fee?.description || '-'}</TableCell>
                                                        </TableRow>
                                                    ));
                                                })()}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography sx={{ textAlign: 'center', py: 3 }}>
                                        No fee records found for this student.
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
                    </TabPanel>
                </Paper>
            </TabContext>
        </Container>
    );
};

export { ViewStudent };
