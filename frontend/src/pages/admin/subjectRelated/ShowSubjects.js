import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllSclasses, getSubjectList, getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Grid, Card, CardContent, CardActions,
    Typography, Button, Chip, Breadcrumbs, Link, CircularProgress
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
const { subjectsList, loading, error, response, sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'subjects', 'details'
    const [selectedClass, setSelectedClass] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (viewMode === 'classes') {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [currentUser._id, dispatch, viewMode]);

    if (error) {
        console.log(error);
    }

    const handleClassClick = (classData) => {
        setSelectedClass(classData);
        setViewMode('subjects');
        dispatch(getSubjectList(classData._id, "ClassSubjects"));
    };

    const handleBack = () => {
        if (viewMode === 'subjects') {
            setViewMode('classes');
            setSelectedClass(null);
        } else if (viewMode === 'details') {
            setViewMode('subjects');
        }
    };

    const handleSubjectClick = (subject, classId) => {
        navigate(`/Admin/subjects/subject/${classId}/${subject._id}`);
    };

    const deleteHandler = (deleteID, address) => {
        dispatch({ type: 'sclass/getFailed', payload: null });
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch({ type: 'sclass/getSubjectsSuccess', payload: [] });
                if (selectedClass) {
                    dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
                } else {
                    dispatch(getAllSclasses(currentUser._id, "Sclass"));
                }
            });
    };

    const deleteSubjectHandler = (deleteID, address) => {
        dispatch({ type: 'sclass/getFailed', payload: null });
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch({ type: 'sclass/getSubjectsSuccess', payload: [] });
                dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
            });
    };

    // Subject columns
    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'subCode', label: 'Subject Code', minWidth: 100 },
        { id: 'sessions', label: 'Sessions', minWidth: 100 },
        { id: 'teacher', label: 'Teacher', minWidth: 170 },
    ];

    const subjectRows = subjectsList && subjectsList.map((subject) => ({
        subName: subject.subName,
        subCode: subject.subCode || 'N/A',
        sessions: subject.sessions,
        teacher: subject.teacher?.name || 'Not Assigned',
        id: subject._id,
    }));

    const SubjectsButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteSubjectHandler(row.id, "Subject")}>
                <DeleteIcon color="error" />
            </IconButton>
            <BlueButton variant="contained" onClick={() => handleSubjectClick(row, selectedClass._id)}>
                View
            </BlueButton>
        </>
    );

    const actions = [
        {
            icon: <PostAddIcon color="primary" />,
            name: 'Add New Subject',
            action: () => navigate(`/Admin/addsubject/${selectedClass._id}`)
        },
        {
            icon: <DeleteIcon color="error" />,
            name: 'Delete All Subjects',
            action: () => deleteHandler(selectedClass._id, "SubjectsClass")
        }
    ];

    // Render classes as cards
    const renderClassesView = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Select a Class to View Subjects
                </Typography>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/subjects/chooseclass")}>
                    Add Subjects
                </GreenButton>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No classes found
                    </Typography>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </GreenButton>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {Array.isArray(sclassesList) && sclassesList.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cls._id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { 
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6
                                    }
                                }}
                                onClick={() => handleClassClick(cls)}
                            >
                                <CardContent>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        Class {cls.sclassName}
                                    </Typography>
                                    <Chip 
                                        icon={<DescriptionIcon />} 
                                        label="View Subjects" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                                <CardActions>
                                    <Button size="small" fullWidth onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/Admin/class/addstudents/${cls._id}`);
                                    }}>
                                        Add Students
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Render subjects for selected class
    const renderSubjectsView = () => (
        <Box>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link 
                    color="inherit" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handleBack(); }}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                </Link>
                <Typography color="text.primary">Subjects</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Subjects - Class {selectedClass?.sclassName}
                </Typography>
                <GreenButton variant="contained" onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}>
                    Add Subject
                </GreenButton>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No subjects found for this class
                    </Typography>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}>
                        Add Subject
                    </GreenButton>
                </Paper>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                    )}
                    <SpeedDialTemplate actions={actions} />
                </Paper>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {viewMode === 'classes' && renderClassesView()}
            {viewMode === 'subjects' && renderSubjectsView()}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowSubjects;

