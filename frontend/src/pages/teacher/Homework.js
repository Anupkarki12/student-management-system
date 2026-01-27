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
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios';
import { formatNepaliDate } from '../../utils/nepaliDate';
import NepaliDatePicker from '../../components/NepaliDatePicker';

const Homework = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector((state) => state.user);
    
    const [homeworkList, setHomeworkList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [newHomework, setNewHomework] = useState({
        title: '',
        description: '',
        dueDate: '',
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
            fetchHomework();
        }
    }, [teacherId]);

    const fetchTeacherClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/Classes/${teacherId}`);
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                setClasses(result.data);
                setSelectedClass(result.data[0]._id);
                setNewHomework(prev => ({ ...prev, sclassID: result.data[0]._id }));
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
        setLoading(false);
    };

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Homework/${teacherId}`);
            if (result.data && result.data.message) {
                setHomeworkList([]);
            } else if (Array.isArray(result.data)) {
                setHomeworkList(result.data);
            }
        } catch (error) {
            console.error('Error fetching homework:', error);
            setMessage({ type: 'error', text: 'Error loading homework' });
        }
        setLoading(false);
    };

    const handleCreateHomework = async () => {
        if (!newHomework.title || !newHomework.description || !newHomework.dueDate || !newHomework.sclassID) {
            setMessage({ type: 'error', text: 'Please fill all required fields' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = {
                title: newHomework.title,
                description: newHomework.description,
                dueDate: newHomework.dueDate,
                teacherID: teacherId,
                schoolID: schoolId,
                sclassID: newHomework.sclassID
            };

            await axios.post(`${process.env.REACT_APP_BASE_URL}/HomeworkCreate`, formData);
            setMessage({ type: 'success', text: 'Homework created successfully!' });
            setOpenDialog(false);
            setNewHomework({ title: '', description: '', dueDate: '', sclassID: selectedClass });
            fetchHomework();
        } catch (error) {
            console.error('Error creating homework:', error);
            setMessage({ type: 'error', text: 'Error creating homework' });
        }
        setSaving(false);
    };

    const handleDeleteHomework = async (id) => {
        if (!window.confirm('Are you sure you want to delete this homework?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/Homework/${id}`);
            setMessage({ type: 'success', text: 'Homework deleted successfully!' });
            fetchHomework();
        } catch (error) {
            console.error('Error deleting homework:', error);
            setMessage({ type: 'error', text: 'Error deleting homework' });
        }
    };

    const isOverdue = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dueDate) < today;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (date.toString() === 'Invalid Date') return 'N/A';
        return formatNepaliDate(date, { format: 'full', showDayName: false });
    };

    const getClassName = (hw) => {
        if (hw.sclass?.sclassName) return hw.sclass.sclassName;
        const cls = classes.find(c => c._id === hw.sclass);
        return cls?.sclassName || 'N/A';
    };

    const filteredHomework = selectedClass 
        ? homeworkList.filter(hw => hw.sclass?._id === selectedClass || hw.sclass === selectedClass)
        : homeworkList;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Homework
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        disabled={classes.length === 0}
                    >
                        Add Homework
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
                    <Typography align="center">Loading homework...</Typography>
                ) : filteredHomework.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" color="textSecondary">
                            No Homework Assigned
                        </Typography>
                        <Typography color="textSecondary">
                            {classes.length === 0 
                                ? 'You are not assigned to any class yet.'
                                : 'Click "Add Homework" to assign homework to your class'}
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHomework.map((hw) => (
                                    <TableRow key={hw._id} hover>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {hw.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {hw.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={`Class ${getClassName(hw)}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(hw.dueDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={isOverdue(hw.dueDate) ? 'Overdue' : 'Active'}
                                                color={isOverdue(hw.dueDate) ? 'error' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteHomework(hw._id)}
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
                <DialogTitle>Add New Homework</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Class *</InputLabel>
                            <Select
                                value={newHomework.sclassID}
                                label="Class *"
                                onChange={(e) => setNewHomework({ ...newHomework, sclassID: e.target.value })}
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
                            value={newHomework.title}
                            onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={newHomework.description}
                            onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <NepaliDatePicker
                            label="Due Date *"
                            value={newHomework.dueDate}
                            onChange={(date) => setNewHomework({ ...newHomework, dueDate: date })}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreateHomework}
                        disabled={saving || !newHomework.sclassID}
                    >
                        {saving ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Homework;

