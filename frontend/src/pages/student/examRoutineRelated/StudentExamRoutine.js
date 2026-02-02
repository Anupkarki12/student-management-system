import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Box, Typography, Container, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Button, Avatar, Grid, Card, CardContent
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StudentExamRoutine = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [examRoutines, setExamRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
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
            const result = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/ExamRoutine/Student/${schoolId}/${classId}`
            );
            if (Array.isArray(result.data)) {
                setExamRoutines(result.data);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error loading exam routines' });
        }
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            first: { bg: '#e3f2fd', color: '#1976d2' },
            second: { bg: '#f3e5f5', color: '#7b1fa2' },
            mid: { bg: '#e8f5e9', color: '#2e7d32' },
            preboard: { bg: '#fff3e0', color: '#f57c00' },
            final: { bg: '#ffebee', color: '#c62828' }
        };
        return colors[type] || { bg: '#f5f5f5', color: '#666' };
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
        let filename;
        if (filePath.includes('C:/') || filePath.includes('C:\\')) {
            filename = filePath.split(/[/\\]/).pop();
        } else {
            filename = filePath.split(/[/\\]/).pop();
        }
        const encodedFilename = encodeURIComponent(filename);
        return `${baseUrl}/uploads/exam-routines/${encodedFilename}`;
    };

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

    const pastRoutines = examRoutines
        .filter(routine => routine.examDate && new Date(routine.examDate) < new Date(new Date().setHours(0, 0, 0, 0)));

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center',
                    mb: 4
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <EventIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Exam Routines
                        </Typography>
                    </Box>
                </Box>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6">Loading exam routines...</Typography>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <EventIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Exam Routines
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            View your examination schedules and routines
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}

            {examRoutines.length === 0 ? (
                <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    py: 8
                }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#f5f5f5', mx: 'auto', mb: 2 }}>
                        <EventIcon sx={{ fontSize: 40, color: '#ccc' }} />
                    </Avatar>
                    <Typography variant="h6" color="textSecondary">
                        No exam routines available
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Exam routines for your class will appear here when uploaded by the administration.
                    </Typography>
                </Card>
            ) : (
                <div>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                            }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#e3f2fd', mx: 'auto', mb: 2 }}>
                                        <EventIcon sx={{ color: '#1976d2', fontSize: 30 }} />
                                    </Avatar>
                                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {sortedRoutines.length}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Upcoming Exams
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                            }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: pastRoutines.length > 0 ? '#fff3e0' : '#e8f5e9', mx: 'auto', mb: 2 }}>
                                        <ScheduleIcon sx={{ color: pastRoutines.length > 0 ? '#f57c00' : '#2e7d32', fontSize: 30 }} />
                                    </Avatar>
                                    <Typography variant="h3" sx={{ color: pastRoutines.length > 0 ? '#f57c00' : '#2e7d32', fontWeight: 'bold' }}>
                                        {pastRoutines.length}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Past Exams
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ 
                                borderRadius: 3, 
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                            }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Avatar sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', mx: 'auto', mb: 2 }}>
                                        <DescriptionIcon sx={{ color: '#2e7d32', fontSize: 30 }} />
                                    </Avatar>
                                    <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                        {examRoutines.length}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Total Routines
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {sortedRoutines.length > 0 && (
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            mb: 4
                        }}>
                            <Box sx={{ 
                                p: 3, 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <EventIcon sx={{ fontSize: 32, color: 'white' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    Upcoming Exams
                                </Typography>
                            </Box>
                            
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Exam Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Exam Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedRoutines.map((routine) => {
                                            const colors = getExamTypeColor(routine.examType);
                                            return (
                                                <TableRow 
                                                    key={routine._id}
                                                    sx={{ 
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': { 
                                                            backgroundColor: colors.bg + '40',
                                                            transform: 'scale(1.01)'
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Chip 
                                                            label={getExamTypeLabel(routine.examType)}
                                                            sx={{ 
                                                                fontWeight: 'bold',
                                                                bgcolor: colors.bg,
                                                                color: colors.color,
                                                                border: '2px solid ' + colors.color
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 36, height: 36, bgcolor: colors.bg }}>
                                                                <DescriptionIcon sx={{ color: colors.color, fontSize: 18 }} />
                                                            </Avatar>
                                                            <Typography variant="body1" sx={{ fontWeight: '600' }}>
                                                                {routine.title || routine.name || 'Exam Routine'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#e3f2fd' }}>
                                                                <CalendarTodayIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body1" sx={{ fontWeight: '600' }}>
                                                                    {formatShortDate(routine.examDate)}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {new Date(routine.examDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button 
                                                            variant="contained"
                                                            color="primary"
                                                            size="medium"
                                                            startIcon={<VisibilityIcon />}
                                                            onClick={() => handleDownload(routine)}
                                                            sx={{ 
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            View Routine
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}

                    {pastRoutines.length > 0 && (
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                p: 3, 
                                background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    Past Exams
                                </Typography>
                            </Box>
                            
                            <TableContainer>
                                <Table sx={{ minWidth: 650, opacity: 0.9 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #ccc' }}>Exam Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #ccc' }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #ccc' }}>Exam Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #ccc' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pastRoutines.map((routine) => {
                                            const colors = getExamTypeColor(routine.examType);
                                            return (
                                                <TableRow 
                                                    key={routine._id}
                                                    sx={{ 
                                                        transition: 'all 0.3s ease',
                                                        bgcolor: '#fafafa',
                                                        '&:hover': { 
                                                            backgroundColor: '#f0f0f0',
                                                            transform: 'scale(1.01)'
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Chip 
                                                            label={getExamTypeLabel(routine.examType)}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                            {routine.title || routine.name || 'Exam Routine'}
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
                                                            startIcon={<DownloadIcon />}
                                                            onClick={() => handleDownload(routine)}
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            Download
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    )}
                </div>
            )}
        </Container>
    );
};

export default StudentExamRoutine;

