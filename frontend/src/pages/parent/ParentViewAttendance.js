import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Paper, Container, Card, CardContent,
    Grid, Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    KeyboardArrowDown, KeyboardArrowUp
} from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
    InsertChart as InsertChartIcon,
    InsertChartOutlined as InsertChartOutlinedIcon,
    TableChart as TableChartIcon,
    TableChartOutlined as TableChartOutlinedIcon
} from '@mui/icons-material';
import { getStudentAttendance } from '../../redux/studentRelated/studentHandle';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { formatNepaliDate } from '../../utils/nepaliDate';
import CustomBarChart from '../../components/CustomBarChart';

const ParentViewAttendance = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { studentId } = useParams();

    const { currentUser } = useSelector((state) => state.user);
    const { userDetails, loading, response, error } = useSelector((state) => state.user);

    const [openStates, setOpenStates] = useState({});
    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');
    const [selectedChild, setSelectedChild] = useState(studentId || '');

    // Get children list from parent dashboard data
    const { userDetails: parentUserDetails } = useSelector((state) => state.parent);

    useEffect(() => {
        if (currentUser?._id) {
            // Fetch children list first
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedChild && currentUser?.school?._id) {
            dispatch(getStudentAttendance(selectedChild, currentUser.school._id));
        }
    }, [dispatch, selectedChild, currentUser]);

    useEffect(() => {
        if (userDetails?.attendance) {
            setSubjectAttendance(userDetails.attendance);
        }
    }, [userDetails]);

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    // Group attendance by subject
    const groupAttendanceBySubject = (attendance) => {
        const grouped = {};
        attendance.forEach((record) => {
            const subName = record.subName?.subName || 'Unknown Subject';
            const subId = record.subName?._id || 'unknown';
            const subCode = record.subName?.subCode || '';
            
            if (!grouped[subName]) {
                grouped[subName] = {
                    subName,
                    subCode,
                    subId,
                    present: 0,
                    sessions: 0,
                    allData: []
                };
            }
            grouped[subName].sessions += 1;
            if (record.status === 'Present') {
                grouped[subName].present += 1;
            }
            grouped[subName].allData.push(record);
        });
        return grouped;
    };

    const calculateOverallAttendancePercentage = (attendance) => {
        if (!attendance || attendance.length === 0) return 0;
        const presentCount = attendance.filter((a) => a.status === 'Present').length;
        return (presentCount / attendance.length) * 100;
    };

    const calculateSubjectAttendancePercentage = (present, sessions) => {
        if (sessions === 0) return 0;
        return ((present / sessions) * 100).toFixed(2);
    };

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance);
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const subjectData = Object.entries(attendanceBySubject).map(([subName, data]) => ({
        subject: subName,
        attendancePercentage: calculateSubjectAttendancePercentage(data.present, data.sessions),
        totalClasses: data.sessions,
        attendedClasses: data.present
    }));

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const handleChildChange = (event) => {
        setSelectedChild(event.target.value);
        navigate(`/Parent/child/${event.target.value}/attendance`);
    };

    const getChildrenList = () => {
        if (parentUserDetails?.students) {
            return parentUserDetails.students;
        }
        if (userDetails?.students) {
            return userDetails.students;
        }
        return [];
    };

    const renderTableSection = () => {
        return (
            <Box>
                <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
                    Attendance Details
                </Typography>

                {Object.entries(attendanceBySubject).length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <StyledTableRow sx={{ bgcolor: '#7f56da' }}>
                                    <StyledTableCell sx={{ color: 'white' }}>Subject</StyledTableCell>
                                    <StyledTableCell sx={{ color: 'white' }}>Present</StyledTableCell>
                                    <StyledTableCell sx={{ color: 'white' }}>Total Sessions</StyledTableCell>
                                    <StyledTableCell sx={{ color: 'white' }}>Attendance %</StyledTableCell>
                                    <StyledTableCell align="center" sx={{ color: 'white' }}>Actions</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(attendanceBySubject).map(([subName, data], index) => {
                                    const subjectAttendancePercentage = calculateSubjectAttendancePercentage(data.present, data.sessions);
                                    const color = subjectAttendancePercentage >= 75 ? 'success' : 'warning';

                                    return (
                                        <React.Fragment key={index}>
                                            <StyledTableRow hover>
                                                <StyledTableCell>
                                                    <Typography fontWeight="bold">{subName}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {data.subCode}
                                                    </Typography>
                                                </StyledTableCell>
                                                <StyledTableCell>{data.present}</StyledTableCell>
                                                <StyledTableCell>{data.sessions}</StyledTableCell>
                                                <StyledTableCell>
                                                    <Chip 
                                                        label={`${subjectAttendancePercentage}%`}
                                                        color={color}
                                                        size="small"
                                                    />
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    <Button 
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleOpen(data.subId)}
                                                        startIcon={openStates[data.subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                    >
                                                        Details
                                                    </Button>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                            <TableRow>
                                                <StyledTableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                    <Box sx={{ margin: 1 }}>
                                                        <Typography variant="h6" gutterBottom component="div">
                                                            Session Details
                                                        </Typography>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <StyledTableRow>
                                                                    <StyledTableCell>Date</StyledTableCell>
                                                                    <StyledTableCell align="right">Status</StyledTableCell>
                                                                </StyledTableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {data.allData.map((record, idx) => {
                                                                    const date = new Date(record.date);
                                                                    const dateString = date.toString() !== 'Invalid Date' 
                                                                        ? formatNepaliDate(date, { format: 'full', showDayName: false })
                                                                        : 'Invalid Date';
                                                                    return (
                                                                        <StyledTableRow key={idx}>
                                                                            <StyledTableCell component="th" scope="row">
                                                                                {dateString}
                                                                            </StyledTableCell>
                                                                            <StyledTableCell align="right">
                                                                                <Chip 
                                                                                    label={record.status}
                                                                                    color={record.status === 'Present' ? 'success' : 'error'}
                                                                                    size="small"
                                                                                />
                                                                            </StyledTableCell>
                                                                        </StyledTableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                </StyledTableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            No attendance records found
                        </Typography>
                    </Card>
                )}

                <Paper sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" align="center">
                        Overall Attendance: 
                        <Chip 
                            label={`${overallAttendancePercentage.toFixed(2)}%`}
                            color={overallAttendancePercentage >= 75 ? 'success' : 'warning'}
                            sx={{ ml: 2 }}
                        />
                    </Typography>
                </Paper>
            </Box>
        );
    };

    const renderChartSection = () => {
        return (
            <Box>
                <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
                    Attendance Chart
                </Typography>
                {subjectData.length > 0 ? (
                    <Paper sx={{ p: 3 }}>
                        <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                    </Paper>
                ) : (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            No data available for chart
                        </Typography>
                    </Card>
                )}
            </Box>
        );
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    const children = getChildrenList();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                View Attendance
            </Typography>

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
                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                        <>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}

                            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                                <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                    <BottomNavigationAction
                                        label="Table"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <BottomNavigationAction
                                        label="Chart"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </BottomNavigation>
                            </Paper>
                        </>
                    ) : (
                        <Card sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary">
                                No attendance records found for this student
                            </Typography>
                        </Card>
                    )}
                </>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        Please select a child to view their attendance
                    </Typography>
                </Card>
            )}
        </Container>
    );
};

export default ParentViewAttendance;

