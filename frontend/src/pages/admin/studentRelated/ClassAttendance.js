import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, Card, CardContent, Breadcrumbs, Link
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const ClassAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
                setMessage({ type: 'info', text: 'No classes found' });
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setMessage({ type: 'error', text: 'Error loading classes' });
        }
        setLoading(false);
    };

    const fetchStudentsAndAttendance = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
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
                setMessage({ type: 'info', text: 'No students found in this class' });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Error loading students' });
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

    // Render Classes View (Card Format)
    const renderClassesView = () => (
        <Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
                Select a Class
            </Typography>

            <Grid container spacing={3}>
                {loading ? (
                    <Grid item xs={12}>
                        <Typography align="center">Loading classes...</Typography>
                    </Grid>
                ) : classes.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography align="center" color="textSecondary">
                            No classes found
                        </Typography>
                    </Grid>
                ) : (
                    classes.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} key={cls._id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                                onClick={() => handleClassClick(cls)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PersonIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                                        <Typography variant="h6" component="div">
                                            {cls.sclassName}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label="View Attendance" 
                                        color="primary" 
                                        size="small" 
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );

    // Render Students View (Table with Date Filter)
    const renderStudentsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link 
                    component="button" 
                    color="inherit" 
                    onClick={handleBackToClasses}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Typography color="text.primary">
                    {selectedClass?.sclassName} - Attendance
                </Typography>
            </Breadcrumbs>

            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
                {selectedClass?.sclassName} - Student Attendance
            </Typography>

            {/* Date Filter */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '16px'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button 
                            variant="contained" 
                            onClick={fetchStudentsAndAttendance}
                        >
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Message */}
            {message.text && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: message.type === 'error' ? '#ffebee' : message.type === 'success' ? '#e8f5e9' : '#e3f2fd' }}>
                    <Typography color={message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}>
                        {message.text}
                    </Typography>
                </Paper>
            )}

            {/* Attendance Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Roll No</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Student Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Subject</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">
                                        No students found in this class
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => {
                                const attendance = attendanceData[student._id];
                                const status = attendance?.status || 'Not Marked';
                                
                                return (
                                    <TableRow key={student._id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {student.rollNum || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1">
                                                {student.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={getStatusIcon(status)}
                                                label={status}
                                                color={getStatusColor(status)}
                                                variant={status === 'Not Marked' ? 'outlined' : 'filled'}
                                                size="medium"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {attendance?.subName?.subName || attendance?.subName || '-'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Summary */}
            {students.length > 0 && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1">
                                <strong>Total Students:</strong> {students.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" color="success.main">
                                <strong>Present:</strong> {Object.values(attendanceData).filter(a => a.status === 'Present').length}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" color="error.main">
                                <strong>Absent:</strong> {Object.values(attendanceData).filter(a => a.status === 'Absent').length}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                {selectedClass ? renderStudentsView() : renderClassesView()}
            </Paper>
        </Container>
    );
};

export default ClassAttendance;

