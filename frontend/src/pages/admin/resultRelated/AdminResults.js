import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Container, Typography, Paper, Grid, Card, CardContent, CardActions,
    Button, Chip, Avatar,  Breadcrumbs, Link, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, LinearProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow,  Stack 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GradeIcon from '@mui/icons-material/Grade';
 import BookIcon from '@mui/icons-material/Book';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
 import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
 
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

const GradientCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)',
    },
}));

const StudentResultCard = styled(Card)(({ theme }) => ({
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

const StatsCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    },
}));

const ResultRow = styled(TableRow)(({ theme }) => ({
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
    },
}));

const AdminResults = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'students', 'results'
    const [printMode, setPrintMode] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentsWithResults, setStudentsWithResults] = useState({});
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentMarks, setStudentMarks] = useState([]);
    const [allClassMarks, setAllClassMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [examTypeFilter, setExamTypeFilter] = useState('all');

    const schoolId = currentUser?._id;

    // Available exam types
    const examTypes = ['First Terminal', 'Second Terminal', 'Mid-Terminal', 'Annual', 'Test'];

    // Get available years from current year to 5 years back
    const getAvailableYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 5; i++) {
            years.push((currentYear - i).toString());
        }
        return years;
    };

    // Fetch classes on component mount
    useEffect(() => {
        if (schoolId && viewMode === 'classes') {
            fetchClasses();
        }
    }, [schoolId, viewMode]);

    // Fetch students and their results when a class is selected
    useEffect(() => {
        if (selectedClass && viewMode === 'students') {
            fetchStudentsWithResults(selectedClass._id);
        }
    }, [selectedClass, viewMode, yearFilter]);

    // Fetch student marks when a student is selected or filters change
    useEffect(() => {
        if (selectedStudent && viewMode === 'results') {
            fetchStudentMarks(selectedStudent._id);
        }
    }, [selectedStudent, viewMode, yearFilter, examTypeFilter]);

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
        }
        setLoading(false);
    };

    const fetchStudentsWithResults = async (classId) => {
        setLoading(true);
        try {
            // Fetch students
            const studentsResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${classId}`);
            if (studentsResult.data && !studentsResult.data.message && Array.isArray(studentsResult.data)) {
                const studentsData = studentsResult.data;
                setStudents(studentsData);

                // Fetch results for each student
                const resultsMap = {};
                for (const student of studentsData) {
                    try {
                        const marksResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Marks/Student/${student._id}`);
                        let marks = [];
                        if (marksResult.data && !marksResult.data.message && Array.isArray(marksResult.data)) {
                            marks = marksResult.data;
                        }
                        
                        // Filter by year if needed
                        if (yearFilter !== 'all') {
                            marks = marks.filter(mark => {
                                const markYear = new Date(mark.examDate).getFullYear().toString();
                                return markYear === yearFilter;
                            });
                        }

                        // Calculate summary
                        const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
                        const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
                        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
                        const grade = calculateGrade(percentage);

                        // Count grades
                        const gradeCounts = {};
                        marks.forEach(m => {
                            gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1;
                        });

                        resultsMap[student._id] = {
                            totalExams: marks.length,
                            totalObtained,
                            totalMax,
                            percentage: percentage.toFixed(1),
                            grade,
                            gradeCounts,
                            hasResults: marks.length > 0
                        };
                    } catch (err) {
                        console.error(`Error fetching marks for student ${student._id}:`, err);
                        resultsMap[student._id] = {
                            totalExams: 0,
                            totalObtained: 0,
                            totalMax: 0,
                            percentage: '0',
                            grade: '-',
                            gradeCounts: {},
                            hasResults: false
                        };
                    }
                }
                setStudentsWithResults(resultsMap);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
        setLoading(false);
    };

    const fetchStudentMarks = async (studentId) => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Marks/Student/${studentId}`);
            if (result.data && result.data.message) {
                setStudentMarks([]);
            } else if (Array.isArray(result.data)) {
                let filteredMarks = result.data;
                
                // Filter by year
                if (yearFilter !== 'all') {
                    filteredMarks = filteredMarks.filter(mark => {
                        const markYear = new Date(mark.examDate).getFullYear().toString();
                        return markYear === yearFilter;
                    });
                }
                
                // Filter by exam type (case-insensitive comparison)
                if (examTypeFilter !== 'all') {
                    filteredMarks = filteredMarks.filter(mark => {
                        return mark.examType && mark.examType.toLowerCase() === examTypeFilter.toLowerCase();
                    });
                }
                
                setStudentMarks(filteredMarks);
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
            setStudentMarks([]);
        }
        setLoading(false);
    };

    // Fetch all marks for a class for printing
    const fetchAllClassMarks = async (classId) => {
        setLoading(true);
        try {
            const studentsResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Sclass/Students/${classId}`);
            if (!studentsResult.data || studentsResult.data.message || !Array.isArray(studentsResult.data)) {
                setAllClassMarks([]);
                setLoading(false);
                return;
            }

            const studentsData = studentsResult.data;
            const allMarks = [];

            for (const student of studentsData) {
                try {
                    const marksResult = await axios.get(`${process.env.REACT_APP_BASE_URL}/Marks/Student/${student._id}`);
                    if (marksResult.data && !marksResult.data.message && Array.isArray(marksResult.data)) {
                        let marks = marksResult.data;
                        
                        // Filter by year if needed
                        if (yearFilter !== 'all') {
                            marks = marks.filter(mark => {
                                const markYear = new Date(mark.examDate).getFullYear().toString();
                                return markYear === yearFilter;
                            });
                        }
                        
                        // Filter by exam type if needed
                        if (examTypeFilter !== 'all') {
                            marks = marks.filter(mark => {
                                return mark.examType && mark.examType.toLowerCase() === examTypeFilter.toLowerCase();
                            });
                        }

                        allMarks.push({
                            student,
                            marks
                        });
                    }
                } catch (err) {
                    console.error(`Error fetching marks for student ${student._id}:`, err);
                }
            }

            setAllClassMarks(allMarks);
        } catch (error) {
            console.error('Error fetching class marks:', error);
            setAllClassMarks([]);
        }
        setLoading(false);
    };

    // Handle print button click
    const handlePrint = () => {
        if (selectedClass) {
            fetchAllClassMarks(selectedClass._id);
            setPrintMode(true);
            // Give time for data to load then print
            setTimeout(() => {
                window.print();
            }, 500);
        }
    };

    // Close print mode
    const handleClosePrint = () => {
        setPrintMode(false);
    };

    const calculateGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        return 'F';
    };

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

    const getGradeColorValue = (percentage) => {
        if (percentage >= 90) return '#2e7d32';
        if (percentage >= 80) return '#1976d2';
        if (percentage >= 70) return '#0288d1';
        if (percentage >= 60) return '#00796b';
        if (percentage >= 50) return '#f57c00';
        return '#d32f2f';
    };

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

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
        setViewMode('students');
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setViewMode('results');
    };

    const handleBack = () => {
        if (viewMode === 'results') {
            setViewMode('students');
            setSelectedStudent(null);
            setStudentMarks([]);
        } else if (viewMode === 'students') {
            setViewMode('classes');
            setSelectedClass(null);
            setStudents([]);
            setStudentsWithResults({});
        }
    };

    // Calculate stats for the selected student
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

    // Helper function to check pass/fail
    const isPass = (percentage) => {
        return parseFloat(percentage) >= 40;
    };

    // Helper function to get all unique subjects
    const getAllSubjects = () => {
        const subjects = new Set();
        allClassMarks.forEach(({ marks }) => {
            marks.forEach(mark => {
                if (mark.subject?.subName) {
                    subjects.add(mark.subject.subName);
                }
            });
        });
        return Array.from(subjects);
    };

    // Render print view
    const renderPrintView = () => {
        const allSubjects = getAllSubjects();
        const schoolName = currentUser?.schoolName || "School Name";
        
        return (
            <Box className="print-view" sx={{ display: printMode ? 'block' : 'none', p: 3 }}>
                {/* Print-specific styles */}
                <style>{`
                    @media print {
                        .print-view {
                            display: block !important;
                            padding: 20px;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .page-break {
                            page-break-after: always;
                        }
                        .page-break-inside {
                            page-break-inside: avoid;
                        }
                    }
                `}</style>

                {/* Print Header with School Name */}
                <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '3px solid #1a237e', pb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', textTransform: 'uppercase', letterSpacing: 2 }}>
                        {schoolName}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#667eea', mt: 1, fontWeight: 'medium' }}>
                        Academic Results Report
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Class: {selectedClass?.sclassName} | 
                        {yearFilter !== 'all' ? ` Year: ${yearFilter}` : ''} | 
                        {examTypeFilter !== 'all' ? ` Exam: ${examTypeFilter}` : ' All Exams'} | 
                        Date: {new Date().toLocaleDateString()}
                    </Typography>
                </Box>

                {/* Class Summary Table */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e', borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                        Class Summary - All Students
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#1a237e' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Roll No</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Student Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Total Exams</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Total Marks</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Percentage</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Grade</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 1.5 }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allClassMarks.map(({ student, marks }) => {
                                    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
                                    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
                                    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
                                    const grade = calculateGrade(percentage);
                                    const passed = isPass(percentage);

                                    return (
                                        <TableRow key={student._id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                                            <TableCell sx={{ py: 1 }}>{student.rollNum}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>{student.name}</TableCell>
                                            <TableCell sx={{ py: 1 }}>{marks.length}</TableCell>
                                            <TableCell sx={{ py: 1 }}>{totalObtained}/{totalMax}</TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Typography
                                                    component="span"
                                                    sx={{
                                                        color: getGradeColorValue(percentage),
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {percentage.toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Chip
                                                    label={grade}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getGradeColor(grade),
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                <Chip
                                                    label={passed ? 'PASS' : 'FAIL'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: passed ? '#4caf50' : '#f44336',
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
                </Box>

                {/* Detailed Results for Each Student */}
                {allClassMarks.map(({ student, marks }, index) => {
                    if (marks.length === 0) return null;
                    
                    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
                    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
                    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
                    const grade = calculateGrade(percentage);
                    const passed = isPass(percentage);

                    return (
                        <Box key={student._id} sx={{ mb: 3 }} className={index < allClassMarks.length - 1 ? 'page-break' : ''}>
                            {/* Student Result Card */}
                            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                {/* Student Header */}
                                <Box sx={{ 
                                    bgcolor: '#1a237e', 
                                    color: 'white', 
                                    p: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 1
                                }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {student.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Roll No: {student.rollNum} | Class: {selectedClass?.sclassName}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: passed ? '#4caf50' : '#f44336' }}>
                                            {percentage.toFixed(1)}%
                                        </Typography>
                                        <Chip
                                            label={passed ? 'PASS' : 'FAIL'}
                                            size="small"
                                            sx={{
                                                bgcolor: passed ? '#4caf50' : '#f44336',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Subject Results Table */}
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }}>Subject</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }}>Exam Type</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }} align="right">Marks Obtained</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }} align="right">Max Marks</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }} align="right">Percentage</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: '2px solid #1a237e' }} align="center">Grade</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {marks.map((mark) => {
                                                const markPercentage = mark.maxMarks > 0
                                                    ? ((mark.marksObtained / mark.maxMarks) * 100)
                                                    : 0;
                                                return (
                                                    <TableRow key={mark._id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                                                        <TableCell sx={{ py: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <BookIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                                                                {mark.subject?.subName || 'N/A'}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1 }}>
                                                            <Chip
                                                                label={mark.examType}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getExamTypeColor(mark.examType),
                                                                    color: 'white',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold', py: 1 }} align="right">{mark.marksObtained}</TableCell>
                                                        <TableCell sx={{ py: 1 }} align="right">{mark.maxMarks}</TableCell>
                                                        <TableCell sx={{ py: 1 }} align="right">
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    color: getGradeColorValue(markPercentage),
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {markPercentage.toFixed(1)}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1 }} align="center">
                                                            <Chip
                                                                label={mark.grade || 'N/A'}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getGradeColor(mark.grade),
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    minWidth: 40
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {/* Total Row */}
                                            <TableRow sx={{ bgcolor: '#e8eaf6' }}>
                                                <TableCell colSpan={2} sx={{ fontWeight: 'bold', py: 1.5 }}>
                                                    TOTAL
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }} align="right">{totalObtained}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }} align="right">{totalMax}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, color: getGradeColorValue(percentage) }} align="right">
                                                    {percentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }} align="center">
                                                    <Chip
                                                        label={grade}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getGradeColor(grade),
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            minWidth: 40
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    );
                })}

                {/* Print Footer */}
                <Box sx={{ 
                    mt: 4, 
                    pt: 2, 
                    borderTop: '2px solid #1a237e',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ textAlign: 'center', width: '40%' }}>
                        <Typography variant="body2" color="textSecondary">
                            ______________________
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Class Teacher Signature
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', width: '20%' }}>
                        <Typography variant="body2" color="textSecondary">
                            {new Date().toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Date
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', width: '40%' }}>
                        <Typography variant="body2" color="textSecondary">
                            ______________________
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Principal Signature
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    // Render classes view
    const renderClassesView = () => (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Select a Class
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                    Choose a class to view student results
                </Typography>
            </Box>

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
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Add classes to start managing results
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/Admin/addclass')}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '25px',
                            px: 4
                        }}
                    >
                        Add Class
                    </Button>
                </GlassCard>
            ) : (
                <Grid container spacing={3}>
                    {classes.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cls._id}>
                            <GradientCard onClick={() => handleClassClick(cls)}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <Avatar
                                        sx={{
                                            width: 70,
                                            height: 70,
                                            bgcolor: 'rgba(255,255,255,0.3)',
                                            mb: 2,
                                            mx: 'auto'
                                        }}
                                    >
                                        <SchoolIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                        Class {cls.sclassName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                        Click to view students
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                    <Button
                                        size="small"
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.1)'
                                            }
                                        }}
                                        variant="outlined"
                                    >
                                        View Students
                                    </Button>
                                </CardActions>
                            </GradientCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Helper function to clear all filters
    const clearFilters = () => {
        setYearFilter(new Date().getFullYear().toString());
        setExamTypeFilter('all');
    };

    // Check if any filters are active
    const hasActiveFilters = yearFilter !== new Date().getFullYear().toString() || examTypeFilter !== 'all';

    // Render students view with results summary
    const renderStudentsView = () => {
        const studentsWithData = students.filter(s => studentsWithResults[s._id]?.hasResults);
        const studentsWithoutData = students.filter(s => !studentsWithResults[s._id]?.hasResults);

        return (
            <Box>
                <Box sx={{ mb: 3 }}>
                    <Breadcrumbs sx={{ mb: 2 }}>
                        <Link
                            color="inherit"
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleBack(); }}
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                            <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                        </Link>
                        <Typography color="text.primary">Students - Class {selectedClass?.sclassName}</Typography>
                    </Breadcrumbs>

                    {/* Filter Section */}
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <FilterListIcon sx={{ mr: 1, color: '#667eea' }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                Filter Results
                            </Typography>
                            {hasActiveFilters && (
                                <Button
                                    size="small"
                                    startIcon={<ClearIcon />}
                                    onClick={clearFilters}
                                    sx={{ ml: 'auto' }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Box>

                        <Grid container spacing={2} alignItems="center">
                            {/* Year Filter */}
                            <Grid item xs={12} sm={6} md={4}>
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

                            {/* Exam Type Filter */}
                            <Grid item xs={12} sm={6} md={4}>
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
                                                            height: 24
                                                        }}
                                                    />
                                                    {type}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Active Filters Display */}
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {yearFilter !== 'all' && (
                                        <Chip
                                            icon={<EventIcon sx={{ fontSize: 16 }} />}
                                            label={`Year: ${yearFilter}`}
                                            onDelete={() => setYearFilter(new Date().getFullYear().toString())}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                    {examTypeFilter !== 'all' && (
                                        <Chip
                                            icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                                            label={`Exam: ${examTypeFilter}`}
                                            onDelete={() => setExamTypeFilter('all')}
                                            color="secondary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </GlassCard>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        Students - Class {selectedClass?.sclassName}
                    </Typography>
                     
                </Box>

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
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                            Add students to this class to view their results
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '25px',
                                px: 4
                            }}
                        >
                            Add Student
                        </Button>
                    </GlassCard>
                ) : (
                    <Grid container spacing={3}>
                        {/* Students with results */}
                        {studentsWithData.map((student) => {
                            const result = studentsWithResults[student._id];
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                                    <StudentResultCard onClick={() => handleStudentClick(student)}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 55,
                                                        height: 55,
                                                        bgcolor: '#667eea',
                                                        mr: 2
                                                    }}
                                                >
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
                                            
                                            <Divider sx={{ my: 2 }} />
                                            
                                            {/* Results Summary */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Total Exams
                                                </Typography>
                                                <Chip 
                                                    label={result.totalExams} 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Percentage
                                                </Typography>
                                                <Chip 
                                                    label={`${result.percentage}%`}
                                                    sx={{ 
                                                        backgroundColor: getGradeColorValue(parseFloat(result.percentage)),
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                    size="small"
                                                />
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Grade
                                                </Typography>
                                                <Chip 
                                                    label={result.grade} 
                                                    sx={{ 
                                                        backgroundColor: getGradeColor(result.grade),
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 40
                                                    }}
                                                    size="small"
                                                />
                                            </Box>
                                        </CardContent>
                                    </StudentResultCard>
                                </Grid>
                            );
                        })}
                        
                        {/* Students without results */}
                        {studentsWithoutData.map((student) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                                <StudentResultCard sx={{ opacity: 0.7 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    width: 55,
                                                    height: 55,
                                                    bgcolor: '#9e9e9e',
                                                    mr: 2
                                                }}
                                            >
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
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                                            <CancelIcon sx={{ color: '#d32f2f', mr: 1 }} />
                                            <Typography variant="body1" color="error">
                                                No Results Found
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </StudentResultCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        );
    };

    // Render results detail view
    const renderResultsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleBack(); }}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Link
                    color="inherit"
                    href="#"
                    onClick={(e) => { e.preventDefault(); setViewMode('students'); }}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    Class {selectedClass?.sclassName}
                </Link>
                <Typography color="text.primary">Results</Typography>
            </Breadcrumbs>

            {/* Student Info Header */}
            <GlassCard sx={{ p: 4, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: '#667eea',
                                    mr: 3
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                                    {selectedStudent?.name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Roll No: {selectedStudent?.rollNum} | Class: {selectedClass?.sclassName}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {/* Filter Section */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterListIcon sx={{ color: '#667eea' }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Filters
                                </Typography>
                                {hasActiveFilters && (
                                    <Chip
                                        label="Clear All"
                                        size="small"
                                        onClick={clearFilters}
                                        deleteIcon={<ClearIcon />}
                                        onDelete={clearFilters}
                                        color="error"
                                        variant="outlined"
                                        sx={{ ml: 'auto' }}
                                    />
                                )}
                            </Box>
                            
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>
                                            <EventIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
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
                                <Grid item xs={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>
                                            <CategoryIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
                                            Exam Type
                                        </InputLabel>
                                        <Select
                                            value={examTypeFilter}
                                            label="Exam Type"
                                            onChange={(e) => setExamTypeFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All Types</MenuItem>
                                            {examTypes.map(type => (
                                                <MenuItem key={type} value={type}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Chip
                                                            size="small"
                                                            sx={{
                                                                mr: 0.5,
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
                                </Grid>
                            </Grid>

                            {/* Active Filter Chips */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {yearFilter !== 'all' && (
                                    <Chip
                                        size="small"
                                        icon={<EventIcon sx={{ fontSize: 14 }} />}
                                        label={yearFilter}
                                        onDelete={() => setYearFilter(new Date().getFullYear().toString())}
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {examTypeFilter !== 'all' && (
                                    <Chip
                                        size="small"
                                        icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                                        label={examTypeFilter}
                                        onDelete={() => setExamTypeFilter('all')}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </GlassCard>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <StatsCard>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Average Marks
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                            {stats.average}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            out of 100
                        </Typography>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Total Marks
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#764ba2' }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            across {studentMarks.length} exams
                        </Typography>
                    </StatsCard>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatsCard>
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
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 5
                                }
                            }}
                        />
                    </StatsCard>
                    
                </Grid>
            </Grid>

            {/* Results Table */}
            <GlassCard sx={{ overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                        <AssessmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Academic Results
                    </Typography>
                </Box>

                {loading ? (
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
                            {yearFilter === 'all'
                                ? 'No exam results have been entered for this student yet'
                                : `No exam results found for ${yearFilter}`}
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
                                    return (
                                        <ResultRow key={mark._id}>
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
                                                                    backgroundColor: getGradeColorValue(percentage),
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
                                                    label={mark.grade || 'N/A'}
                                                    sx={{
                                                        backgroundColor: getGradeColor(mark.grade),
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        minWidth: 50
                                                    }}
                                                />
                                            </TableCell>
                                        </ResultRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </GlassCard>

            {/* Grade Distribution */}
            {studentMarks.length > 0 && (
                <GlassCard sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
                        <AnalyticsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Grade Distribution
                    </Typography>
                    <Grid container spacing={2}>
                        {['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'].map((grade) => {
                            const count = studentMarks.filter(m => m.grade === grade).length;
                            const percentage = studentMarks.length > 0
                                ? (count / studentMarks.length) * 100
                                : 0;
                            return (
                                <Grid item xs={6} sm={3} md={1} key={grade}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                height: 80,
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                justifyContent: 'center',
                                                mb: 1
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 50,
                                                    height: `${Math.max(percentage, count > 0 ? 20 : 0)}px`,
                                                    background: `linear-gradient(180deg, ${getGradeColor(grade)} 0%, ${getGradeColor(grade)}cc 100%)`,
                                                    borderRadius: '8px 8px 0 0',
                                                    transition: 'height 0.3s ease'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" color={getGradeColor(grade)}>
                                            {grade}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {count}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </GlassCard>
            )}
        </Box>
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                py: 4,
                px: { xs: 2, md: 4 }
            }}
        >
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        <GradeIcon sx={{ verticalAlign: 'middle', mr: 2, fontSize: 40 }} />
                        Results Management
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        View and manage student academic results
                    </Typography>
                </Box>

                {/* Main Content */}
                {viewMode === 'classes' && renderClassesView()}
                {viewMode === 'students' && renderStudentsView()}
                {viewMode === 'results' && renderResultsView()}
            </Container>
        </Box>
    );
};

export default AdminResults;

