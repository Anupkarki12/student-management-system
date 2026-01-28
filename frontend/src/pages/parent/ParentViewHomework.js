import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Container, Card, CardContent,
    Grid, Chip, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

const ParentViewHomework = () => {
    const navigate = useNavigate();
    const { studentId } = useParams();

    const { currentUser, userDetails } = useSelector((state) => state.user);
    const { userDetails: parentUserDetails } = useSelector((state) => state.parent);

    const [homework, setHomework] = useState([]);
    const [filteredHomework, setFilteredHomework] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedChild, setSelectedChild] = useState(studentId || '');

    const getChildrenList = () => {
        if (parentUserDetails?.students) {
            return parentUserDetails.students;
        }
        if (userDetails?.students) {
            return userDetails.students;
        }
        return [];
    };

    const children = getChildrenList();

    const getStudentClassId = () => {
        const child = children.find(c => c.studentId === selectedChild);
        // Handle both string classId and sclassName object
        if (child?.classId) return child.classId;
        if (child?.sclassName?._id) return child.sclassName._id;
        if (typeof child?.sclassName === 'string') return child.sclassName;
        return '';
    };

    useEffect(() => {
        if (selectedChild) {
            fetchHomework(selectedChild);
        } else {
            setHomework([]);
            setFilteredHomework([]);
        }
    }, [selectedChild]);

    useEffect(() => {
        filterHomework();
    }, [homework, selectedDate]);

    const fetchHomework = async (studentId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Use the new endpoint that takes studentId directly
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Homework/StudentById/${studentId}`);
            
            if (result.data && result.data.message) {
                setHomework([]);
                setMessage({ type: 'info', text: 'No homework assigned yet' });
            } else if (result.data && result.data.length > 0) {
                setHomework(result.data);
            } else {
                setHomework([]);
                setMessage({ type: 'info', text: 'No homework found' });
            }
        } catch (error) {
            console.error('Error fetching homework:', error);
            setMessage({ type: 'error', text: 'Error loading homework' });
        }
        setLoading(false);
    };

    const filterHomework = () => {
        if (!selectedDate) {
            setFilteredHomework(homework);
        } else {
            const filtered = homework.filter(hw => {
                const hwDate = new Date(hw.dueDate).toISOString().split('T')[0];
                return hwDate === selectedDate;
            });
            setFilteredHomework(filtered);
        }
    };

    const isOverdue = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        return due < today;
    };

    const isDueToday = (dueDate) => {
        const today = new Date().toISOString().split('T')[0];
        const due = new Date(dueDate).toISOString().split('T')[0];
        return due === today;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusChip = (dueDate) => {
        if (isOverdue(dueDate)) {
            return <Chip label="Overdue" color="error" size="small" />;
        } else if (isDueToday(dueDate)) {
            return <Chip label="Due Today" color="warning" size="small" />;
        } else {
            return <Chip label="Pending" color="info" size="small" />;
        }
    };

    const getDaysRemaining = (dueDate) => {
        if (isOverdue(dueDate)) return 'X';
        return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const handleChildChange = (event) => {
        setSelectedChild(event.target.value);
        navigate(`/Parent/child/${event.target.value}/homework`);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#7f56da', mr: 2 }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Homework
                </Typography>
            </Box>

            {/* Child Selector */}
            <Card sx={{ mb: 3, p: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Select Child</InputLabel>
                    <Select
                        value={selectedChild}
                        onChange={handleChildChange}
                        label="Select Child"
                    >
                        {children.map((child) => (
                            <MenuItem key={child.studentId} value={child.studentId}>
                                {child.name} - Class {child.class}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Card>

            {selectedChild ? (
                <>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Filter by Due Date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => fetchHomework(selectedChild)}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="body2" color="textSecondary">
                                    {filteredHomework.length} homework items
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {message.text && (
                        <Paper sx={{ p: 2, mb: 3, bgcolor: message.type === 'error' ? '#ffebee' : message.type === 'success' ? '#e8f5e9' : '#e3f2fd' }}>
                            <Typography color={message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}>
                                {message.text}
                            </Typography>
                        </Paper>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredHomework.length === 0 ? (
                        <Card sx={{ textAlign: 'center', py: 4 }}>
                            <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography color="textSecondary" variant="h6">
                                No homework found
                            </Typography>
                        </Card>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredHomework.map((hw) => (
                                <Grid item xs={12} key={hw._id}>
                                    <Card 
                                        sx={{ 
                                            borderLeft: '4px solid',
                                            borderLeftColor: isOverdue(hw.dueDate) ? '#f44336' : isDueToday(hw.dueDate) ? '#ff9800' : '#4caf50'
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={8}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mr: 2 }}>
                                                            {hw.title}
                                                        </Typography>
                                                        {getStatusChip(hw.dueDate)}
                                                    </Box>
                                                    
                                                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                                        {hw.description}
                                                    </Typography>

                                                <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                                <Typography variant="body2">
                                                                    <strong>Teacher:</strong> {hw.teacher?.name || 'Not specified'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                                                                    Subject:
                                                                </Typography>
                                                                <Chip 
                                                                    label={hw.subject?.subName || 'General'}
                                                                    size="small"
                                                                    color="secondary"
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                                <Typography variant="body2">
                                                                    <strong>Due:</strong> {formatDate(hw.dueDate)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box 
                                                        sx={{ 
                                                            bgcolor: '#f5f5f5',
                                                            p: 2,
                                                            borderRadius: 2,
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2" color="textSecondary">
                                                            Days Remaining
                                                        </Typography>
                                                        <Typography 
                                                            variant="h3" 
                                                            color={isOverdue(hw.dueDate) ? 'error' : isDueToday(hw.dueDate) ? 'warning' : 'primary'}
                                                        >
                                                            {getDaysRemaining(hw.dueDate)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        Please select a child to view their homework
                    </Typography>
                </Card>
            )}
        </Container>
    );
};

export default ParentViewHomework;

