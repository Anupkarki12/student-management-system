import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
    TextField, Alert, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';

const AllStudentMarks = () => {
    const { currentUser } = useSelector((state) => state.user);

    const [classes, setClasses] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter states
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [examDate, setExamDate] = useState('');

    const schoolId = currentUser?._id;

    // Fetch classes and subjects on component mount
    useEffect(() => {
        if (schoolId) {
            fetchClasses();
            fetchSubjects();
        }
    }, [schoolId]);

    // Fetch marks when filters change
    useEffect(() => {
        if (selectedClass || selectedSubject || examType || examDate) {
            fetchMarks();
        }
    }, [selectedClass, selectedSubject, examType, examDate]);

    const fetchClasses = async () => {
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${schoolId}`);
            if (result.data && result.data.message) {
                setClasses([]);
            } else if (Array.isArray(result.data)) {
                setClasses(result.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/AllSubjects/${schoolId}`);
            if (result.data && result.data.message) {
                setAllSubjects([]);
            } else if (Array.isArray(result.data)) {
                setAllSubjects(result.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchMarks = async () => {
        setLoading(true);
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/Marks/All/${schoolId}?`;
            if (selectedClass) url += `sclassId=${selectedClass}&`;
            if (selectedSubject) url += `subjectId=${selectedSubject}&`;
            if (examType) url += `examType=${examType}&`;
            if (examDate) url += `examDate=${examDate}`;

            const result = await axios.get(url);
            if (result.data && result.data.message) {
                setMarks([]);
                setMessage({ type: 'info', text: result.data.message });
            } else if (Array.isArray(result.data)) {
                setMarks(result.data);
                setMessage({ type: '', text: '' });
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
            setMessage({ type: 'error', text: 'Error loading marks' });
        }
        setLoading(false);
    };

    const clearFilters = () => {
        setSelectedClass('');
        setSelectedSubject('');
        setExamType('');
        setExamDate('');
        setMarks([]);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 80) return 'primary';
        if (percentage >= 70) return 'info';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    // Get filtered subjects based on selected class
    const getFilteredSubjects = () => {
        if (!selectedClass) return allSubjects;
        return allSubjects.filter(sub => 
            sub.sclassName?._id === selectedClass || sub.sclassName === selectedClass
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        All Student Marks
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </Box>

                {/* Message Alert */}
                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                {/* Filter Section */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filters
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    value={selectedClass}
                                    label="Class"
                                    onChange={(e) => {
                                        setSelectedClass(e.target.value);
                                        setSelectedSubject('');
                                    }}
                                >
                                    <MenuItem value="">All Classes</MenuItem>
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
                                >
                                    <MenuItem value="">All Subjects</MenuItem>
                                    {getFilteredSubjects().map((sub) => (
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
                                    <MenuItem value="">All Exam Types</MenuItem>
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
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Marks Table */}
                {marks.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Roll No</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Marks</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {marks.map((mark) => {
                                    const percentage = mark.maxMarks > 0 
                                        ? ((mark.marksObtained / mark.maxMarks) * 100).toFixed(1) 
                                        : 0;
                                    return (
                                        <TableRow key={mark._id} hover>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(mark.examDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {mark.sclass?.sclassName || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {mark.subject?.subName || '-'}
                                                </Typography>
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
                                                <Typography variant="body2" fontWeight="medium">
                                                    {mark.student?.rollNum || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1">
                                                    {mark.student?.name || 'Unknown'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {mark.teacher?.name || '-'}
                                                </Typography>
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
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            No Marks Found
                        </Typography>
                        <Typography color="textSecondary">
                            Apply filters to search for marks or wait for teachers to enter marks
                        </Typography>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
};

export default AllStudentMarks;

