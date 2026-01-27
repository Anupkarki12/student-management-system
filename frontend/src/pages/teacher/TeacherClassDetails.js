
import { useEffect, useState } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem, Alert, Grid, Card, CardContent } from '@mui/material';
import { BlackButton, BlueButton} from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from 'axios';
import ClassIcon from '@mui/icons-material/Class';

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const params = useParams();
    const classID = params.id;

    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);
    
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(classID || '');
    const [classSubjects, setClassSubjects] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    const teacherId = currentUser?._id;

    // Fetch teacher classes once on mount
    useEffect(() => {
        if (teacherId) {
            fetchTeacherClasses();
        }
    }, [teacherId]);

    useEffect(() => {
        if (selectedClassId) {
            dispatch(getClassStudents(selectedClassId));
            fetchClassSubjects();
        }
    }, [dispatch, selectedClassId]);

    const fetchTeacherClasses = async () => {
        try {
            const apiUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const result = await axios.get(`${apiUrl}/Teacher/Classes/${teacherId}`);
            if (Array.isArray(result.data) && result.data.length > 0) {
                setTeacherClasses(result.data);
                // If no class selected and we have classes, select the first one
                if (!selectedClassId && !classID) {
                    setSelectedClassId(result.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
        }
    };

    const fetchClassSubjects = async () => {
        try {
            const apiUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const result = await axios.get(`${apiUrl}/Teacher/Subjects/${teacherId}/${selectedClassId}`);
            if (Array.isArray(result.data)) {
                setClassSubjects(result.data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleClassChange = (newClassId) => {
        setSelectedClassId(newClassId);
        navigate(`/Teacher/class/${newClassId}`);
    };

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents && sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];

        const [open, setOpen] = React.useState(false);
        const anchorRef = React.useRef(null);
        const [selectedIndex, setSelectedIndex] = React.useState(0);

        const handleClick = () => {
            console.info(`You clicked ${options[selectedIndex]}`);
            if (selectedIndex === 0) {
                handleAttendance();
            } else if (selectedIndex === 1) {
                handleMarks();
            }
        };

        const handleAttendance = () => {
            navigate(`/Teacher/attendance?classId=${selectedClassId}`)
        }
        const handleMarks = () => {
            navigate(`/Teacher/marks?classId=${selectedClassId}`)
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
                <BlueButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Teacher/class/student/" + row.id)
                    }
                >
                    View
                </BlueButton>
                <React.Fragment>
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                        <Button onClick={handleClick}>{options[selectedIndex]}</Button>
                        <BlackButton
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </BlackButton>
                    </ButtonGroup>
                    <Popper
                        sx={{ zIndex: 1 }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </>
        );
    };

    return (
        <>
            {loading && teacherClasses.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <Typography>Loading...</Typography>
                </Box>
            ) : (
                <>
                    <Typography variant="h4" align="center" gutterBottom>
                        Class Details
                    </Typography>

                    {/* Class Selection */}
                    {teacherClasses.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Select Class:</Typography>
                            <Grid container spacing={2}>
                                {teacherClasses.map((cls) => (
                                    <Grid item xs={12} sm={6} md={4} key={cls._id}>
                                        <Card 
                                            sx={{ 
                                                cursor: 'pointer',
                                                bgcolor: selectedClassId === cls._id ? 'primary.main' : 'inherit',
                                                color: selectedClassId === cls._id ? 'white' : 'inherit',
                                                '&:hover': { bgcolor: selectedClassId === cls._id ? 'primary.dark' : 'action.hover' }
                                            }}
                                            onClick={() => handleClassChange(cls._id)}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <ClassIcon sx={{ mr: 1 }} />
                                                    <Typography variant="h6">Class {cls.sclassName}</Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {cls.subjects?.length > 0 ? (
                                                        <Box>
                                                            <Typography variant="caption" color="textSecondary">
                                                                Subjects:
                                                            </Typography>
                                                            {cls.subjects.map((sub, idx) => (
                                                                <Typography key={sub._id || idx} variant="body2">
                                                                    • {sub.subName}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        'No subjects assigned'
                                                    )}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {selectedClassId && (
                        <>
                            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                                Students List:
                            </Typography>

                            {getresponse ? (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                                    <Typography color="textSecondary">No students found in this class</Typography>
                                </Paper>
                            ) : (
                                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                    {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                                    }
                                </Paper>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default TeacherClassDetails;

