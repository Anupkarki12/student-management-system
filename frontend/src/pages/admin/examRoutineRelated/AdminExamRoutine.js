import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import {
    Box, Typography, Paper, Grid, Container, Button, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, TextField,
    Alert, Breadcrumbs, Link, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar, CircularProgress, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClassIcon from '@mui/icons-material/Class';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

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

const GradientCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
    },
}));

const ClassCard = styled(Card)(({ theme, $selected }) => ({
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

const ExamTypeCard = styled(Card)(({ theme, $selected }) => ({
    borderRadius: '12px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    border: $selected ? '3px solid #1a237e' : '2px solid #e0e0e0',
    background: $selected ? 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)' : 'white',
    textAlign: 'center',
    padding: '16px',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
        borderColor: '#667eea',
    },
}));

const UploadArea = styled(Box)(({ theme }) => ({
    border: '3px dashed #667eea',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        borderColor: '#1a237e',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
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

const ExamRoutine = () => {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [examTypes] = useState(['first', 'second', 'mid', 'preboard', 'final']);
    const [classes, setClasses] = useState([]);
    const [selectedExamType, setSelectedExamType] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [title, setTitle] = useState('');
    const [examDate, setExamDate] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [existingRoutines, setExistingRoutines] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (currentUser?._id) {
            fetchClasses();
            fetchExistingRoutines();
        }
    }, [currentUser?._id]);

    const fetchClasses = async () => {
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${currentUser._id}`);
            if (Array.isArray(result.data)) {
                setClasses(result.data);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setSnackbar({ open: true, message: 'Error loading classes', severity: 'error' });
        }
    };

    const fetchExistingRoutines = async () => {
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/ExamRoutine/Admin/${currentUser._id}`);
            if (Array.isArray(result.data)) {
                setExistingRoutines(result.data);
            }
        } catch (error) {
            console.error('Error fetching exam routines:', error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setSnackbar({ open: true, message: 'Please select a PDF file only', severity: 'error' });
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setSnackbar({ open: true, message: 'File size must be less than 10MB', severity: 'error' });
                return;
            }
            setFile(selectedFile);
            setSnackbar({ open: true, message: `File selected: ${selectedFile.name}`, severity: 'success' });
        }
    };

    const handleSubmit = async () => {
        if (!selectedExamType) {
            setSnackbar({ open: true, message: 'Please select exam type', severity: 'error' });
            return;
        }
        if (!selectedClass) {
            setSnackbar({ open: true, message: 'Please select a class', severity: 'error' });
            return;
        }
        if (!file) {
            setSnackbar({ open: true, message: 'Please upload a PDF file', severity: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('school', currentUser._id);
        formData.append('classId', selectedClass._id);
        formData.append('examType', selectedExamType);
        formData.append('examDate', examDate);
        formData.append('title', title || `${selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)} Exam Routine`);
        formData.append('file', file);

        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/ExamRoutine/Create`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSnackbar({ open: true, message: 'Exam routine uploaded successfully!', severity: 'success' });
            setSelectedClass(null);
            setSelectedExamType('');
            setTitle('');
            setExamDate('');
            setFile(null);
            fetchExistingRoutines();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.error || 'Error uploading exam routine', severity: 'error' });
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam routine?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/ExamRoutine/${id}`);
            setSnackbar({ open: true, message: 'Exam routine deleted successfully!', severity: 'success' });
            fetchExistingRoutines();
        } catch (error) {
            setSnackbar({ open: true, message: 'Error deleting exam routine', severity: 'error' });
        }
    };

    const handleClassClick = (cls) => {
        setSelectedClass(cls);
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
            first: '#4caf50',
            second: '#2196f3',
            mid: '#ff9800',
            preboard: '#9c27b0',
            final: '#f44336'
        };
        return colors[type] || '#757575';
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleBackToDashboard = () => {
        navigate("/Admin/dashboard");
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
            <Container maxWidth="xl">
                {/* Gradient Header */}
                <GradientHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                            <CalendarTodayIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Exam Routine Management
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        Upload and manage exam schedules for different classes
                    </Typography>
                    <Breadcrumbs sx={{ color: 'white' }}>
                        <Link 
                            color="inherit" 
                            onClick={handleBackToDashboard}
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', '&:hover': { textDecoration: 'underline' } }}
                        >
                            <SchoolIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Admin Dashboard
                        </Link>
                        <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventNoteIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Exam Routine
                        </Typography>
                    </Breadcrumbs>
                </GradientHeader>

                {/* Stats Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                {existingRoutines.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Routines
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {classes.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Available Classes
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                                {examTypes.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Exam Types
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                                )}
                                <Typography variant="h6" color="textSecondary">
                                    {loading ? 'Processing...' : 'Ready'}
                                </Typography>
                            </Box>
                        </StatsCard>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Exam Type Selection */}
                    <Grid item xs={12} md={4}>
                        <GlassCard sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3, display: 'flex', alignItems: 'center' }}>
                                <EventNoteIcon sx={{ mr: 1 }} />
                                1. Select Exam Type
                            </Typography>
                            <Grid container spacing={2}>
                                {examTypes.map((type) => (
                                    <Grid item xs={6} key={type}>
                                        <ExamTypeCard 
                                            $selected={selectedExamType === type}
                                            onClick={() => setSelectedExamType(type)}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {getExamTypeLabel(type)}
                                            </Typography>
                                        </ExamTypeCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </GlassCard>
                    </Grid>

                    {/* Class Selection */}
                    <Grid item xs={12} md={8}>
                        <GlassCard sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3, display: 'flex', alignItems: 'center' }}>
                                <ClassIcon sx={{ mr: 1 }} />
                                2. Select Class
                            </Typography>
                            {classes.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <SchoolIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                                    <Typography variant="h6" color="textSecondary">
                                        No classes found
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {classes.map((cls) => (
                                        <Grid item xs={6} sm={4} md={3} key={cls._id}>
                                            <ClassCard 
                                                $selected={selectedClass?._id === cls._id}
                                                onClick={() => handleClassClick(cls)}
                                            >
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                                                    <Avatar sx={{ width: 50, height: 50, bgcolor: selectedClass?._id === cls._id ? '#667eea' : '#e0e0e0', mx: 'auto', mb: 1 }}>
                                                        <SchoolIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                        Class {cls.sclassName}
                                                    </Typography>
                                                </CardContent>
                                            </ClassCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </GlassCard>
                    </Grid>

                    {/* Upload Section */}
                    {selectedClass && (
                        <Grid item xs={12}>
                            <GlassCard sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3, display: 'flex', alignItems: 'center' }}>
                                    <UploadFileIcon sx={{ mr: 1 }} />
                                    3. Upload Exam Routine for Class {selectedClass.sclassName}
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Title (optional)"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={`${getExamTypeLabel(selectedExamType)} Routine`}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Exam Start Date"
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <UploadArea>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload">
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <UploadFileIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                                                    <Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
                                                        {file ? 'Change File' : 'Click to Upload PDF'}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Maximum file size: 10MB
                                                    </Typography>
                                                </Box>
                                            </label>
                                        </UploadArea>
                                        {file && (
                                            <Box sx={{ mt: 3, p: 3, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <DescriptionIcon sx={{ color: '#4caf50', mr: 2 }} />
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                {file.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Chip 
                                                        icon={<CheckCircleIcon />} 
                                                        label="File Ready" 
                                                        color="success" 
                                                        size="small" 
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmit}
                                            disabled={loading || !file}
                                            fullWidth
                                            size="large"
                                            sx={{ 
                                                py: 2,
                                                bgcolor: '#1a237e',
                                                '&:hover': { bgcolor: '#0d1b5e' },
                                                borderRadius: 2
                                            }}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                                        >
                                            {loading ? 'Uploading...' : 'Upload Exam Routine'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </GlassCard>
                        </Grid>
                    )}
                </Grid>

                {/* Existing Routines */}
                {existingRoutines.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <GlassCard sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3, display: 'flex', alignItems: 'center' }}>
                                <DescriptionIcon sx={{ mr: 1 }} />
                                Uploaded Exam Routines ({existingRoutines.length})
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Exam Type</TableHeaderCell>
                                            <TableHeaderCell>Class</TableHeaderCell>
                                            <TableHeaderCell>Title</TableHeaderCell>
                                            <TableHeaderCell>Exam Date</TableHeaderCell>
                                            <TableHeaderCell>Uploaded</TableHeaderCell>
                                            <TableHeaderCell>Actions</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {existingRoutines.map((routine) => (
                                            <StyledTableRow key={routine._id}>
                                                <TableCell>
                                                    <Chip 
                                                        label={getExamTypeLabel(routine.examType)}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: getExamTypeColor(routine.examType),
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ width: 30, height: 30, bgcolor: '#667eea', mr: 1 }}>
                                                            <ClassIcon sx={{ fontSize: 18 }} />
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            Class {routine.class?.sclassName || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {routine.title || routine.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 18, mr: 0.5, color: '#667eea' }} />
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
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            color="primary"
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<DescriptionIcon />}
                                                            onClick={() => {
                                                                const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
                                                                const filename = routine.filePath.split(/[/\\]/).pop();
                                                                const encodedFilename = encodeURIComponent(filename);
                                                                window.open(`${baseUrl}/uploads/exam-routines/${encodedFilename}`, '_blank');
                                                            }}
                                                            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b5e' } }}
                                                        >
                                                            View
                                                        </Button>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleDelete(routine._id)}
                                                            sx={{ 
                                                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </StyledTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </GlassCard>
                    </Box>
                )}

                {/* Empty State */}
                {existingRoutines.length === 0 && (
                    <GlassCard sx={{ p: 6, textAlign: 'center', mt: 4 }}>
                        <CalendarTodayIcon sx={{ fontSize: 80, color: '#667eea', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                            No Exam Routines Uploaded Yet
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                            Select an exam type and class above to upload your first exam routine
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                                setSelectedExamType('first');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            Get Started
                        </Button>
                    </GlassCard>
                )}

            </Container>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ 
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExamRoutine;

