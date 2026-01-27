import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, Container, Card, CardContent,
    Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClassIcon from '@mui/icons-material/Class';

const TeacherExamRoutine = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [examRoutines, setExamRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (currentUser?._id) {
            fetchExamRoutines();
        }
    }, [currentUser?._id]);

    const fetchExamRoutines = async () => {
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/ExamRoutine/Teacher/${currentUser._id}`);
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
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

    // Group routines by class
    const routinesByClass = examRoutines.reduce((acc, routine) => {
        const className = routine.class?.sclassName || 'Unknown';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(routine);
        return acc;
    }, {});

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Exam Routines
                </Typography>

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
                            No exam routines found for your classes
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Exam routines uploaded by the admin for your assigned classes will appear here.
                        </Typography>
                    </Paper>
                ) : (
                    Object.entries(routinesByClass).map(([className, routines]) => (
                        <Box key={className} sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ClassIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h5">
                                    Class {className}
                                </Typography>
                            </Box>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Exam Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Uploaded On</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {routines.map((routine) => (
                                            <TableRow key={routine._id} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={getExamTypeLabel(routine.examType)}
                                                        color={getExamTypeColor(routine.examType)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
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
                                                    <Typography variant="body2">
                                                        {new Date(routine.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<DescriptionIcon />}
                                                        onClick={() => handleDownload(routine)}
                                                    >
                                                        View PDF
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    ))
                )}
            </Paper>
        </Container>
    );
};

export default TeacherExamRoutine;

