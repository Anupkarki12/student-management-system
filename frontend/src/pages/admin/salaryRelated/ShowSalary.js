import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, Card, CardContent, Avatar, Divider, LinearProgress,
    Tooltip, Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowBack,
    Payment,
    Visibility,
    CheckCircle,
    Person,
    Refresh
} from '@mui/icons-material';
import {
    getAllSalaryRecords,
    deleteSalaryRecord
} from '../../../redux/salaryRelated/salaryHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSimpleStaffs } from '../../../redux/staffRelated/staffHandle';
import { underControl } from '../../../redux/salaryRelated/salarySlice';
import Popup from '../../../components/Popup';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const ShowSalary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentUser } = useSelector(state => state.user);
    const { salaryRecords, loading, error, success, response } = useSelector(state => state.salary);

    // Ensure salaryRecords is always an array
    const safeSalaryRecords = Array.isArray(salaryRecords) ? salaryRecords : [];

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);

    const schoolId = currentUser?._id;

    // Get teacher and staff counts from Redux state
    const { teachersList } = useSelector(state => state.teacher);
    const { staffList } = useSelector(state => state.staff);
    
    const safeTeachers = Array.isArray(teachersList) ? teachersList : [];
    const safeStaffs = Array.isArray(staffList) ? staffList : [];
    
    const totalTeachers = safeTeachers.length;
    const totalStaffs = safeStaffs.length;

    // Manual refresh function
    const handleRefresh = () => {
        if (schoolId) {
            console.log('Manual refresh triggered for school:', schoolId);
            dispatch(getAllSalaryRecords(schoolId));
            dispatch(getAllTeachers(schoolId));
            dispatch(getAllSimpleStaffs(schoolId));
        }
    };

    useEffect(() => {
        if (schoolId) {
            console.log('Fetching salary records for school:', schoolId);
            dispatch(getAllSalaryRecords(schoolId));
            // Also fetch teachers and staff counts
            dispatch(getAllTeachers(schoolId));
            dispatch(getAllSimpleStaffs(schoolId));
        } else {
            console.error('School ID not available:', currentUser);
            setMessage('Error: School ID is missing. Please log in again.');
            setShowPopup(true);
        }
    }, [schoolId, dispatch, currentUser]);

    useEffect(() => {
        if (success) {
            setMessage(response || 'Operation completed successfully');
            setShowPopup(true);
            dispatch(underControl());
            setProcessing(false);
            dispatch(getAllSalaryRecords(schoolId));
        }
    }, [success, response, dispatch, schoolId]);

    useEffect(() => {
        if (error) {
            setMessage(error);
            setShowPopup(true);
            setProcessing(false);
        }
    }, [error]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record?')) {
            setProcessing(true);
            try {
                await dispatch(deleteSalaryRecord(id));
            } catch (err) {
                setProcessing(false);
            }
        }
    };

    const viewPaymentHistory = (record) => {
        setSelectedRecord(record);
        setOpenDialog(true);
    };

    const calculateNetSalary = (record) => {
        const allowances = (record.allowances?.houseRent || 0) +
            (record.allowances?.medical || 0) +
            (record.allowances?.transport || 0) +
            (record.allowances?.other || 0);
        const deductions = (record.deductions?.providentFund || 0) +
            (record.deductions?.tax || 0) +
            (record.deductions?.insurance || 0) +
            (record.deductions?.other || 0);
        return record.baseSalary + allowances - deductions;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getPaymentStatus = (record) => {
        if (!record.paymentHistory || record.paymentHistory.length === 0) {
            return { status: 'No Payments', color: 'default' };
        }
        const latestPayment = record.paymentHistory[record.paymentHistory.length - 1];
        return { 
            status: latestPayment.status, 
            color: getStatusColor(latestPayment.status),
            date: latestPayment.paymentDate
        };
    };

// Calculate summary counts - handle case-insensitive and missing values
    const teacherRecords = safeSalaryRecords.filter(r => 
        r.employeeType && r.employeeType.toLowerCase() === 'teacher'
    ).length;
    const staffRecords = safeSalaryRecords.filter(r => 
        r.employeeType && r.employeeType.toLowerCase() === 'staff'
    ).length;
    const totalRecords = safeSalaryRecords.length;

    // Calculate total salary amounts from teachers and staff with salary data
    const totalTeacherSalary = safeTeachers.reduce((sum, t) => {
        if (t.salary && t.salary.baseSalary > 0) {
            return sum + (t.salary.netSalary || t.salary.baseSalary || 0);
        }
        return sum;
    }, 0);
    
    const totalStaffSalary = safeStaffs.reduce((sum, s) => {
        if (s.salary && s.salary.baseSalary > 0) {
            return sum + (s.salary.netSalary || s.salary.baseSalary || 0);
        }
        return sum;
    }, 0);

// Teachers with salary configured
    const teachersWithSalary = safeTeachers.filter(t => t.salary && t.salary.baseSalary > 0);
    const staffWithSalary = safeStaffs.filter(s => s.salary && s.salary.baseSalary > 0);

    // Month/Year filter state
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');

    // Month options
    const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = ['All', ...Array.from({ length: 10 }, (_, i) => currentYear - i)];

    // Filter salary records by month and year
    const filteredSalaryRecords = safeSalaryRecords.filter(record => {
        if (selectedMonth === 'All' && selectedYear === 'All') return true;
        
        if (!record.paymentHistory || record.paymentHistory.length === 0) {
            return selectedMonth === 'All' && selectedYear === 'All';
        }
        
        return record.paymentHistory.some(payment => {
            const monthMatch = selectedMonth === 'All' || payment.month === selectedMonth;
            const yearMatch = selectedYear === 'All' || payment.year.toString() === selectedYear;
            return monthMatch && yearMatch;
        });
    });

    // Calculate filtered totals
    const filteredTotalSalary = filteredSalaryRecords.reduce((sum, record) => {
        const allowances = (record.allowances?.houseRent || 0) +
            (record.allowances?.medical || 0) +
            (record.allowances?.transport || 0) +
            (record.allowances?.other || 0);
        const deductions = (record.deductions?.providentFund || 0) +
            (record.deductions?.tax || 0) +
            (record.deductions?.insurance || 0) +
            (record.deductions?.other || 0);
        return sum + record.baseSalary + allowances - deductions;
    }, 0);

    const filteredTeacherRecords = filteredSalaryRecords.filter(r => 
        r.employeeType && r.employeeType.toLowerCase() === 'teacher'
    ).length;
    
    const filteredStaffRecords = filteredSalaryRecords.filter(r => 
        r.employeeType && r.employeeType.toLowerCase() === 'staff'
    ).length;

    // Debug logging
    console.log('Salary records data:', {
        total: totalRecords,
        teachers: teacherRecords,
        staff: staffRecords,
        totalTeachers: totalTeachers,
        totalStaffs: totalStaffs,
        teachersWithSalary: teachersWithSalary.length,
        staffWithSalary: staffWithSalary.length,
        filteredCount: filteredSalaryRecords.length
    });

    if (loading && !safeSalaryRecords.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading salary records...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/Admin/dashboard')}
                    variant="outlined"
                >
                    Dashboard
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    Salary Records
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={handleRefresh}
                        color="info"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/Admin/salary/add')}
                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6b45c8' } }}
                    >
                        Add Salary
                    </Button>
                </Box>
            </Box>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMessage('')}>
                    <Typography variant="subtitle2">Error fetching salary records:</Typography>
                    <Typography variant="body2">{error}</Typography>
                    <Button 
                        size="small" 
                        variant="text" 
                        color="inherit" 
                        onClick={handleRefresh}
                        sx={{ mt: 1 }}
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

{/* Summary Cards - Total Records for Teachers and Staff */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Total Records Summary
            </Typography>
            
            {/* Month/Year Filter */}
            <Card sx={{ mb: 3, bgcolor: '#fafafa' }}>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Filter by Month/Year
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="Month"
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    {months.map((month) => (
                                        <MenuItem key={month} value={month}>
                                            {month === 'All' ? 'All Months' : month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Year"
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year === 'All' ? 'All Years' : year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                onClick={() => {
                                    setSelectedMonth('All');
                                    setSelectedYear('All');
                                }}
                            >
                                Clear Filter
                            </Button>
                        </Grid>
                    </Grid>
                    
                    {/* Filtered Summary */}
                    {(selectedMonth !== 'All' || selectedYear !== 'All') && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                                Filtered Results for: {selectedMonth === 'All' ? 'All Months' : selectedMonth} / {selectedYear === 'All' ? 'All Years' : selectedYear}
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">Records</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{filteredSalaryRecords.length}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">Teachers</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>{filteredTeacherRecords}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" color="textSecondary">Staff</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{filteredStaffRecords}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Payment color="primary" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Salary Records
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                {totalRecords}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="success" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Teachers
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'success.main' }}>
                                {totalTeachers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="warning" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Staff
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'warning.main' }}>
                                {totalStaffs}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

{/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                        Debug: Salary Records={totalRecords}, Teachers={totalTeachers}, Staff={totalStaffs}
                    </Typography>
                </Box>
            )}

            {/* Teachers Salary Details Section */}
            {teachersWithSalary.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                        Teachers Salary Details
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                    <TableCell>Teacher Name</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell align="right">Base Salary</TableCell>
                                    <TableCell align="right">Allowances</TableCell>
                                    <TableCell align="right">Deductions</TableCell>
                                    <TableCell align="right">Net Salary</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teachersWithSalary.map((teacher) => {
                                    const allowances = (teacher.salary?.allowances?.houseRent || 0) +
                                        (teacher.salary?.allowances?.medical || 0) +
                                        (teacher.salary?.allowances?.transport || 0) +
                                        (teacher.salary?.allowances?.other || 0);
                                    const deductions = (teacher.salary?.deductions?.providentFund || 0) +
                                        (teacher.salary?.deductions?.tax || 0) +
                                        (teacher.salary?.deductions?.insurance || 0) +
                                        (teacher.salary?.deductions?.other || 0);
                                    const netSalary = teacher.salary?.netSalary || teacher.salary?.baseSalary || 0;

                                    return (
                                        <TableRow key={teacher._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                                                        {teacher.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            {teacher.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {teacher.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{teacher.teachSubject?.subName || 'N/A'}</TableCell>
                                            <TableCell align="right">{formatCurrency(teacher.salary?.baseSalary || 0)}</TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main' }}>
                                                +{formatCurrency(allowances)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'error.main' }}>
                                                -{formatCurrency(deductions)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {formatCurrency(netSalary)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Staff Salary Details Section */}
            {staffWithSalary.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                        Staff Salary Details
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                                    <TableCell>Staff Name</TableCell>
                                    <TableCell>Position</TableCell>
                                    <TableCell align="right">Base Salary</TableCell>
                                    <TableCell align="right">Allowances</TableCell>
                                    <TableCell align="right">Deductions</TableCell>
                                    <TableCell align="right">Net Salary</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {staffWithSalary.map((staff) => {
                                    const allowances = (staff.salary?.allowances?.houseRent || 0) +
                                        (staff.salary?.allowances?.medical || 0) +
                                        (staff.salary?.allowances?.transport || 0) +
                                        (staff.salary?.allowances?.other || 0);
                                    const deductions = (staff.salary?.deductions?.providentFund || 0) +
                                        (staff.salary?.deductions?.tax || 0) +
                                        (staff.salary?.deductions?.insurance || 0) +
                                        (staff.salary?.deductions?.other || 0);
                                    const netSalary = staff.salary?.netSalary || staff.salary?.baseSalary || 0;

                                    return (
                                        <TableRow key={staff._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main', fontSize: 14 }}>
                                                        {staff.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            {staff.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {staff.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{staff.position || 'N/A'}</TableCell>
                                            <TableCell align="right">{formatCurrency(staff.salary?.baseSalary || 0)}</TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main' }}>
                                                +{formatCurrency(allowances)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'error.main' }}>
                                                -{formatCurrency(deductions)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {formatCurrency(netSalary)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

{/* Salary Records Table */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                Salary Payment Records
                {(selectedMonth !== 'All' || selectedYear !== 'All') && (
                    <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        (Filtered: {selectedMonth === 'All' ? 'All Months' : selectedMonth} / {selectedYear === 'All' ? 'All Years' : selectedYear})
                    </Typography>
                )}
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>Employee</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell align="right">Base Salary</TableCell>
                            <TableCell align="right">Allowances</TableCell>
                            <TableCell align="right">Deductions</TableCell>
                            <TableCell align="right">Net Salary</TableCell>
                            <TableCell>Payment Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSalaryRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Payment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary" gutterBottom>
                                            {selectedMonth !== 'All' || selectedYear !== 'All' 
                                                ? 'No salary records found for the selected month/year'
                                                : 'No Salary Records Found'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                            {selectedMonth !== 'All' || selectedYear !== 'All'
                                                ? 'Try selecting a different month/year or clear the filter.'
                                                : 'You need to create salary records for your teachers and staff.'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {(selectedMonth !== 'All' || selectedYear !== 'All') && (
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setSelectedMonth('All');
                                                        setSelectedYear('All');
                                                    }}
                                                >
                                                    Clear Filter
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => navigate('/Admin/salary/add')}
                                                sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6b45c8' } }}
                                            >
                                                Add Salary Records
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Refresh />}
                                                onClick={handleRefresh}
                                            >
                                                Refresh
                                            </Button>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSalaryRecords.map((record) => {
                                const allowances = (record.allowances?.houseRent || 0) +
                                    (record.allowances?.medical || 0) +
                                    (record.allowances?.transport || 0) +
                                    (record.allowances?.other || 0);
                                const deductions = (record.deductions?.providentFund || 0) +
                                    (record.deductions?.tax || 0) +
                                    (record.deductions?.insurance || 0) +
                                    (record.deductions?.other || 0);
                                const netSalary = record.baseSalary + allowances - deductions;
                                const paymentStatus = getPaymentStatus(record);

                                return (
                                    <TableRow key={record._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {record.employee?.name?.charAt(0) || '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {record.employee?.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {record.employee?.email || ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={record.employeeType} 
                                                color={record.employeeType === 'teacher' ? 'primary' : 'secondary'}
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>{record.position}</TableCell>
                                        <TableCell align="right">
                                            {formatCurrency(record.baseSalary)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                            +{formatCurrency(allowances)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'error.main' }}>
                                            -{formatCurrency(deductions)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(netSalary)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={paymentStatus.status} 
                                                color={paymentStatus.color}
                                                size="small"
                                                icon={paymentStatus.status === 'paid' ? <CheckCircle /> : undefined}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                <Tooltip title="View Payment History">
                                                    <IconButton 
                                                        size="small" 
                                                        color="info"
                                                        onClick={() => viewPaymentHistory(record)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Add Payment">
                                                    <IconButton 
                                                        size="small" 
                                                        color="success"
                                                        onClick={() => navigate('/Admin/salary/add')}
                                                    >
                                                        <Payment />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => handleDelete(record._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Processing Indicator */}
            {processing && <LinearProgress sx={{ mt: 2 }} />}

            {/* Payment History Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Payment History
                    <Typography variant="subtitle2" color="textSecondary">
                        {selectedRecord?.employee?.name} - {selectedRecord?.position}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    {selectedRecord && (
                        <Box>
                            {/* Salary Summary */}
                            <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="caption" color="textSecondary">
                                                Base Salary
                                            </Typography>
                                            <Typography variant="h6">
                                                {formatCurrency(selectedRecord.baseSalary)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="caption" color="textSecondary">
                                                Allowances
                                            </Typography>
                                            <Typography variant="h6" color="success.main">
                                                +{formatCurrency(
                                                    (selectedRecord.allowances?.houseRent || 0) +
                                                    (selectedRecord.allowances?.medical || 0) +
                                                    (selectedRecord.allowances?.transport || 0) +
                                                    (selectedRecord.allowances?.other || 0)
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="caption" color="textSecondary">
                                                Deductions
                                            </Typography>
                                            <Typography variant="h6" color="error.main">
                                                -{formatCurrency(
                                                    (selectedRecord.deductions?.providentFund || 0) +
                                                    (selectedRecord.deductions?.tax || 0) +
                                                    (selectedRecord.deductions?.insurance || 0) +
                                                    (selectedRecord.deductions?.other || 0)
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="caption" color="textSecondary">
                                                Net Salary
                                            </Typography>
                                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(calculateNetSalary(selectedRecord))}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Payment History Table */}
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Payment History
                            </Typography>
                            {selectedRecord.paymentHistory && selectedRecord.paymentHistory.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                                <TableCell>Month</TableCell>
                                                <TableCell>Year</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell>Payment Date</TableCell>
                                                <TableCell>Method</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[...selectedRecord.paymentHistory].reverse().map((payment, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{payment.month}</TableCell>
                                                    <TableCell>{payment.year}</TableCell>
                                                    <TableCell align="right">
                                                        {formatCurrency(payment.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.paymentMethod || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={payment.status} 
                                                            color={getStatusColor(payment.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="textSecondary">
                                    No payment history found.
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Popup Messages */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowSalary;

