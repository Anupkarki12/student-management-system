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
import ParentChooser from '../../../components/ParentChooser';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
    Paper, Box, IconButton, Grid, Card, CardContent, CardActions,
    Typography, Chip, Breadcrumbs, Link, CircularProgress, Avatar, Snackbar, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { exportToExcel, getCurrentDateString } from '../../../utils/excelExport';
import axios from 'axios';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
const { loading, error, response, sclassesList, sclassStudents } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);
    const { status } = useSelector((state) => state.user);

    // Use sclassStudents for the student list
    const studentsList = sclassStudents;

    console.log("StudentList:", studentsList)

    console.log('Redux state sclassStudents:', sclassStudents);
    console.log('Using studentsList:', studentsList);

    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'students', 'details'
    const [selectedClass, setSelectedClass] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    // Parent linking state
    const [linkParentOpen, setLinkParentOpen] = useState(false);
    const [selectedStudentForLink, setSelectedStudentForLink] = useState(null);
    const [selectedParent, setSelectedParent] = useState(null);
    const [linkingInProgress, setLinkingInProgress] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

    // Helper function to safely get parent name (father first, then mother, then guardian)
    const getParentName = (p) => {
        if (!p) return '';
        if (p.fatherName && p.fatherName.trim()) return p.fatherName;
        if (p.motherName && p.motherName.trim()) return p.motherName;
        if (p.guardianName && p.guardianName.trim()) return p.guardianName;
        return '';
    };

    // Helper function to safely get parent email
    const getParentEmail = (p) => {
        if (!p) return '';
        if (p.fatherEmail && p.fatherEmail.trim()) return p.fatherEmail;
        if (p.motherEmail && p.motherEmail.trim()) return p.motherEmail;
        if (p.guardianEmail && p.guardianEmail.trim()) return p.guardianEmail;
        return '';
    };

    // Helper function to safely get parent ID
    const getParentID = (p) => {
        if (!p) return '';
        if (p._id) return String(p._id);
        return '';
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    // Helper function to safely get field value
    const getFieldValue = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value.trim() || '';
        if (typeof value === 'number') return value;
        return '';
    };

    // Export students to Excel
    const handleExportStudents = () => {
        if (!studentsList || studentsList.length === 0) {
            alert('No students to export');
            return;
        }

        console.log("Exporting students data:", studentsList);

        const exportData = studentsList.map((student) => {
            const parent = student.parent;
            console.log(`Student: ${student.name}, Parent:`, parent);

            return {
                'Student ID': getFieldValue(student._id),
                'Class': student.sclassName?.sclassName || '',
                'Roll No': getFieldValue(student.rollNum),
                'Name': getFieldValue(student.name),
                'Address': getFieldValue(student.address),
                'DOB': formatDate(student.dob),
                'Parent ID': getParentID(parent),
                'Parent Name': getParentName(parent),
                'Parent Gmail': getParentEmail(parent),
                'Father Name': getFieldValue(parent?.fatherName),
                'Father Phone': getFieldValue(parent?.fatherPhone),
                'Mother Name': getFieldValue(parent?.motherName),
                'Mother Phone': getFieldValue(parent?.motherPhone),
                'Guardian Name': getFieldValue(parent?.guardianName),
                'Guardian Phone': getFieldValue(parent?.guardianPhone),
                'Guardian Relation': getFieldValue(parent?.guardianRelation),
            };
        });

        console.log("Export data prepared:", exportData);
        const fileName = `Students_${selectedClass?.sclassName || 'All'}_${getCurrentDateString()}`;
        exportToExcel(exportData, fileName, 'Students');
    };

    // Open parent chooser dialog for linking
    const handleOpenLinkParent = (student) => {
        setSelectedStudentForLink(student);
        setSelectedParent(null);
        setLinkParentOpen(true);
    };

    // Handle parent selection from chooser
    const handleParentSelect = (parent) => {
        setSelectedParent(parent);
    };

    // Link student to parent
    const handleLinkStudentToParent = async () => {
        if (!selectedStudentForLink || !selectedParent) {
            setSnackbar({
                open: true,
                message: 'Please select a parent first',
                severity: 'error'
            });
            return;
        }

        setLinkingInProgress(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/Parent/Link/${selectedParent._id}/${selectedStudentForLink.id}`
            );

            if (response.data.message) {
                setSnackbar({
                    open: true,
                    message: response.data.message,
                    severity: 'warning'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: `Successfully linked ${selectedStudentForLink.name} to parent`,
                    severity: 'success'
                });

                // Refresh student list
                if (selectedClass) {
                    dispatch(getClassStudents(selectedClass._id));
                }
            }
        } catch (error) {
            console.error("Error linking student to parent:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to link student to parent',
                severity: 'error'
            });
        } finally {
            setLinkingInProgress(false);
            setLinkParentOpen(false);
            setSelectedStudentForLink(null);
            setSelectedParent(null);
        }
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <GreenButton 
                        variant="contained" 
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportStudents}
                        disabled={!studentsList || studentsList.length === 0}
                    >
                        Export Excel
                    </GreenButton>
                    <GreenButton variant="contained" onClick={() => navigate(`/Admin/class/addstudents/${selectedClass._id}`)}>
                        Add Student
                    </GreenButton>
                </Box>
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

            {/* Parent Chooser Dialog for Linking */}
            <Dialog open={linkParentOpen} onClose={() => setLinkParentOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    Link Parent to Student
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedStudentForLink && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Linking parent for student: <strong>{selectedStudentForLink.name}</strong> (Roll No: {selectedStudentForLink.rollNum})
                        </Alert>
                    )}
                    <ParentChooser
                        open={linkParentOpen}
                        onClose={() => setLinkParentOpen(false)}
                        onSelect={handleParentSelect}
                        onCreateNew={() => {
                            navigate("/Admin/addparent");
                            setLinkParentOpen(false);
                        }}
                        schoolId={currentUser._id}
                        title="Select Parent / Guardian"
                        buttonText="Select Parent"
                        selectedParent={selectedParent}
                        showCreateNew={true}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setLinkParentOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLinkStudentToParent}
                        disabled={!selectedParent || linkingInProgress}
                        startIcon={linkingInProgress ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
                    >
                        {linkingInProgress ? 'Linking...' : 'Link Parent'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ShowStudents;

