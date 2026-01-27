import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ShowRoutines = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        classId: '',
        routineType: 'class',
        day: 'Sunday',
        period: '1',
        startTime: '',
        endTime: '',
        subject: '',
        teacherId: '',
        room: ''
    });

    useEffect(() => {
        fetchRoutines();
        fetchClasses();
    }, []);

    const fetchRoutines = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/Routines/:schoolId', {
                params: { schoolId: localStorage.getItem('schoolId') }
            });
            setRoutines(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching routines:', error);
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/classes/:schoolId', {
                params: { schoolId: localStorage.getItem('schoolId') }
            });
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleOpenDialog = (routine = null) => {
        if (routine) {
            setEditingRoutine(routine);
            setFormData({
                classId: routine.classId,
                routineType: routine.routineType,
                day: routine.day,
                period: routine.period,
                startTime: routine.startTime,
                endTime: routine.endTime,
                subject: routine.subject,
                teacherId: routine.teacherId,
                room: routine.room
            });
        } else {
            setEditingRoutine(null);
            setFormData({
                classId: '',
                routineType: 'class',
                day: 'Sunday',
                period: '1',
                startTime: '',
                endTime: '',
                subject: '',
                teacherId: '',
                room: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRoutine(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingRoutine) {
                await axios.put(`http://localhost:5000/api/Routine/${editingRoutine._id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/Routine/Create', {
                    ...formData,
                    schoolId: localStorage.getItem('schoolId')
                });
            }
            fetchRoutines();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving routine:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this routine?')) {
            try {
                await axios.delete(`http://localhost:5000/api/Routine/${id}`);
                fetchRoutines();
            } catch (error) {
                console.error('Error deleting routine:', error);
            }
        }
    };

    const getRoutineTypeColor = (type) => {
        switch (type) {
            case 'class': return 'primary';
            case 'exam': return 'secondary';
            case 'assembly': return 'success';
            case 'break': return 'warning';
            default: return 'default';
        }
    };

    const getClassName = (classId) => {
        const cls = classes.find(c => c._id === classId);
        return cls ? cls.className : classId;
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Routine Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Routine
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Day</TableCell>
                            <TableCell>Period</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Teacher ID</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {routines.map((routine) => (
                            <TableRow key={routine._id}>
                                <TableCell>{getClassName(routine.classId)}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={routine.routineType} 
                                        color={getRoutineTypeColor(routine.routineType)} 
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell>{routine.day}</TableCell>
                                <TableCell>{routine.period}</TableCell>
                                <TableCell>{routine.startTime} - {routine.endTime}</TableCell>
                                <TableCell>{routine.subject}</TableCell>
                                <TableCell>{routine.teacherId}</TableCell>
                                <TableCell>{routine.room}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(routine)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(routine._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingRoutine ? 'Edit Routine' : 'Add New Routine'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                label="Class"
                            >
                                {classes.map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.className}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Routine Type</InputLabel>
                            <Select
                                name="routineType"
                                value={formData.routineType}
                                onChange={handleChange}
                                label="Routine Type"
                            >
                                <MenuItem value="class">Class</MenuItem>
                                <MenuItem value="exam">Exam</MenuItem>
                                <MenuItem value="assembly">Assembly</MenuItem>
                                <MenuItem value="break">Break</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Day</InputLabel>
                            <Select
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                label="Day"
                            >
                                {days.map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Period</InputLabel>
                            <Select
                                name="period"
                                value={formData.period}
                                onChange={handleChange}
                                label="Period"
                            >
                                {periods.map((period) => (
                                    <MenuItem key={period} value={period}>{period}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Time"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="End Time"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <TextField
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Teacher ID"
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Room"
                            name="room"
                            value={formData.room}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingRoutine ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShowRoutines;
