import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Container, Card, CardContent,
    Grid, Chip, Button, IconButton, Collapse
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const StudentNotes = () => {
    const { currentUser } = useSelector((state) => state.user);
    
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedSubjects, setExpandedSubjects] = useState({});

    const studentClassId = currentUser?.sclassName?._id;

    useEffect(() => {
        if (studentClassId) {
            fetchNotes();
        }
    }, [studentClassId]);

    const fetchNotes = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Notes/Student/${studentClassId}`);
            
            if (result.data && result.data.message) {
                setNotes([]);
                setMessage({ type: 'info', text: 'No notes available for your class yet' });
            } else if (result.data && result.data.length > 0) {
                setNotes(result.data);
                // Expand first subject by default
                const subjects = getSubjectsByGrouping(result.data);
                if (Object.keys(subjects).length > 0) {
                    const firstSubject = Object.keys(subjects)[0];
                    setExpandedSubjects({ [firstSubject]: true });
                }
            } else {
                setNotes([]);
                setMessage({ type: 'info', text: 'No notes found' });
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setMessage({ type: 'error', text: 'Error loading notes' });
        }
        setLoading(false);
    };

    const handleDownload = (note) => {
        const link = note.filePath;
        if (link) {
            const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const fullUrl = `${baseUrl}/${link}`;
            window.open(fullUrl, '_blank');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return 'PDF';
        if (fileType?.includes('word') || fileType?.includes('document')) return 'DOC';
        if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'PPT';
        return 'FILE';
    };

    // Group notes by subject
    const getSubjectsByGrouping = (notesList) => {
        const grouped = {};
        notesList.forEach(note => {
            const subjectName = note.subject?.subName || 'General';
            if (!grouped[subjectName]) {
                grouped[subjectName] = [];
            }
            grouped[subjectName].push(note);
        });
        return grouped;
    };

    const handleExpandSubject = (subjectName) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [subjectName]: !prev[subjectName]
        }));
    };

    const expandedCount = Object.keys(expandedSubjects).filter(key => expandedSubjects[key]).length;
    const groupedNotes = getSubjectsByGrouping(notes);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NoteIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
                        <Typography variant="h5" component="h1">
                            My Notes
                        </Typography>
                    </Box>
                    <Button 
                        variant="outlined" 
                        onClick={fetchNotes}
                        size="small"
                    >
                        Refresh
                    </Button>
                </Box>

                {message.text && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: message.type === 'error' ? '#ffebee' : message.type === 'success' ? '#e8f5e9' : '#e3f2fd' }}>
                        <Typography color={message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}>
                            {message.text}
                        </Typography>
                    </Paper>
                )}

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    {notes.length} notes available • {Object.keys(groupedNotes).length} subjects
                </Typography>

                {loading ? (
                    <Typography align="center" sx={{ py: 4 }}>Loading...</Typography>
                ) : notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <NoteIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary" variant="h6">
                            No Notes Available
                        </Typography>
                        <Typography color="textSecondary">
                            Your teachers haven't uploaded any notes for your class yet.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {Object.entries(groupedNotes).map(([subjectName, subjectNotes]) => (
                            <Grid item xs={12} key={subjectName}>
                                <Card 
                                    sx={{ 
                                        borderLeft: '4px solid',
                                        borderLeftColor: '#1976d2'
                                    }}
                                >
                                    <CardContent>
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: '#f5f5f5' },
                                                p: 1,
                                                borderRadius: 1,
                                                ml: -1,
                                                mr: -1,
                                                mt: -1,
                                                mb: 1
                                            }}
                                            onClick={() => handleExpandSubject(subjectName)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Chip 
                                                    label={subjectName}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ mr: 2 }}
                                                />
                                                <Typography variant="subtitle1">
                                                    {subjectNotes.length} note{subjectNotes.length !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small">
                                                {expandedSubjects[subjectName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedSubjects[subjectName]}>
                                            <Grid container spacing={2}>
                                                {subjectNotes.map((note) => (
                                                    <Grid item xs={12} md={6} key={note._id}>
                                                        <Paper 
                                                            variant="outlined" 
                                                            sx={{ p: 2, bgcolor: '#fafafa' }}
                                                        >
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Chip 
                                                                        label={getFileIcon(note.fileType)}
                                                                        size="small"
                                                                        color="secondary"
                                                                        variant="outlined"
                                                                        sx={{ mr: 1 }}
                                                                    />
                                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                                        {note.title}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton 
                                                                    color="primary" 
                                                                    size="small"
                                                                    onClick={() => handleDownload(note)}
                                                                    title="Download"
                                                                >
                                                                    <DownloadIcon />
                                                                </IconButton>
                                                            </Box>

                                                            <Typography 
                                                                variant="body2" 
                                                                color="textSecondary"
                                                                sx={{ 
                                                                    mb: 2,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}
                                                            >
                                                                {note.description}
                                                            </Typography>

                                                            <Grid container spacing={1}>
                                                                <Grid item xs={6}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            {note.teacher?.name || 'Teacher'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        <strong>Subject:</strong> {note.subject?.subName || 'General'}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        {formatDate(note.createdAt)} • {formatFileSize(note.fileSize)}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>

                                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                                                File: {note.fileName}
                                                            </Typography>
                                                        </Paper>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>
        </Container>
    );
};

export default StudentNotes;

