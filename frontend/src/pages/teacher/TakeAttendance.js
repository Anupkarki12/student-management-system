import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Typography, Paper, Grid, Container, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
    TextField, Alert, LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

const TakeAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const teacherId = currentUser?._id;
    const schoolId = currentUser?.school?._id;

    // Fetch classes on component mount
    useEffect(() => {
        if (teacherId) {
            fetchTeacherClasses();
        }
    }, [teacherId]);

    // Fetch subjects when class is selected
    useEffect(() => {
        if (teacherId && selectedClass) {
            fetchTeacherSubjects();
        } else {
            setSubjects([]);
            setSelectedSubject('');
        }
    }, [selectedClass, teacherId]);

    // Fetch students when class and date are selected
    useEffect(() => {
        if (selectedClass && selectedDate) {
            fetchStudents();
        }
    }, [selectedClass, selectedDate]);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            console.log('Fetching classes for teacher:', teacherId);
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Classes/${teacherId}`);
            console.log('Classes API response:', result.data);
            
            if (result.data && result.data.message) {
                setMessage({ type: 'info', text: result.data.message });
                setClasses([]);
            } else if (Array.isArray(result.data)) {
                setClasses(result.data);
                // Auto-select first class if available
                if (result.data.length > 0 && !selectedClass) {
                    setSelectedClass(result.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setMessage({ type: 'error', text: 'Error loading classes' });
        }
        setLoading(false);
    };

    const fetchTeacherSubjects = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Subjects/${teacherId}/${selectedClass}`);
            console.log('Subjects API response:', result.data);
            
            if (result.data && result.data.message) {
                setMessage({ type: 'info', text: result.data.message });
                setSubjects([]);
            } else if (Array.isArray(result.data)) {
                setSubjects(result.data);
                // Auto-select first subject if available
                if (result.data.length > 0 && !selectedSubject) {
                    setSelectedSubject(result.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setMessage({ type: 'error', text: 'Error loading subjects' });
        }
        setLoading(false);
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${selectedClass}`);
            if (result.data && result.data.length > 0) {
                const studentData = result.data.map(student => ({
                    ...student,
                    _id: student._id,
                    name: student.name,
                    rollNum: student.rollNum
                }));
                
                setStudents(studentData);
                
                // Initialize attendance with all present
                const initialAttendance = {};
                studentData.forEach(student => {
                    initialAttendance[student._id] = 'Present';
                });
                setAttendance(initialAttendance);
                setMessage({ type: '', text: '' });
            } else {
                setStudents([]);
                setAttendance({});
                setMessage({ type: 'info', text: 'No students found in this class' });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Error loading students' });
        }
        setLoading(false);
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        if (!selectedSubject) {
            setMessage({ type: 'error', text: 'Please select a subject' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
                studentID: studentId,
                date: selectedDate,
                status: status,
                subName: selectedSubject
            }));

            console.log('Saving attendance records:', attendanceRecords);

            // Save each attendance record
            for (const record of attendanceRecords) {
                const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/StudentAttendance/${record.studentID}`, record);
                console.log('Attendance saved for student:', record.studentID, response.data);
            }

            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({ type: 'error', text: 'Error saving attendance: ' + (error.response?.data?.message || error.message) });
        }
        setSaving(false);
    };

    const getStatusColor = (status) => {
        return status === 'Present' ? 'success' : 'error';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
                    Take Attendance
                </Typography>

                {/* Class, Subject, and Date Selection */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Class"
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSubject('');
                                    setStudents([]);
                                    setAttendance({});
                                }}
                            >
                                {classes.map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={selectedSubject}
                                label="Subject"
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={!selectedClass}
                            >
                                {subjects.map((sub) => (
                                    <MenuItem key={sub._id} value={sub._id}>
                                        {sub.subName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                {/* Loading Indicator */}
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Message */}
                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                {/* Attendance Table */}
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Roll No</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography>Loading students...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography color="textSecondary">
                                            No students found in this class
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student._id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {student.rollNum}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1">
                                                {student.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={attendance[student._id] || 'Present'}
                                                color={getStatusColor(attendance[student._id])}
                                                size="medium"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant={attendance[student._id] === 'Present' ? 'contained' : 'outlined'}
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleAttendanceChange(student._id, 'Present')}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    variant={attendance[student._id] === 'Absent' ? 'contained' : 'outlined'}
                                                    color="error"
                                                    size="small"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => handleAttendanceChange(student._id, 'Absent')}
                                                >
                                                    Absent
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Save Button */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveAttendance}
                        disabled={saving || students.length === 0 || !selectedSubject}
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default TakeAttendance;

