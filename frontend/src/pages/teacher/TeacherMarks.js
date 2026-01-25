import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, TextField, Alert, IconButton,
    FormControl, InputLabel, Select, MenuItem, LinearProgress
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

const TeacherMarks = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [existingMarks, setExistingMarks] = useState({});

    // Selection states
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [maxMarks, setMaxMarks] = useState('100');

    // Marks entry state
    const [studentMarks, setStudentMarks] = useState({});

    // UI states
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

    // Fetch students and existing marks when all selections are made
    useEffect(() => {
        if (selectedClass && selectedSubject && examType && examDate) {
            fetchStudents();
            fetchExistingMarks();
        } else {
            setStudents([]);
            setExistingMarks({});
            setStudentMarks({});
        }
    }, [selectedClass, selectedSubject, examType, examDate]);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Classes/${teacherId}`);
            if (result.data && result.data.message) {
                setMessage({ type: 'info', text: result.data.message });
                setClasses([]);
            } else if (Array.isArray(result.data)) {
                setClasses(result.data);
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
            if (result.data && result.data.message) {
                setMessage({ type: 'info', text: result.data.message });
                setSubjects([]);
            } else if (Array.isArray(result.data)) {
                setSubjects(result.data);
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
            if (result.data && result.data.message) {
                setMessage({ type: 'info', text: result.data.message });
                setStudents([]);
            } else if (Array.isArray(result.data)) {
                // Sort students by roll number
                const sortedStudents = result.data.sort((a, b) =>
                    (a.rollNum || 0) - (b.rollNum || 0)
                );
                setStudents(sortedStudents);

                // Initialize student marks state
                const initialMarks = {};
                sortedStudents.forEach(student => {
                    initialMarks[student._id] = { marksObtained: '', remarks: '' };
                });
                setStudentMarks(initialMarks);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Error loading students' });
        }
        setLoading(false);
    };

    const fetchExistingMarks = async () => {
        try {
            const result = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/Marks/Class/${selectedClass}/${selectedSubject}/${examType}`
            );
            if (result.data && result.data.message) {
                setExistingMarks({});
            } else if (Array.isArray(result.data)) {
                // Create a map of existing marks keyed by student ID
                const marksMap = {};
                result.data.forEach(mark => {
                    const markDate = new Date(mark.examDate).toISOString().split('T')[0];
                    if (markDate === examDate) {
                        marksMap[mark.student?._id] = {
                            marksObtained: mark.marksObtained,
                            remarks: mark.comments || '',
                            maxMarks: mark.maxMarks,
                            _id: mark._id
                        };
                    }
                });
                setExistingMarks(marksMap);

                // Update student marks with existing values
                setStudentMarks(prev => {
                    const updated = { ...prev };
                    Object.keys(marksMap).forEach(studentId => {
                        if (updated[studentId]) {
                            updated[studentId] = {
                                marksObtained: marksMap[studentId].marksObtained.toString(),
                                remarks: marksMap[studentId].remarks
                            };
                        }
                    });
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching existing marks:', error);
        }
    };

    const handleMarksChange = (studentId, field, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedSubject || !examType || !examDate) {
            setMessage({ type: 'error', text: 'Please select class, subject, exam type, and date' });
            return;
        }

        const marksToSave = students.map(student => ({
            studentID: student._id,
            teacherID: teacherId,
            schoolID: schoolId,
            sclassID: selectedClass,
            subjectID: selectedSubject,
            examType: examType,
            examDate: examDate,
            marksObtained: parseFloat(studentMarks[student._id]?.marksObtained) || 0,
            maxMarks: parseFloat(maxMarks),
            comments: studentMarks[student._id]?.remarks || ''
        }));

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/Marks/BulkCreate`, { marksData: marksToSave });
            setMessage({ type: 'success', text: 'Marks saved successfully!' });
            fetchExistingMarks();
        } catch (error) {
            console.error('Error saving marks:', error);
            setMessage({ type: 'error', text: 'Error saving marks' });
        }
        setSaving(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const hasExistingMark = (studentId) => {
        return existingMarks[studentId] !== undefined;
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 80) return 'primary';
        if (percentage >= 70) return 'info';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        <GradeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Enter Marks
                    </Typography>
                </Box>

                {/* Message Alert */}
                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                {/* Selection Filters */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Class"
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSubject('');
                                    setStudents([]);
                                    setExistingMarks({});
                                    setStudentMarks({});
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
                    <Grid item xs={12} sm={6} md={3}>
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
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Exam Type</InputLabel>
                            <Select
                                value={examType}
                                label="Exam Type"
                                onChange={(e) => setExamType(e.target.value)}
                            >
                                <MenuItem value="Test">Test</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Quarterly">Quarterly</MenuItem>
                                <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                                <MenuItem value="Annual">Annual</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Exam Date"
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Max Marks"
                            type="number"
                            value={maxMarks}
                            onChange={(e) => setMaxMarks(e.target.value)}
                        />
                    </Grid>
                </Grid>

                {/* Loading Indicator */}
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                {/* Students Table */}
                {selectedClass && selectedSubject && examType && examDate && (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Roll No</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Student Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Marks Obtained</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Max Marks</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Remarks</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                <Typography color="textSecondary">
                                                    No students found in this class
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((student) => (
                                            <TableRow key={student._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {student.rollNum || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1">
                                                        {student.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={studentMarks[student._id]?.marksObtained || ''}
                                                        onChange={(e) => handleMarksChange(student._id, 'marksObtained', e.target.value)}
                                                        inputProps={{ min: 0, max: maxMarks }}
                                                        sx={{ width: '100px' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {maxMarks}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={studentMarks[student._id]?.remarks || ''}
                                                        onChange={(e) => handleMarksChange(student._id, 'remarks', e.target.value)}
                                                        placeholder="Enter remarks..."
                                                        sx={{ width: '100%' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {hasExistingMark(student._id) ? (
                                                        <Chip label="Saved" color="success" size="small" />
                                                    ) : (
                                                        <Chip label="New" color="default" size="small" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Submit Button */}
                        {students.length > 0 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Submit Marks'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}

                {/* No Selection Message */}
                {!selectedClass && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select a Class
                        </Typography>
                        <Typography color="textSecondary">
                            Choose a class from the dropdown above to start entering marks
                        </Typography>
                    </Paper>
                )}

                {selectedClass && !selectedSubject && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select a Subject
                        </Typography>
                        <Typography color="textSecondary">
                            Choose a subject to view students and enter marks
                        </Typography>
                    </Paper>
                )}

                {selectedClass && selectedSubject && (!examType || !examDate) && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select Exam Details
                        </Typography>
                        <Typography color="textSecondary">
                            Choose exam type and date to continue
                        </Typography>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
};

export default TeacherMarks;

