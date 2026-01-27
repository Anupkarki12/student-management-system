import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Breadcrumbs, Link, FormControl, InputLabel, Select, MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AssignTeacher = () => {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [availableData, setAvailableData] = useState({ availableTeachers: [], subjects: [], alreadyAssigned: [] });
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const schoolId = currentUser?._id;

    useEffect(() => { if (schoolId) fetchClasses(); }, [schoolId]);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SclassList/${schoolId}`);
            console.log("data:",result)
            if (result.data && result.data.length > 0) {
                setClasses(result.data);
            } else {
                setMessage({ type: 'info', text: 'No classes found' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error loading classes' });
        }
        setLoading(false);
    };
    console.log(classes);

    const handleClassClick = async (cls) => {
        setSelectedClass(cls);
        await fetchAvailableData(cls._id);
    };

    const fetchAvailableData = async (classId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Class/AvailableTeachers/${classId}/${schoolId}`);
            setAvailableData({
                availableTeachers: result.data.availableTeachers || [],
                subjects: result.data.subjects || [],
                alreadyAssigned: result.data.alreadyAssigned || []
            });
            console.log("Available data:",result)
        } catch (error) {
            console.error('Error fetching available data:', error);
            setMessage({ type: 'error', text: 'Error loading data' });
        }
        setLoading(false);
    };

    console.log("Availa:",availableData)

    const handleBackToClasses = () => {
        setSelectedClass(null);
        setAvailableData({ availableTeachers: [], subjects: [], alreadyAssigned: [] });
        setSelectedTeacher('');
        setSelectedSubject('');
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacher || !selectedSubject) {
            setMessage({ type: 'error', text: 'Please select both teacher and subject' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.post(`${process.env.REACT_APP_BASE_URL}/Teacher/Assign`, { 
                teacherID: selectedTeacher, 
                sclassID: selectedClass._id, 
                subjectID: selectedSubject, 
                schoolID: schoolId 
            });
            setMessage({ type: 'success', text: 'Teacher assigned successfully!' });
            setOpenDialog(false);
            setSelectedTeacher('');
            setSelectedSubject('');
            await fetchAvailableData(selectedClass._id);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error assigning teacher' });
        }
        setLoading(false);
    };

    const handleRemoveAssignment = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to remove this assignment?')) return;
        setLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/Assignment/${assignmentId}`);
            setMessage({ type: 'success', text: 'Assignment removed successfully!' });
            await fetchAvailableData(selectedClass._id);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error removing assignment' });
        }
        setLoading(false);
    };

    const handleAddNewTeacher = () => {
        navigate('/Admin/teachers/addteacher');
    };

    const renderClassesView = () => (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Select a Class to Assign Teachers</Typography>
            <Grid container spacing={3}>
                {loading ? <Grid item xs={12}><Typography align="center">Loading classes...</Typography></Grid> :
                 classes.length === 0 ? <Grid item xs={12}><Typography align="center" color="textSecondary">No classes found</Typography></Grid> :
                 classes.map((cls) => (
                    <Grid item xs={12} sm={6} md={4} key={cls._id}>
                        <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }} onClick={() => handleClassClick(cls)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PersonIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                                    <Typography variant="h6">{cls.sclassName}</Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary">Click to manage teachers</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderClassDetailsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link component="button" color="inherit" onClick={handleBackToClasses} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Typography color="text.primary">{selectedClass?.sclassName} - Teacher Assignments</Typography>
            </Breadcrumbs>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>{selectedClass?.sclassName} - Teacher Assignments</Typography>
            {message.text && <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenDialog(true)}
                >
                    Assign Teacher
                </Button>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<PersonAddIcon />} 
                    onClick={handleAddNewTeacher}
                >
                    Add New Teacher
                </Button>
            </Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>Currently Assigned Teachers</Typography>
            {availableData.alreadyAssigned && availableData.alreadyAssigned.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}><TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {availableData.alreadyAssigned.map((assignment) => (
                                <TableRow key={assignment._id} hover>
                                    <TableCell><Typography variant="body1" fontWeight="medium">{assignment.teacher?.name || 'N/A'}</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{assignment.teacher?.email || 'N/A'}</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{assignment.subject?.subName || 'N/A'}</Typography></TableCell>
                                    <TableCell><Button color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleRemoveAssignment(assignment._id)}>Remove</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}><Typography color="textSecondary">No teachers assigned to this class yet</Typography></Paper>
            )}
            <Paper sx={{ p: 2, mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><Typography variant="subtitle1"><strong>Available Teachers:</strong> {availableData.availableTeachers?.length || 0}</Typography></Grid>
                    <Grid item xs={12} sm={4}><Typography variant="subtitle1"><strong>Subjects:</strong> {availableData.subjects?.length || 0}</Typography></Grid>
                    <Grid item xs={12} sm={4}><Typography variant="subtitle1"><strong>Assigned:</strong> {availableData.alreadyAssigned?.length || 0}</Typography></Grid>
                </Grid>
            </Paper>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>{selectedClass ? renderClassDetailsView() : renderClassesView()}</Paper>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Teacher to Class</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Class: <strong>{selectedClass?.sclassName}</strong></Typography>
                        
                        {(!availableData.availableTeachers || availableData.availableTeachers.length === 0) ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                All teachers in the school have been assigned to this class. 
                                <Button size="small" onClick={handleAddNewTeacher} sx={{ ml: 1 }}>Add New Teacher</Button>
                            </Alert>
                        ) : (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Teacher *</InputLabel>
                                <Select value={selectedTeacher} label="Select Teacher *" onChange={(e) => setSelectedTeacher(e.target.value)}>
                                    {Array.isArray(availableData.availableTeachers) && availableData.availableTeachers.map((teacher) => (
                                        <MenuItem key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.email})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        
                        {(!availableData.subjects || availableData.subjects.length === 0) ? (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                No subjects found for this class. Please add subjects first.
                            </Alert>
                        ) : (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Subject *</InputLabel>
                                <Select value={selectedSubject} label="Select Subject *" onChange={(e) => setSelectedSubject(e.target.value)}>
                                    {Array.isArray(availableData.subjects) && availableData.subjects.map((subject) => (
                                        <MenuItem key={subject._id} value={subject._id}>{subject.subName} ({subject.subCode})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAssignTeacher} 
                        disabled={loading || !selectedTeacher || !selectedSubject || availableData.availableTeachers?.length === 0}
                    >
                        {loading ? 'Assigning...' : 'Assign Teacher'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AssignTeacher;

