import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem, TextField, Card, CardContent } from '@mui/material';
import axios from 'axios';

const AddRoutine = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [routineData, setRoutineData] = useState([]);
    const [loading, setLoading] = useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = ['1', '2', '3', '4', '5', '6', '7', '8'];

    useEffect(() => {
        fetchClasses();
    }, []);

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

    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        if (classId) {
            fetchRoutine(classId);
        }
    };

    const fetchRoutine = async (classId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/Routines/Class/:schoolId/:classId`, {
                params: { schoolId: localStorage.getItem('schoolId'), classId }
            });
            setRoutineData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching routine:', error);
            setRoutineData([]);
            setLoading(false);
        }
    };

    const handleRoutineChange = (day, period, field, value) => {
        setRoutineData(prev => {
            const existing = prev.find(r => r.day === day && r.period === period);
            if (existing) {
                return prev.map(r => 
                    r.day === day && r.period === period 
                        ? { ...r, [field]: value } 
                        : r
                );
            } else {
                return [...prev, {
                    classId: selectedClass,
                    day,
                    period,
                    routineType: 'class',
                    startTime: '',
                    endTime: '',
                    subject: '',
                    teacherId: '',
                    room: '',
                    schoolId: localStorage.getItem('schoolId'),
                    [field]: value
                }];
            }
        });
    };

    const handleSaveRoutine = async (routine) => {
        try {
            await axios.post('http://localhost:5000/api/Routine/Create', routine);
        } catch (error) {
            console.error('Error saving routine:', error);
        }
    };

    const getRoutineForSlot = (day, period) => {
        return routineData.find(r => r.day === day && r.period === period) || {};
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Add Routine
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    label="Select Class"
                >
                    {classes.map((cls) => (
                        <MenuItem key={cls._id} value={cls._id}>
                            {cls.className}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedClass && (
                <Paper sx={{ p: 2, overflowX: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Typography sx={{ width: 100, fontWeight: 'bold' }}>Day</Typography>
                        {periods.map(period => (
                            <Typography key={period} sx={{ width: 120, textAlign: 'center', fontWeight: 'bold' }}>
                                Period {period}
                            </Typography>
                        ))}
                    </Box>
                    {days.map(day => (
                        <Box key={day} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Typography sx={{ width: 100, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                {day}
                            </Typography>
                            {periods.map(period => {
                                const routine = getRoutineForSlot(day, period);
                                return (
                                    <Card key={`${day}-${period}`} sx={{ width: 120, minHeight: 120 }}>
                                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                            <TextField
                                                size="small"
                                                placeholder="Subject"
                                                value={routine.subject || ''}
                                                onChange={(e) => handleRoutineChange(day, period, 'subject', e.target.value)}
                                                fullWidth
                                                sx={{ mb: 0.5 }}
                                            />
                                            <TextField
                                                size="small"
                                                placeholder="Room"
                                                value={routine.room || ''}
                                                onChange={(e) => handleRoutineChange(day, period, 'room', e.target.value)}
                                                fullWidth
                                                sx={{ mb: 0.5 }}
                                            />
                                            <Button 
                                                size="small" 
                                                variant="outlined"
                                                onClick={() => handleSaveRoutine({
                                                    ...routine,
                                                    classId: selectedClass,
                                                    day,
                                                    period,
                                                    schoolId: localStorage.getItem('schoolId')
                                                })}
                                                fullWidth
                                            >
                                                Save
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
};

export default AddRoutine;

