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
import ClassIcon from '@mui/icons-material/Class';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const AdminNotes = () => {
    const { currentUser } = useSelector((state) => state.user);
    
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedClasses, setExpandedClasses] = useState({});

    const schoolId = currentUser?._id;

    useEffect(() => {
        if (schoolId) {
            fetchNotes();
        }
    }, [schoolId]);

    const fetchNotes = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Notes/School/${schoolId}`);
            
            if (result.data && result.data.message) {
                setNotes([]);
                setMessage({ type: 'info', text: 'No notes have been uploaded by teachers yet' });
            } else if (result.data && result.data.length > 0) {
                setNotes(result.data);
                // Expand first class by default
                const classes = getClassesByGrouping(result.data);
                if (Object.keys(classes).length > 0) {
                    const firstClass = Object.keys(classes)[0];
                    setExpandedClasses({ [firstClass]: true });
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

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/TeacherNote/${noteId}`);
            setMessage({ type: 'success', text: 'Note deleted successfully!' });
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            setMessage({ type: 'error', text: 'Error deleting note' });
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

    // Group notes by class
    const getClassesByGrouping = (notesList) => {
        const grouped = {};
        notesList.forEach(note => {
            const className = note.sclass?.sclassName || 'Unknown Class';
            if (!grouped[className]) {
                grouped[className] = [];
            }
            grouped[className].push(note);
        });
        return grouped;
    };

    const handleExpandClass = (className) => {
        setExpandedClasses(prev => ({
            ...prev,
            [className]: !prev[className]
        }));
    };

    const groupedNotes = getClassesByGrouping(notes);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NoteIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
                        <Typography variant="h5" component="h1">
                            All Teacher Notes
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
                    {notes.length} notes total • {Object.keys(groupedNotes).length} classes
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
                            Teachers haven't uploaded any notes yet.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {Object.entries(groupedNotes).map(([className, classNotes]) => (
                            <Grid item xs={12} key={className}>
                                <Card 
                                    sx={{ 
                                        borderLeft: '4px solid',
                                        borderLeftColor: '#2e7d32'
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
                                            onClick={() => handleExpandClass(className)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Chip 
                                                    label={`Class ${className}`}
                                                    color="success"
                                                    size="small"
                                                    sx={{ mr: 2 }}
                                                />
                                                <Typography variant="subtitle1">
                                                    {classNotes.length} note{classNotes.length !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small">
                                                {expandedClasses[className] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>

                                        <Collapse in={expandedClasses[className]}>
                                            <Grid container spacing={2}>
                                                {classNotes.map((note) => (
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
                                                                <Box>
                                                                    <IconButton 
                                                                        color="primary" 
                                                                        size="small"
                                                                        onClick={() => handleDownload(note)}
                                                                        title="Download"
                                                                    >
                                                                        <DownloadIcon />
                                                                    </IconButton>
                                                                    <IconButton 
                                                                        color="error" 
                                                                        size="small"
                                                                        onClick={() => handleDeleteNote(note._id)}
                                                                        title="Delete"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Box>
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
                                                                            {note.teacher?.name || 'Unknown Teacher'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <Typography variant="caption" color="textSecondary">
                                                                            <strong>Subject:</strong> {note.subject?.subName || 'General'}
                                                                        </Typography>
                                                                    </Box>
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

export default AdminNotes;

