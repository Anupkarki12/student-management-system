import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllSclasses, getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlackButton, BlueButton, GreenButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {
    Paper, Box, IconButton, Grid, Card, CardContent, CardActions,
    Typography, Chip, Breadcrumbs, Link, CircularProgress, Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
const { loading, error, response, sclassesList, sclassStudents } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    const { status } = useSelector((state) => state.user);

    // Use sclassStudents for the student list
    const studentsList = sclassStudents;

    console.log('Redux state sclassStudents:', sclassStudents);
    console.log('Using studentsList:', studentsList);

    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'students', 'details'
    const [selectedClass, setSelectedClass] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (viewMode === 'classes') {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [currentUser._id, dispatch, viewMode]);

    // Refresh when a new student is added
    useEffect(() => {
        if (status === 'added' && selectedClass) {
            dispatch(getClassStudents(selectedClass._id));
        }
    }, [status, selectedClass, dispatch]);

    if (error) {
        console.log(error);
    }

    const handleClassClick = (classData) => {
        setSelectedClass(classData);
        setViewMode('students');
        dispatch(getClassStudents(classData._id));
    };

    const handleBack = () => {
        if (viewMode === 'students') {
            setViewMode('classes');
            setSelectedClass(null);
        } else if (viewMode === 'details') {
            setViewMode('students');
        }
    };

    const handleStudentClick = (studentId) => {
        navigate(`/Admin/students/student/${studentId}`);
    };

    const deleteHandler = (deleteID, address) => {
        dispatch({ type: 'student/getDeleteSuccess', payload: null });
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch({ type: 'student/getSuccess', payload: [] });
                if (selectedClass) {
                    dispatch(getClassStudents(selectedClass._id));
                }
            });
    };

    // Student columns - only show fields that exist in the schema
    const studentColumns = [
        { id: 'rollNum', label: 'Roll No.', minWidth: 80 },
        { id: 'name', label: 'Name', minWidth: 170 },
    ];

    const studentRows = studentsList && studentsList.length > 0 && studentsList.map((student) => ({
        rollNum: student.rollNum,
        name: student.name,
        id: student._id,
    }));

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks', 'View Fee'];
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) {
                navigate(`/Admin/students/student/attendance/${row.id}`);
            } else if (selectedIndex === 1) {
                navigate(`/Admin/students/student/marks/${row.id}`);
            } else if (selectedIndex === 2) {
                navigate(`/Admin/students/student/fee/${row.id}`);
            }
        };

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => {
            setOpen((prevOpen) => !prevOpen);
        };

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) {
                return;
            }
            setOpen(false);
        };

        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton variant="contained" onClick={() => handleStudentClick(row.id)}>
                    View
                </BlueButton>
                <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                    <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                    <BlackButton size="small" onClick={handleToggle}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </BlackButton>
                </ButtonGroup>
                <Popper sx={{ zIndex: 1 }} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu" autoFocusItem>
                                        {options.map((option, index) => (
                                            <MenuItem key={option} selected={index === selectedIndex} onClick={(event) => handleMenuItemClick(event, index)}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </>
        );
    };

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    // Render classes as cards
    const renderClassesView = () => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Select a Class to View Students
                </Typography>
                <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                    Add Students
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Typography variant="h5" component="div">
                                            Class {cls.sclassName}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<PersonIcon />}
                                        label="View Students"
                                        color="primary"
                                        variant="outlined"
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

    // Render students for selected class
    const renderStudentsView = () => (
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
                <Typography color="text.primary">Students</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Students - Class {selectedClass?.sclassName}
                </Typography>
                <GreenButton variant="contained" onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}>
                    Add Student
                </GreenButton>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No students found in this class
                    </Typography>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}>
                        Add Student
                    </GreenButton>
                </Paper>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {Array.isArray(studentsList) && studentsList.length > 0 && (
                        <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                    )}
                    <SpeedDialTemplate actions={actions} />
                </Paper>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            {viewMode === 'classes' && renderClassesView()}
            {viewMode === 'students' && renderStudentsView()}
            <Popup setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowStudents;

