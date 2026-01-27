import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, Container, Button, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, TextField,
    Alert, Breadcrumbs, Link, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClassIcon from '@mui/icons-material/Class';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const AdminExamRoutine = () => {
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
                setMessage({ type: 'error', text: 'Please select a PDF file only' });
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size must be less than 10MB' });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!selectedExamType) {
            setMessage({ type: 'error', text: 'Please select exam type' });
            return;
        }
        if (!selectedClass) {
            setMessage({ type: 'error', text: 'Please select a class' });
            return;
        }
        if (!file) {
            setMessage({ type: 'error', text: 'Please upload a PDF file' });
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
            setMessage({ type: 'success', text: 'Exam routine uploaded successfully!' });
            setSelectedClass(null);
            setSelectedExamType('');
            setTitle('');
            setExamDate('');
            setFile(null);
            fetchExistingRoutines();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error uploading exam routine' });
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this exam routine?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/ExamRoutine/${id}`);
            setMessage({ type: 'success', text: 'Exam routine deleted successfully!' });
            fetchExistingRoutines();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error deleting exam routine' });
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

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Breadcrumbs sx={{ mb: 2 }}>
                    <Link component="button" color="inherit" onClick={() => navigate("/Admin/dashboard")}>
                        Admin Dashboard
                    </Link>
                    <Typography color="text.primary">Exam Routine</Typography>
                </Breadcrumbs>

                <Typography variant="h4" gutterBottom>
                    Exam Routine Management
                </Typography>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                        {message.text}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Exam Type Selection */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6" gutterBottom>
                                1. Select Exam Type
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Exam Type</InputLabel>
                                <Select
                                    value={selectedExamType}
                                    label="Exam Type"
                                    onChange={(e) => setSelectedExamType(e.target.value)}
                                >
                                    {examTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {getExamTypeLabel(type)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>
                    </Grid>

                    {/* Class Selection */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6" gutterBottom>
                                2. Select Class
                            </Typography>
                            {classes.length === 0 ? (
                                <Typography color="textSecondary">No classes found</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {classes.map((cls) => (
                                        <Grid item xs={6} sm={4} md={3} key={cls._id}>
                                            <Card
                                                sx={{
                                                    cursor: 'pointer',
                                                    bgcolor: selectedClass?._id === cls._id ? 'primary.main' : 'background.paper',
                                                    color: selectedClass?._id === cls._id ? 'white' : 'inherit',
                                                    '&:hover': {
                                                        bgcolor: selectedClass?._id === cls._id ? 'primary.dark' : 'action.hover'
                                                    }
                                                }}
                                                onClick={() => handleClassClick(cls)}
                                            >
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <ClassIcon sx={{ mr: 1 }} />
                                                        <Typography variant="body1" fontWeight="medium">
                                                            Class {cls.sclassName}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>
                    </Grid>

                    {/* Upload Section */}
                    {selectedClass && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, bgcolor: '#e3f2fd' }}>
                                <Typography variant="h6" gutterBottom>
                                    3. Upload Exam Routine for Class {selectedClass.sclassName}
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Title (optional)"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={`${getExamTypeLabel(selectedExamType)} Routine`}
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
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadFileIcon />}
                                            fullWidth
                                            sx={{ py: 2 }}
                                        >
                                            Choose PDF File
                                            <input
                                                type="file"
                                                hidden
                                                accept="application/pdf"
                                                onChange={handleFileChange}
                                            />
                                        </Button>
                                        {file && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                                <Typography variant="body2">
                                                    <strong>Selected file:</strong> {file.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
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
                                            sx={{ py: 2 }}
                                        >
                                            {loading ? 'Uploading...' : 'Upload Exam Routine'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    )}
                </Grid>

                {/* Existing Routines */}
                {existingRoutines.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Uploaded Exam Routines
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Exam Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Exam Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {existingRoutines.map((routine) => (
                                        <TableRow key={routine._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {getExamTypeLabel(routine.examType)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    Class {routine.class?.sclassName || 'N/A'}
                                                </Typography>
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
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<DescriptionIcon />}
                                                    onClick={() => {
                                                        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
                                                        // Extract filename and encode it properly for URLs with special characters (spaces, etc.)
                                                        const filename = routine.filePath.split(/[/\\]/).pop();
                                                        const encodedFilename = encodeURIComponent(filename);
                                                        window.open(`${baseUrl}/uploads/exam-routines/${encodedFilename}`, '_blank');
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDelete(routine._id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default AdminExamRoutine;

