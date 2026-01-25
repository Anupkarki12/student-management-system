
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, Typography, Paper, Grid, Container, Button, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Chip, TextField, Alert, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import NoteIcon from '@mui/icons-material/Note';
import axios from 'axios';

const TeacherNotes = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector((state) => state.user);
    
    const [notesList, setNotesList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newNote, setNewNote] = useState({
        title: '',
        description: '',
        sclassID: ''
    });
    const [saving, setSaving] = useState(false);

    const teacherId = currentUser?._id;
    const schoolId = currentUser?.school?._id;

    useEffect(() => {
        if (teacherId) {
            fetchTeacherClasses();
        }
    }, [teacherId]);

    useEffect(() => {
        if (teacherId) {
            fetchNotes();
        }
    }, [teacherId]);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Classes/${teacherId}`);
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                setClasses(result.data);
                setSelectedClass(result.data[0]._id);
                setNewNote(prev => ({ ...prev, sclassID: result.data[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
        setLoading(false);
    };

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/TeacherNotes/${teacherId}`);
            if (result.data && result.data.message) {
                setNotesList([]);
            } else if (Array.isArray(result.data)) {
                setNotesList(result.data);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setMessage({ type: 'error', text: 'Error loading notes' });
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleCreateNote = async () => {
        if (!newNote.title || !newNote.description || !selectedFile || !newNote.sclassID) {
            setMessage({ type: 'error', text: 'Please fill all fields and select a file' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('title', newNote.title);
            formData.append('description', newNote.description);
            formData.append('teacherID', teacherId);
            formData.append('schoolID', schoolId);
            formData.append('sclassID', newNote.sclassID);
            formData.append('file', selectedFile);

            await axios.post(`${process.env.REACT_APP_BASE_URL}/TeacherNoteCreate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setMessage({ type: 'success', text: 'Note uploaded successfully!' });
            setOpenDialog(false);
            setNewNote({ title: '', description: '', sclassID: selectedClass });
            setSelectedFile(null);
            fetchNotes();
        } catch (error) {
            console.error('Error uploading note:', error);
            setMessage({ type: 'error', text: 'Error uploading note' });
        }
        setSaving(false);
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/TeacherNote/${id}`);
            setMessage({ type: 'success', text: 'Note deleted successfully!' });
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            setMessage({ type: 'error', text: 'Error deleting note' });
        }
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
        return new Date(dateString).toLocaleDateString('en-US', {
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

    const getClassName = (note) => {
        if (note.sclass?.sclassName) return note.sclass.sclassName;
        const cls = classes.find(c => c._id === note.sclass);
        return cls?.sclassName || 'N/A';
    };

    const filteredNotes = selectedClass 
        ? notesList.filter(note => note.sclass?._id === selectedClass || note.sclass === selectedClass)
        : notesList;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        <NoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Notes
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        disabled={classes.length === 0}
                    >
                        Upload Note
                    </Button>
                </Box>

                {classes.length > 1 && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Filter by Class</InputLabel>
                        <Select
                            value={selectedClass}
                            label="Filter by Class"
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <MenuItem value="">All Classes</MenuItem>
                            {classes.map((cls) => (
                                <MenuItem key={cls._id} value={cls._id}>
                                    {cls.sclassName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 3 }}>
                        {message.text}
                    </Alert>
                )}

                {loading ? (
                    <Typography align="center">Loading notes...</Typography>
                ) : filteredNotes.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            No Notes Uploaded
                        </Typography>
                        <Typography color="textSecondary">
                            {classes.length === 0 
                                ? 'You are not assigned to any class yet.'
                                : 'Click "Upload Note" to share study materials with your class'}
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>File</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Title</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Size</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Uploaded</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredNotes.map((note) => (
                                    <TableRow key={note._id} hover>
                                        <TableCell>
                                            <Chip label={getFileIcon(note.fileType)} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {note.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {note.fileName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {note.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`Class ${getClassName(note)}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatFileSize(note.fileSize)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(note.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleDownload(note)}
                                                title="Download"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteNote(note._id)}
                                                title="Delete"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload New Note</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Class *</InputLabel>
                            <Select
                                value={newNote.sclassID}
                                label="Class *"
                                onChange={(e) => setNewNote({ ...newNote, sclassID: e.target.value })}
                            >
                                {classes.map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={newNote.description}
                            onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                            onChange={handleFileChange}
                            style={{ marginBottom: 16, width: '100%' }}
                        />
                        {selectedFile && (
                            <Typography variant="body2" color="textSecondary">
                                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreateNote}
                        disabled={saving || !newNote.sclassID}
                    >
                        {saving ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TeacherNotes;

