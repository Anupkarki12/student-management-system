import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box, Typography, Paper, Container, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';

const StudentExamRoutine = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [examRoutines, setExamRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Check both sclassName (object) and sclassId (direct ID) for compatibility
        const classData = currentUser?.sclassName || currentUser?.sclass;
        if (currentUser?._id && classData) {
            const classId = typeof classData === 'object' ? classData._id : classData;
            const schoolId = currentUser.school?._id || currentUser.school;
            if (schoolId && classId) {
                fetchExamRoutines(schoolId, classId);
            }
        } else {
            setLoading(false);
        }
    }, [currentUser?._id, currentUser?.sclassName, currentUser?.sclass, currentUser?.school]);

    const fetchExamRoutines = async (schoolId, classId) => {
        try {
            console.log('Fetching exam routines for school:', schoolId, 'class:', classId);
            const result = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/ExamRoutine/Student/${schoolId}/${classId}`
            );
            if (Array.isArray(result.data)) {
                setExamRoutines(result.data);
            }
        } catch (error) {
            console.error('Error fetching exam routines:', error);
            setMessage({ type: 'error', text: 'Error loading exam routines' });
        }
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getExamTypeLabel = (type) => {
        const labels = {
            first: 'First Terminal',
            second: 'Second Terminal',
            mid: 'Mid Term',
            preboard: 'Pre-Board',
            final: 'Final'
        };
        return labels[type] || type;
    };

    const getExamTypeColor = (type) => {
        const colors = {
            first: 'primary',
            second: 'secondary',
            mid: 'info',
            preboard: 'warning',
            final: 'error'
        };
        return colors[type] || 'default';
    };

    // Helper function to get proper file URL from filePath
    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
        
        // Extract filename from path
        let filename;
        if (filePath.includes('C:/') || filePath.includes('C:\\')) {
            // Handle absolute Windows paths (old format)
            filename = filePath.split(/[/\\]/).pop();
        } else {
            // Handle relative paths - extract just the filename
            filename = filePath.split(/[/\\]/).pop();
        }
        
        // Encode the filename properly to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        
        // Files in exam-routines folder need the exam-routines prefix
        return `${baseUrl}/uploads/exam-routines/${encodedFilename}`;
    };

    // Helper function to handle download
    const handleDownload = (routine) => {
        const fullUrl = getFileUrl(routine.filePath);
        if (fullUrl) {
            const a = document.createElement('a');
            a.href = fullUrl;
            a.download = routine.title || routine.name || 'exam-routine.pdf';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('File path not found. Please contact administrator.');
        }
    };

    // Sort by date (newest first) and filter out past exams
    const sortedRoutines = examRoutines
        .filter(routine => {
            if (!routine.examDate) return true;
            return new Date(routine.examDate) >= new Date(new Date().setHours(0, 0, 0, 0));
        })
        .sort((a, b) => {
            if (!a.examDate) return 1;
            if (!b.examDate) return -1;
            return new Date(b.examDate) - new Date(a.examDate);
        });

    // Check if there are past exams to show separately
    const pastRoutines = examRoutines
        .filter(routine => routine.examDate && new Date(routine.examDate) < new Date(new Date().setHours(0, 0, 0, 0)));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EventIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4">
                        Exam Routines
                    </Typography>
                </Box>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <Typography>Loading...</Typography>
                    </Box>
                ) : examRoutines.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            No exam routines available
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Exam routines for your class will appear here when uploaded by the administration.
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        {/* Upcoming Exams */}
                        {sortedRoutines.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                                    Upcoming Exams
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedRoutines.map((routine) => (
                                                <TableRow key={routine._id} hover>
                                                    <TableCell>
                                                        <Chip
                                                            label={getExamTypeLabel(routine.examType)}
                                                            color={getExamTypeColor(routine.examType)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {routine.title || routine.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, color: 'textSecondary' }} />
                                                            <Typography variant="body2">
                                                                {formatDate(routine.examDate)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<DescriptionIcon />}
                                                            onClick={() => handleDownload(routine)}
                                                        >
                                                            View Routine
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {/* Past Exams */}
                        {pastRoutines.length > 0 && (
                            <Box>
                                <Typography variant="h5" gutterBottom sx={{ color: 'textSecondary' }}>
                                    Past Exams
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ opacity: 0.7 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Exam Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pastRoutines.map((routine) => (
                                                <TableRow key={routine._id} hover sx={{ bgcolor: '#fafafa' }}>
                                                    <TableCell>
                                                        <Chip
                                                            label={getExamTypeLabel(routine.examType)}
                                                            color={getExamTypeColor(routine.examType)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {routine.title || routine.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formatDate(routine.examDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<DescriptionIcon />}
                                                            onClick={() => handleDownload(routine)}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default StudentExamRoutine;

