import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, Card, CardContent, Breadcrumbs, Link,
    Avatar, LinearProgress, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { exportToExcel, getCurrentDateString, monthsList } from '../../../utils/excelExport';

const TeacherAttendance = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);
    const { teachersList, loading } = useSelector((state) => state.teacher);

    const [teachers, setTeachers] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [exporting, setExporting] = useState(false);

    const schoolId = currentUser?._id;

    // Generate years for dropdown
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    // Fetch teachers on component mount
    useEffect(() => {
        if (schoolId) {
            dispatch(getAllTeachers(schoolId));
        }
    }, [schoolId, dispatch]);

    // Update teachers when Redux state changes
    useEffect(() => {
        if (teachersList && Array.isArray(teachersList)) {
            setTeachers(teachersList);
        }
    }, [teachersList]);

    // Fetch attendance when date changes
    useEffect(() => {
        if (teachers.length > 0 && selectedDate) {
            fetchAttendanceForDate();
        }
    }, [selectedDate, teachers]);

    const fetchAttendanceForDate = async () => {
        setMessage({ type: '', text: '' });
        try {
            const attendanceMap = {};

            // Fetch attendance for each teacher
            for (const teacher of teachers) {
                try {
                    const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Teacher/${teacher._id}`);
                    if (result.data && result.data.attendance) {
                        // Find attendance for the selected date
                        const attendanceRecord = result.data.attendance.find(a => {
                            const attendanceDate = new Date(a.date).toISOString().split('T')[0];
                            return attendanceDate === selectedDate;
                        });

                        if (attendanceRecord) {
                            attendanceMap[teacher._id] = {
                                status: attendanceRecord.status || 'Not Marked',
                                presentCount: attendanceRecord.presentCount,
                                absentCount: attendanceRecord.absentCount
                            };
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching attendance for teacher ${teacher._id}:`, err);
                }
            }

            setAttendanceData(attendanceMap);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setMessage({ type: 'error', text: 'Error loading attendance data' });
        }
    };

const handleAttendanceChange = async (teacherId, status) => {
        try {
            setSaving(true);
            setMessage({ type: '', text: '' });

            // Calculate present and absent counts
            const presentCount = status === 'Present' ? 1 : 0;
            const absentCount = status === 'Absent' ? 1 : 0;

            // Update attendance in backend
            await axios.post(`${process.env.REACT_APP_BASE_URL}/TeacherAttendance/${teacherId}`, {
                status,
                date: selectedDate,
                presentCount,
                absentCount
            });

            // Update local state
            setAttendanceData(prev => ({
                ...prev,
                [teacherId]: {
                    status,
                    presentCount: presentCount.toString(),
                    absentCount: absentCount.toString()
                }
            }));

            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({ type: 'error', text: 'Error saving attendance: ' + (error.response?.data?.message || error.message) });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        return status === 'Present' ? 'success' : status === 'Absent' ? 'error' : 'default';
    };

    const getStatusIcon = (status) => {
        return status === 'Present' ? <CheckCircleIcon color="success" /> : 
               status === 'Absent' ? <CancelIcon color="error" /> : null;
    };

    // Export to Excel
    const handleExport = async () => {
        try {
            setExporting(true);
            setMessage({ type: '', text: '' });

            // Build query params
            let url = `${process.env.REACT_APP_BASE_URL}/Teachers/AttendanceExport/${schoolId}`;
            const queryParams = [];
            
            if (selectedMonth) {
                queryParams.push(`month=${monthsList.indexOf(selectedMonth) + 1}`);
            }
            if (selectedYear) {
                queryParams.push(`year=${selectedYear}`);
            }
            
            if (queryParams.length > 0) {
                url += '?' + queryParams.join('&');
            }

            const response = await axios.get(url);
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const fileName = `Teacher_Attendance_${selectedMonth || 'All'}_${selectedYear}_${getCurrentDateString()}`;
                exportToExcel(response.data.data, fileName, 'Teacher Attendance');
                setMessage({ type: 'success', text: 'Export successful!' });
            } else {
                setMessage({ type: 'info', text: 'No attendance data found for the selected period.' });
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            setMessage({ type: 'error', text: 'Error exporting data: ' + (error.response?.data?.message || error.message) });
        } finally {
            setExporting(false);
        }
    };

    // Render Teachers View
    const renderTeachersView = () => (
        <Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
                Teacher Attendance
            </Typography>

            {/* Date Filter */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button 
                            variant="contained" 
                            onClick={fetchAttendanceForDate}
                            startIcon={<ArrowBackIcon />}
                        >
                            Refresh Data
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Export Section */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Export Attendance Data
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                label="Month"
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <MenuItem value="">All Months</MenuItem>
                                {monthsList.map((month) => (
                                    <MenuItem key={month} value={month}>{month}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={selectedYear}
                                label="Year"
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleExport}
                            disabled={exporting}
                            startIcon={<FileDownloadIcon />}
                        >
                            {exporting ? 'Exporting...' : 'Export to Excel'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Message */}
            {message.text && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: message.type === 'error' ? '#ffebee' : message.type === 'success' ? '#e8f5e9' : '#e3f2fd' }}>
                    <Typography color={message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info'}>
                        {message.text}
                    </Typography>
                </Paper>
            )}

            {/* Loading */}
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Teachers Count Summary */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">
                            <strong>Total Teachers:</strong> {teachers.length}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" color="success.main">
                            <strong>Present:</strong> {Object.values(attendanceData).filter(a => a.status === 'Present').length}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" color="error.main">
                            <strong>Absent:</strong> {Object.values(attendanceData).filter(a => a.status === 'Absent').length}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Teachers Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#7f56da' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '5%' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '30%' }}>Teacher Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '20%' }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '20%' }}>Class</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '15%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white', width: '10%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography>Loading teachers...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">
                                        No teachers found. Please add teachers first.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            teachers.map((teacher, index) => {
                                const attendance = attendanceData[teacher._id];
                                const status = attendance?.status || 'Not Marked';
                                
                                return (
                                    <TableRow key={teacher._id} hover>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {index + 1}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: '#7f56da', width: 40, height: 40 }}>
                                                    {teacher.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {teacher.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {teacher.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {teacher.teachSubject?.subName || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={teacher.teachSclass?.sclassName || 'N/A'}
                                                size="small"
                                                sx={{ bgcolor: '#e3f2fd' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                icon={getStatusIcon(status)}
                                                label={status}
                                                color={getStatusColor(status)}
                                                variant={status === 'Not Marked' ? 'outlined' : 'filled'}
                                                size="medium"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant={status === 'Present' ? 'contained' : 'outlined'}
                                                    color="success"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleAttendanceChange(teacher._id, 'Present')}
                                                    disabled={saving}
                                                >
                                                    Present
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant={status === 'Absent' ? 'contained' : 'outlined'}
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => handleAttendanceChange(teacher._id, 'Absent')}
                                                    disabled={saving}
                                                >
                                                    Absent
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Saving Indicator */}
            {saving && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography color="textSecondary">Saving attendance...</Typography>
                    <LinearProgress />
                </Box>
            )}
        </Box>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                {renderTeachersView()}
            </Paper>
        </Container>
    );
};

export default TeacherAttendance;

