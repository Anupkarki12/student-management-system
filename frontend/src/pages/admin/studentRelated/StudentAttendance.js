import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, TextField, Avatar,
    Breadcrumbs, Link, CircularProgress, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import axios from 'axios';

// Styled Components
const GradientHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.3)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
}));

const ClassCard = styled(Paper)(({ theme, $selected }) => ({
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    border: $selected ? '3px solid #667eea' : '2px solid #e0e0e0',
    background: $selected ? 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)' : 'white',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
        borderColor: '#667eea',
    },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    background: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    },
}));

const GradientCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px',
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '16px',
    '&:first-child': {
        borderRadius: '12px 0 0 0',
    },
    '&:last-child': {
        borderRadius: '0 12px 0 0',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.08)',
    },
}));

const StudentAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const schoolId = currentUser?._id;

    // Fetch all classes on component mount
    useEffect(() => {
        if (schoolId) {
            fetchClasses();
        }
    }, [schoolId]);

    // Fetch students and attendance when class and date are selected
    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchStudentsAndAttendance();
        }
    }, [selectedClass, selectedDate]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${schoolId}`);
            if (result.data && result.data.length > 0) {
                setClasses(result.data);
            } else {
                setSnackbar({ open: true, message: 'No classes found', severity: 'info' });
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setSnackbar({ open: true, message: 'Error loading classes', severity: 'error' });
        }
        setLoading(false);
    };

    const fetchStudentsAndAttendance = async () => {
        setLoading(true);
        try {
            // Fetch students for the selected class
            const studentsResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${selectedClass._id}`);
            
            if (studentsResult.data && studentsResult.data.length > 0) {
                const studentData = studentsResult.data.map(student => ({
                    ...student,
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum
                }));
                
                setStudents(studentData);
                
                // Fetch attendance for all students on the selected date
                await fetchAttendanceForDate(studentData);
            } else {
                setStudents([]);
                setAttendanceData({});
                setSnackbar({ open: true, message: 'No students found in this class', severity: 'info' });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setSnackbar({ open: true, message: 'Error loading students', severity: 'error' });
        }
        setLoading(false);
    };

    const fetchAttendanceForDate = async (studentList) => {
        try {
            const attendanceMap = {};
            const dateStr = new Date(selectedDate).toISOString();

            // Fetch attendance for each student
            for (const student of studentList) {
                try {
                    const studentResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/${student._id}`);
                    if (studentResult.data && studentResult.data.attendance) {
                        // Find attendance for the selected date
                        const attendanceRecord = studentResult.data.attendance.find(a => {
                            const attendanceDate = new Date(a.date).toISOString().split('T')[0];
                            return attendanceDate === selectedDate;
                        });

                        if (attendanceRecord) {
                            attendanceMap[student._id] = {
                                status: attendanceRecord.status,
                                subName: attendanceRecord.subName
                            };
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching attendance for student ${student._id}:`, err);
                }
            }

            setAttendanceData(attendanceMap);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setStudents([]);
        setAttendanceData({});
    };

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setStudents([]);
        setAttendanceData({});
    };

    const getStatusColor = (status) => {
        return status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default';
    };

    const getStatusIcon = (status) => {
        return status === 'Present' ? <CheckCircleIcon color="success" /> : 
               status === 'Absent' ? <CancelIcon color="error" /> : null;
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Render Classes View (Card Format)
    const renderClassesView = () => (
        <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 4 }}>
                Select a Class
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : classes.length === 0 ? (
                <GlassCard sx={{ p: 6, textAlign: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                        No Classes Found
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Add classes to manage attendance
                    </Typography>
                </GlassCard>
            ) : (
                <Grid container spacing={3}>
                    {classes.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} key={cls._id}>
                            <ClassCard 
                                $selected={false}
                                onClick={() => handleClassClick(cls)}
                                sx={{ p: 3 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#667eea', mr: 2 }}>
                                        <SchoolIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                            Class {cls.sclassName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            View Attendance
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip 
                                    label="Select Class" 
                                    color="primary" 
                                    size="small"
                                    sx={{ bgcolor: '#1a237e' }}
                                />
                            </ClassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Render Students View (Table with Date Filter)
    const renderStudentsView = () => {
        const presentCount = Object.values(attendanceData).filter(a => a.status === 'Present').length;
        const absentCount = Object.values(attendanceData).filter(a => a.status === 'Absent').length;
        const notMarkedCount = students.length - presentCount - absentCount;

        return (
        <Box>
            {/* Breadcrumb Header */}
            <GlassCard sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Breadcrumbs sx={{ color: '#1a237e' }}>
                        <Link 
                            color="inherit" 
                            onClick={handleBackToClasses}
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', '&:hover': { textDecoration: 'underline' } }}
                        >
                            <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                        </Link>
                        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ mr: 0.5 }} />
                            Class {selectedClass?.sclassName} - Attendance
                        </Typography>
                    </Breadcrumbs>

                    {/* Date Selector */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <Button 
                            variant="contained"
                            onClick={fetchStudentsAndAttendance}
                            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b5e' } }}
                            startIcon={<CalendarTodayIcon />}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>
            </GlassCard>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#1a237e', mx: 'auto', mb: 2 }}>
                            <PeopleIcon />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                            {students.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Total Students
                        </Typography>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#4caf50', mx: 'auto', mb: 2 }}>
                            <CheckCircleIcon />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {presentCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Present Today
                        </Typography>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#f44336', mx: 'auto', mb: 2 }}>
                            <CancelIcon />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                            {absentCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Absent Today
                        </Typography>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: '#ff9800', mx: 'auto', mb: 2 }}>
                            <EventIcon />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                            {notMarkedCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Not Marked
                        </Typography>
                    </StatsCard>
                </Grid>
            </Grid>

            {/* Selected Date Info */}
            <GradientCard sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Attendance for {formatDate(selectedDate)}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {selectedClass?.sclassName} - {students.length} Students
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip 
                            icon={<CheckCircleIcon />} 
                            label={`Present: ${presentCount}`} 
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                        />
                        <Chip 
                            icon={<CancelIcon />} 
                            label={`Absent: ${absentCount}`} 
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                        />
                    </Box>
                </Box>
            </GradientCard>

            {/* Loading */}
            {loading && (
                <Box sx={{ mb: 3 }}>
                    <Typography color="textSecondary" sx={{ mb: 1 }}>Loading attendance data...</Typography>
                </Box>
            )}

            {/* Attendance Table */}
            <GlassCard sx={{ overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell sx={{ width: '10%' }}>Roll No</TableHeaderCell>
                                <TableHeaderCell sx={{ width: '35%' }}>Student Name</TableHeaderCell>
                                <TableHeaderCell sx={{ width: '20%' }}>Status</TableHeaderCell>
                                <TableHeaderCell sx={{ width: '20%' }}>Subject</TableHeaderCell>
                                <TableHeaderCell sx={{ width: '15%' }}>Attendance</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={48} />
                                        <Typography variant="body1" sx={{ mt: 2, color: 'textSecondary' }}>
                                            Loading students...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <SchoolIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">
                                            No students found in this class
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => {
                                    const attendance = attendanceData[student._id];
                                    const status = attendance?.status || 'Not Marked';
                                    
                                    return (
                                        <StyledTableRow key={student._id}>
                                            <TableCell>
                                                <Chip 
                                                    label={student.rollNum || '-'} 
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: '#e8eaf6',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar sx={{ width: 45, height: 45, bgcolor: '#667eea', mr: 2 }}>
                                                        <PersonIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                            {student.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            Student ID: {student._id?.slice(-6)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    icon={getStatusIcon(status)}
                                                    label={status}
                                                    color={getStatusColor(status)}
                                                    variant={status === 'Not Marked' ? 'outlined' : 'filled'}
                                                    size="medium"
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        minWidth: 100
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {attendance?.subName || (
                                                        <Chip 
                                                            label="Not Assigned" 
                                                            size="small" 
                                                            sx={{ bgcolor: '#f5f5f5' }}
                                                        />
                                                    )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip 
                                                        icon={<CheckCircleIcon />}
                                                        label="Present"
                                                        color={status === 'Present' ? 'success' : 'default'}
                                                        variant={status === 'Present' ? 'filled' : 'outlined'}
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        icon={<CancelIcon />}
                                                        label="Absent"
                                                        color={status === 'Absent' ? 'error' : 'default'}
                                                        variant={status === 'Absent' ? 'filled' : 'outlined'}
                                                        size="small"
                                                    />
                                                </Box>
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </GlassCard>

            {/* Summary Footer */}
            {students.length > 0 && (
                <GlassCard sx={{ p: 3, mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {presentCount}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Present Students
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                                    <CancelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                        {absentCount}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Absent Students
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                                    <EventIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                        {notMarkedCount}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Not Marked
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </GlassCard>
            )}
        </Box>
    );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
            <Container maxWidth="xl">
                {/* Gradient Header */}
                <GradientHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                            <EventIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Student Attendance Management
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        Track and manage student attendance for all classes
                    </Typography>
                    <Breadcrumbs sx={{ color: 'white' }}>
                        <Link 
                            color="inherit" 
                            href="#"
                            onClick={(e) => { e.preventDefault(); }}
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <SchoolIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Admin Dashboard
                        </Link>
                        <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Student Attendance
                        </Typography>
                    </Breadcrumbs>
                </GradientHeader>

                {/* Main Content */}
                {selectedClass ? renderStudentsView() : renderClassesView()}

            </Container>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Paper 
                    onClose={handleCloseSnackbar}
                    sx={{ 
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        bgcolor: snackbar.severity === 'error' ? '#ffebee' : 
                                  snackbar.severity === 'success' ? '#e8f5e9' : '#e3f2fd'
                    }}
                >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        {snackbar.severity === 'error' && <CancelIcon color="error" sx={{ mr: 1 }} />}
                        {snackbar.severity === 'success' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
                        {snackbar.severity === 'info' && <EventIcon color="info" sx={{ mr: 1 }} />}
                        <Typography variant="body1">{snackbar.message}</Typography>
                    </Box>
                </Paper>
            </Snackbar>
        </Box>
    );
};

export default StudentAttendance;

