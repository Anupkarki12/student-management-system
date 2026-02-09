import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Container, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Breadcrumbs, Link, FormControl, InputLabel, Select, MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const cardFloat = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
`;

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(100, 181, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

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
        } catch (error) {
            console.error('Error fetching available data:', error);
            setMessage({ type: 'error', text: 'Error loading data' });
        }
        setLoading(false);
    };

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
        <ViewContainer>
            <SectionTitle>📚 Select a Class to Assign Teachers</SectionTitle>
            <Grid container spacing={3}>
                {loading ? (
                    <Grid item xs={12}>
                        <LoadingBox>Loading classes...</LoadingBox>
                    </Grid>
                ) : classes.length === 0 ? (
                    <Grid item xs={12}>
                        <EmptyStateBox>No classes found</EmptyStateBox>
                    </Grid>
                ) : (
                    classes.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} key={cls._id}>
                            <ClassCard onClick={() => handleClassClick(cls)}>
                                <CardIconWrapper>
                                    <ClassIcon sx={{ fontSize: 40 }} />
                                </CardIconWrapper>
                                <CardTitle>{cls.sclassName}</CardTitle>
                                <CardSubtitle>Click to manage teachers</CardSubtitle>
                                <ArrowHint>→</ArrowHint>
                            </ClassCard>
                        </Grid>
                    ))
                )}
            </Grid>
        </ViewContainer>
    );

    const renderClassDetailsView = () => (
        <ViewContainer>
            <BreadcrumbsStyled>
                <BreadcrumbLink component="button" color="inherit" onClick={handleBackToClasses}>
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </BreadcrumbLink>
                <BreadcrumbCurrent>{selectedClass?.sclassName} - Teacher Assignments</BreadcrumbCurrent>
            </BreadcrumbsStyled>
            
            <SectionTitle>{selectedClass?.sclassName} - Teacher Assignments</SectionTitle>
            
            {message.text && (
                <AlertBox severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </AlertBox>
            )}
            
            <ButtonGroup>
                <ActionButton variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                    Assign Teacher
                </ActionButton>
                <SecondaryButton variant="outlined" startIcon={<PersonAddIcon />} onClick={handleAddNewTeacher}>
                    Add New Teacher
                </SecondaryButton>
            </ButtonGroup>
            
            <SubSectionTitle>Currently Assigned Teachers</SubSectionTitle>
            
            {availableData.alreadyAssigned && availableData.alreadyAssigned.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {availableData.alreadyAssigned.map((assignment) => (
                                <TableRow key={assignment._id} hover>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight="medium">
                                            {assignment.teacher?.name || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{assignment.teacher?.email || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <SubjectChip label={assignment.subject?.subName || 'N/A'} />
                                    </TableCell>
                                    <TableCell>
                                        <RemoveButton color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleRemoveAssignment(assignment._id)}>
                                            Remove
                                        </RemoveButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <EmptyStatePaper>
                    <EmptyStateIcon>📋</EmptyStateIcon>
                    <EmptyStateText>No teachers assigned to this class yet</EmptyStateText>
                </EmptyStatePaper>
            )}
            
            <StatsGrid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <StatCard>
                        <StatValue>{availableData.availableTeachers?.length || 0}</StatValue>
                        <StatLabel>Available Teachers</StatLabel>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard>
                        <StatValue>{availableData.subjects?.length || 0}</StatValue>
                        <StatLabel>Subjects</StatLabel>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard>
                        <StatValue>{availableData.alreadyAssigned?.length || 0}</StatValue>
                        <StatLabel>Assigned</StatLabel>
                    </StatCard>
                </Grid>
            </StatsGrid>
        </ViewContainer>
    );

    return (
        <PageContainer>
            <Container maxWidth="lg">
                <MainPaper>
                    {selectedClass ? renderClassDetailsView() : renderClassesView()}
                </MainPaper>
                
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Assign Teacher to Class</DialogTitle>
                    <DialogContent>
                        <DialogContentBox>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Class: <strong>{selectedClass?.sclassName}</strong>
                            </Typography>
                            
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
                                            <MenuItem key={teacher._id} value={teacher._id}>
                                                {teacher.name} ({teacher.email})
                                            </MenuItem>
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
                                            <MenuItem key={subject._id} value={subject._id}>
                                                {subject.subName} ({subject.subCode})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </DialogContentBox>
                    </DialogContent>
                    <DialogActions>
                        <DialogButton onClick={() => setOpenDialog(false)}>Cancel</DialogButton>
                        <DialogButton 
                            variant="contained" 
                            onClick={handleAssignTeacher} 
                            disabled={loading || !selectedTeacher || !selectedSubject || availableData.availableTeachers?.length === 0}
                        >
                            {loading ? 'Assigning...' : 'Assign Teacher'}
                        </DialogButton>
                    </DialogActions>
                </Dialog>
            </Container>
        </PageContainer>
    );
};

// Styled Components - DEPENDENT COMPONENTS FIRST
// Components that are referenced by other components MUST be defined before those that reference them
const CardIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 18px;
    background: #f0f4ff;
    color: #667eea;
    margin-bottom: 16px;
    transition: all 0.3s ease;
`;

const ArrowHint = styled.span`
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) translateX(-10px);
    opacity: 0;
    font-size: 1.5rem;
    color: #667eea;
    transition: all 0.3s ease;
`;

const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
    padding: 24px 0;
`;

const MainPaper = styled(Paper)`
    padding: 32px;
    border-radius: 16px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    animation: ${fadeIn} 0.4s ease-out;
`;

const ViewContainer = styled.div`
    animation: ${fadeIn} 0.4s ease-out;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 24px 0;
    padding-left: 4px;
`;

const SubSectionTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 24px 0 16px 0;
`;

const ClassCard = styled(Card)`
    cursor: pointer;
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    padding: 24px !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        
        ${CardIconWrapper} {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            animation: ${cardFloat} 2s ease-in-out infinite;
        }
        
        ${ArrowHint} {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
    }
`;

const CardTitle = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 8px;
`;

const CardSubtitle = styled(Typography)`
    font-size: 0.85rem;
    color: #888;
`;

const BreadcrumbsStyled = styled(Breadcrumbs)`
    margin-bottom: 20px;
`;

const BreadcrumbLink = styled(Link)`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #667eea !important;
    font-weight: 500;
    
    &:hover {
        text-decoration: underline;
    }
`;

const BreadcrumbCurrent = styled(Typography)`
    color: #1a1a2e !important;
    font-weight: 500;
`;

const AlertBox = styled(Alert)`
    margin-bottom: 24px;
    border-radius: 12px !important;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
`;

const ActionButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
    
    &:hover {
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
    }
`;

const SecondaryButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 500 !important;
`;

const SubjectChip = styled.span`
    display: inline-block;
    padding: 4px 12px;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
`;

const RemoveButton = styled(Button)`
    border-radius: 8px !important;
`;

const EmptyStatePaper = styled(Paper)`
    padding: 48px 24px;
    text-align: center;
    background: #fafafa !important;
    border-radius: 16px !important;
`;

const EmptyStateBox = styled.div`
    padding: 48px 24px;
    text-align: center;
    color: #888;
    font-size: 1.1rem;
`;

const LoadingBox = styled.div`
    padding: 48px 24px;
    text-align: center;
    color: #667eea;
    font-size: 1.1rem;
`;

const EmptyStateIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 12px;
`;

const EmptyStateText = styled(Typography)`
    color: #888 !important;
`;

const StatsGrid = styled(Grid)`
    margin-top: 24px !important;
`;

const StatCard = styled(Paper)`
    padding: 20px;
    text-align: center;
    border-radius: 12px !important;
    background: linear-gradient(135deg, #1f1f38 0%, #2c2c6c 100%) !important;
    color: #ffffff !important;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 4px;
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    opacity: 0.8;
`;

const DialogContentBox = styled.div`
    padding-top: 16px;
`;

const DialogButton = styled(Button)`
    border-radius: 8px !important;
    padding: 8px 20px !important;
`;

export default AssignTeacher;

