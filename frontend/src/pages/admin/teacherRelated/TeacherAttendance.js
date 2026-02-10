import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
    Box, Typography, Paper, Grid, Container, Button,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, Card, CardContent, Breadcrumbs, Link,
    Avatar, LinearProgress, MenuItem, Select, FormControl, InputLabel,
    CircularProgress, Snackbar, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { exportToExcel, getCurrentDateString, monthsList } from '../../../utils/excelExport';

// Styled Components
const GradientHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.3)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
}));

const StatsCard = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    background: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    },
}));

const GradientCard = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px',
}));

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    padding: '16px',
    '&:first-child': {
        borderRadius: '12px 0 0 0',
    },
    '&:last-child': {
        borderRadius: '0 12px 0 0',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.08)',
    },
}));

const FilterCard = styled(Paper)(({ theme }) => ({
    borderRadius: '16px',
    padding: '20px',
    background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
}));

const TeacherAttendance = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { teachersList, loading } = useSelector((state) => state.teacher);

    const [teachers, setTeachers] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
        setSnackbar({ ...snackbar, open: false, message: '' });
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
            setSnackbar({ open: true, message: 'Error loading attendance data', severity: 'error' });
        }
    };

    const handleAttendanceChange = async (teacherId, status) => {
        try {
            setSaving(true);
            setSnackbar({ ...snackbar, open: false, message: '' });

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

            setSnackbar({ open: true, message: 'Attendance saved successfully!', severity: 'success' });
        } catch (error) {
            console.error('Error saving attendance:', error);
            setSnackbar({ open: true, message: 'Error saving attendance: ' + (error.response?.data?.message || error.message), severity: 'error' });
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
            setSnackbar({ ...snackbar, open: false, message: '' });

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
                setSnackbar({ open: true, message: 'Export successful!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'No attendance data found for the selected period.', severity: 'info' });
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            setSnackbar({ open: true, message: 'Error exporting data: ' + (error.response?.data?.message || error.message), severity: 'error' });
        } finally {
            setExporting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
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

    // Calculate stats
    const presentCount = Object.values(attendanceData).filter(a => a.status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(a => a.status === 'Absent').length;
    const notMarkedCount = teachers.length - presentCount - absentCount;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
            <Container maxWidth="xl">
                {/* Gradient Header */}
                <GradientHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                            <EventIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Teacher Attendance Management
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        Track and manage teacher attendance records
                    </Typography>
                    <Breadcrumbs sx={{ color: 'white' }}>
                        <Link 
                            color="inherit" 
                            href="#"
                            onClick={(e) => { e.preventDefault(); }}
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <SchoolIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Admin Dashboard
                        </Link>
                        <Typography color="white" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon sx={{ mr: 0.5, fontSize: 20 }} />
                            Teacher Attendance
                        </Typography>
                    </Breadcrumbs>
                </GradientHeader>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#1a237e', mx: 'auto', mb: 2 }}>
                                <PeopleIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                {teachers.length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Teachers
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#4caf50', mx: 'auto', mb: 2 }}>
                                <CheckCircleIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {presentCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Present Today
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#f44336', mx: 'auto', mb: 2 }}>
                                <CancelIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                {absentCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Absent Today
                            </Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#ff9800', mx: 'auto', mb: 2 }}>
                                <EventIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                {notMarkedCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Not Marked
                            </Typography>
                        </StatsCard>
                    </Grid>
                </Grid>

                {/* Selected Date Info */}
                <GradientCard sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Attendance for {formatDate(selectedDate)}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {teachers.length} Teachers
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Chip 
                                icon={<CheckCircleIcon />} 
                                label={`Present: ${presentCount}`} 
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                            />
                            <Chip 
                                icon={<CancelIcon />} 
                                label={`Absent: ${absentCount}`} 
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                            />
                        </Box>
                    </Box>
                </GradientCard>

                {/* Filters */}
                <GlassCard sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3, display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ mr: 1 }} />
                        Filter & Export Options
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                label="Select Date"
                                InputLabelProps={{ shrink: true }}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button 
                                variant="contained"
                                fullWidth
                                onClick={fetchAttendanceForDate}
                                startIcon={<EventIcon />}
                                sx={{ 
                                    py: 1.5,
                                    bgcolor: '#1a237e', 
                                    '&:hover': { bgcolor: '#0d1b5e' },
                                    borderRadius: 2
                                }}
                            >
                                Refresh Data
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="Month"
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="">All Months</MenuItem>
                                    {monthsList.map((month) => (
                                        <MenuItem key={month} value={month}>{month}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Year"
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                onClick={handleExport}
                                disabled={exporting}
                                startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                                sx={{ 
                                    py: 1.5,
                                    borderRadius: 2
                                }}
                            >
                                {exporting ? 'Exporting...' : 'Export'}
                            </Button>
                        </Grid>
                    </Grid>
                </GlassCard>

                {/* Loading */}
                {loading && (
                    <Box sx={{ mb: 3 }}>
                        <Typography color="textSecondary" sx={{ mb: 1 }}>Loading teachers...</Typography>
                        <LinearProgress />
                    </Box>
                )}

                {/* Teachers Table */}
                <GlassCard sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell sx={{ width: '5%' }}>#</TableHeaderCell>
                                    <TableHeaderCell sx={{ width: '25%' }}>Teacher Name</TableHeaderCell>
                                    <TableHeaderCell sx={{ width: '15%' }}>Subject</TableHeaderCell>
                                    <TableHeaderCell sx={{ width: '15%' }}>Class</TableHeaderCell>
                                    <TableHeaderCell sx={{ width: '15%' }}>Status</TableHeaderCell>
                                    <TableHeaderCell sx={{ width: '25%' }}>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={48} />
                                            <Typography variant="body1" sx={{ mt: 2, color: 'textSecondary' }}>
                                                Loading teachers...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : teachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <PersonIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                                            <Typography variant="h6" color="textSecondary">
                                                No teachers found. Please add teachers first.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teachers.map((teacher, index) => {
                                        const attendance = attendanceData[teacher._id];
                                        const status = attendance?.status || 'Not Marked';
                                        
                                        return (
                                            <StyledTableRow key={teacher._id}>
                                                <TableCell>
                                                    <Chip 
                                                        label={index + 1}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: '#e8eaf6',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ width: 50, height: 50, bgcolor: '#667eea', mr: 2 }}>
                                                            <PersonIcon />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                {teacher.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {teacher.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={teacher.teachSubject?.subName || 'N/A'}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: '#e8eaf6',
                                                            color: '#1a237e'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={teacher.teachSclass?.sclassName || 'N/A'}
                                                        size="small"
                                                        sx={{ bgcolor: '#f5f5f5' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        icon={getStatusIcon(status)}
                                                        label={status}
                                                        color={getStatusColor(status)}
                                                        variant={status === 'Not Marked' ? 'outlined' : 'filled'}
                                                        size="medium"
                                                        sx={{ 
                                                            fontWeight: 'bold',
                                                            minWidth: 100
                                                        }}
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
                                                            sx={{ borderRadius: 2 }}
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
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            Absent
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </StyledTableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </GlassCard>

                {/* Saving Indicator */}
                {saving && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary" sx={{ mb: 1 }}>Saving attendance...</Typography>
                        <LinearProgress />
                    </Box>
                )}

                {/* Summary Footer */}
                {teachers.length > 0 && (
                    <GlassCard sx={{ p: 3, mt: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                            {presentCount}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Present Teachers
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
                                        <CancelIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                            {absentCount}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Absent Teachers
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                                        <EventIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                            {notMarkedCount}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Not Marked
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </GlassCard>
                )}

            </Container>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Paper 
                    onClose={handleCloseSnackbar}
                    sx={{ 
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        bgcolor: snackbar.severity === 'error' ? '#ffebee' : 
                                  snackbar.severity === 'success' ? '#e8f5e9' : '#e3f2fd'
                    }}
                >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        {snackbar.severity === 'error' && <CancelIcon color="error" sx={{ mr: 1 }} />}
                        {snackbar.severity === 'success' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
                        {snackbar.severity === 'info' && <EventIcon color="info" sx={{ mr: 1 }} />}
                        <Typography variant="body1">{snackbar.message}</Typography>
                    </Box>
                </Paper>
            </Snackbar>
        </Box>
    );
};

export default TeacherAttendance;

