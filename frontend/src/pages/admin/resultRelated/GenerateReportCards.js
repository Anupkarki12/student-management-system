import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions,
    Button, Chip, Avatar, Breadcrumbs, Link, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, Tabs, Tab, Alert, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PrintIcon from '@mui/icons-material/Print';
import ArchiveIcon from '@mui/icons-material/Archive';
import DescriptionIcon from '@mui/icons-material/Description';
import GradeIcon from '@mui/icons-material/Grade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';

import ReportCardTemplate from '../../../components/ReportCardTemplate';

// Styled components
const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
}));

const GradientCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px',
}));

const StudentCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    border: '2px solid #e0e0e0',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
        borderColor: '#667eea',
    },
}));

// Helper function to calculate grade
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
};

// Helper function to get grade color
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

const GenerateReportCards = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);

    const [tabValue, setTabValue] = useState(0);
    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'students', 'report'
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reportCardData, setReportCardData] = useState(null);
    const [classReportData, setClassReportData] = useState(null);

    // Filters
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [examTypeFilter, setExamTypeFilter] = useState('all');

    // Dialogs
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const schoolId = currentUser?._id;
    const examTypes = ['First Terminal', 'Second Terminal', 'Mid-Terminal', 'Annual', 'Test'];

    // Get available years
    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push(i.toString());
        }
        return years;
    };

    // Fetch classes on mount
    useEffect(() => {
        if (schoolId) {
            fetchClasses();
        }
    }, [schoolId]);

    // Fetch students when class is selected
    useEffect(() => {
        if (selectedClass && viewMode === 'students') {
            fetchStudents(selectedClass._id);
        }
    }, [selectedClass, viewMode]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${schoolId}`);
            if (result.data && result.data.message) {
                setClasses([]);
            } else if (Array.isArray(result.data)) {
                setClasses(result.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setSnackbar({ open: true, message: 'Error loading classes', severity: 'error' });
        }
        setLoading(false);
    };

    const fetchStudents = async (classId) => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${classId}`);
            if (result.data && result.data.message) {
                setStudents([]);
            } else if (Array.isArray(result.data)) {
                setStudents(result.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setSnackbar({ open: true, message: 'Error loading students', severity: 'error' });
        }
        setLoading(false);
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setViewMode('students');
    };

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setLoading(true);
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/ReportCard/Student/${student._id}`;
            if (examTypeFilter !== 'all') {
                url += `?examType=${encodeURIComponent(examTypeFilter)}`;
            }
            if (yearFilter !== 'all') {
                url += url.includes('?') ? '&' : '?';
                url += `year=${yearFilter}`;
            }

            const result = await axios.get(url);
            if (result.data && result.data.status === 'generated') {
                setReportCardData(result.data);
                setReportDialogOpen(true);
            } else {
                setSnackbar({ open: true, message: 'No results found for this student', severity: 'warning' });
            }
        } catch (error) {
            console.error('Error generating report card:', error);
            setSnackbar({ open: true, message: 'Error generating report card', severity: 'error' });
        }
        setLoading(false);
    };

    const handleGenerateClassReportCards = async (cls) => {
        setSelectedClass(cls);
        setLoading(true);
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/ReportCard/Class/${cls._id}`;
            if (examTypeFilter !== 'all') {
                url += `?examType=${encodeURIComponent(examTypeFilter)}`;
            }
            if (yearFilter !== 'all') {
                url += url.includes('?') ? '&' : '?';
                url += `year=${yearFilter}`;
            }

            const result = await axios.get(url);
            setClassReportData(result.data);
            setViewMode('class-reports');
        } catch (error) {
            console.error('Error generating class report cards:', error);
            setSnackbar({ open: true, message: 'Error generating class reports', severity: 'error' });
        }
        setLoading(false);
    };

    const handleArchiveResults = async (studentId, studentName) => {
        setLoading(true);
        try {
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Results/Archive/${studentId}`, {
                examType: examTypeFilter !== 'all' ? examTypeFilter : undefined,
                year: yearFilter !== 'all' ? yearFilter : undefined,
                description: `Archived results for ${examTypeFilter !== 'all' ? examTypeFilter : 'all exams'} - ${yearFilter !== 'all' ? yearFilter : 'current year'}`
            });

            if (result.data.message) {
                setSnackbar({ 
                    open: true, 
                    message: `Results archived successfully for ${studentName}`, 
                    severity: 'success' 
                });
            }
        } catch (error) {
            console.error('Error archiving results:', error);
            setSnackbar({ open: true, message: 'Error archiving results', severity: 'error' });
        }
        setLoading(false);
    };

    const handleBack = () => {
        if (viewMode === 'class-reports') {
            setViewMode('students');
            setClassReportData(null);
        } else if (viewMode === 'students') {
            setViewMode('classes');
            setSelectedClass(null);
            setStudents([]);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Render classes view
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
                        Add classes to generate report cards
                    </Typography>
                </GlassCard>
            ) : (
                <Grid container spacing={3}>
                    {classes.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} key={cls._id}>
                            <GradientCard>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Avatar sx={{ width: 70, height: 70, bgcolor: 'rgba(255,255,255,0.3)', mb: 2, mx: 'auto' }}>
                                        <SchoolIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                        Class {cls.sclassName}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                                    <Button
                                        size="small"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                                        variant="outlined"
                                        onClick={() => handleClassClick(cls)}
                                        startIcon={<DescriptionIcon />}
                                    >
                                        View Students
                                    </Button>
                                    <Button
                                        size="small"
                                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                                        variant="contained"
                                        onClick={() => handleGenerateClassReportCards(cls)}
                                        startIcon={<PrintIcon />}
                                    >
                                        Generate All
                                    </Button>
                                </CardActions>
                            </GradientCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Render students view
    const renderStudentsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); handleBack(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Typography color="text.primary">Students - Class {selectedClass?.sclassName}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 4 }}>
                Students - Class {selectedClass?.sclassName}
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : students.length === 0 ? (
                <GlassCard sx={{ p: 6, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                        No Students Found
                    </Typography>
                </GlassCard>
            ) : (
                <Grid container spacing={3}>
                    {students.map((student) => (
                        <Grid item xs={12} sm={6} md={4} key={student._id}>
                            <StudentCard onClick={() => handleStudentClick(student)}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ width: 55, height: 55, bgcolor: '#667eea', mr: 2 }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
                                                {student.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Roll No: {student.rollNum}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip 
                                            icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                                            label="Report Card" 
                                            size="small"
                                            color="primary"
                                        />
                                        <Chip 
                                            icon={<ArchiveIcon sx={{ fontSize: 16 }} />}
                                            label="Archive" 
                                            size="small"
                                            color="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleArchiveResults(student._id, student.name);
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </StudentCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Render class reports view
    const renderClassReportsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); handleBack(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); handleBack(); }} sx={{ display: 'flex', alignItems: 'center' }}>
                    Students
                </Link>
                <Typography color="text.primary">Class Reports</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Class Report Cards - {selectedClass?.sclassName}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ bgcolor: '#1a237e' }}
                >
                    Print All
                </Button>
            </Box>

            {classReportData && classReportData.classStats && (
                <GlassCard sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Class Statistics
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">Total Students</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{classReportData.classStats.totalStudents}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">With Results</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{classReportData.classStats.studentsWithMarks}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">Average %</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{classReportData.classStats.averagePercentage}%</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">Pass Rate</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: parseFloat(classReportData.classStats.passRate) >= 50 ? '#2e7d32' : '#d32f2f' }}>
                                {classReportData.classStats.passRate}%
                            </Typography>
                        </Grid>
                    </Grid>
                </GlassCard>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {classReportData?.reportCards?.filter(r => r.status === 'generated').map((report, index) => (
                        <Grid item xs={12} key={report.student.id}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: '#667eea' }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {report.student.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Roll No: {report.student.rollNum}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Chip 
                                            label={`${report.marks.percentage}%`}
                                            sx={{ 
                                                bgcolor: getGradeColor(report.marks.grade),
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem'
                                            }}
                                        />
                                        <Chip 
                                            label={report.marks.grade}
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        <Chip 
                                            icon={report.marks.passed ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={report.marks.passed ? 'PASS' : 'FAIL'}
                                            color={report.marks.passed ? 'success' : 'error'}
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        <GradeIcon sx={{ verticalAlign: 'middle', mr: 2, fontSize: 40 }} />
                        Generate Report Cards
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Create and manage student academic report cards
                    </Typography>
                </Box>

                {/* Filters */}
                <GlassCard sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>
                                    <EventIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
                                    Year
                                </InputLabel>
                                <Select
                                    value={yearFilter}
                                    label="Year"
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Years</MenuItem>
                                    {getAvailableYears().map(year => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>
                                    <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
                                    Exam Type
                                </InputLabel>
                                <Select
                                    value={examTypeFilter}
                                    label="Exam Type"
                                    onChange={(e) => setExamTypeFilter(e.target.value)}
                                >
                                    <MenuItem value="all">All Exams</MenuItem>
                                    {examTypes.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button 
                                variant="outlined" 
                                fullWidth
                                onClick={() => {
                                    setYearFilter(new Date().getFullYear().toString());
                                    setExamTypeFilter('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </GlassCard>

                {/* Main Content */}
                {viewMode === 'classes' && renderClassesView()}
                {viewMode === 'students' && renderStudentsView()}
                {viewMode === 'class-reports' && renderClassReportsView()}
            </Container>

            {/* Report Card Dialog */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Student Report Card</Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            sx={{ bgcolor: 'white', color: '#1a237e' }}
                        >
                            Print
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <ReportCardTemplate reportCard={reportCardData} />
                </DialogContent>
                <DialogActions sx={{ bgcolor: '#f5f5f5' }}>
                    <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
                    <Button 
                        variant="contained"
                        startIcon={<ArchiveIcon />}
                        onClick={() => {
                            handleArchiveResults(selectedStudent._id, selectedStudent.name);
                            setReportDialogOpen(false);
                        }}
                    >
                        Archive Results
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GenerateReportCards;

