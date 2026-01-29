import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Tabs, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Checkbox, Button, Chip,
    TextField, MenuItem, Select, FormControl, InputLabel, Avatar,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Card, CardContent, LinearProgress, Alert, Snackbar,
    Tooltip, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
    Person, AttachMoney, CheckCircle, Pending, CalendarMonth,
    FilterList, Payment, ArrowBack, Info, Refresh, Today,
    Event, ArrowDropDown, ArrowDropUp
} from '@mui/icons-material';
import {
    getEmployeesWithSalaryStatus,
    bulkSalaryPayment,
    createOrUpdateSalary
} from '../../../redux/salaryRelated/salaryHandle';
import Popup from '../../../components/Popup';
import { underControl, clearEmployees } from '../../../redux/salaryRelated/salarySlice';

// Month options
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Get current and past years
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

// Helper function to get month name from index
const getMonthName = (monthIndex) => {
    return months[monthIndex] || months[new Date().getMonth()];
};

// Helper to check if selected period is current month/year
const isCurrentPeriod = (month, year) => {
    const currentMonth = months[new Date().getMonth()];
    return month === currentMonth && year === currentYear;
};

const AddSalary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { currentUser } = useSelector(state => state.user);
    const { employeesWithSalary, loading, error, success, response } = useSelector(state => state.salary);

    const [tabValue, setTabValue] = useState(0);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [month, setMonth] = useState(months[new Date().getMonth()]);
    const [year, setYear] = useState(currentYear);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryFormData, setSalaryFormData] = useState({
        baseSalary: '',
        houseRent: '0',
        medical: '0',
        transport: '0',
        other: '0',
        providentFund: '0',
        tax: '0',
        insurance: '0',
        otherDeduction: '0'
    });
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Get current date formatted
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const shortDate = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const schoolId = currentUser?._id;

    useEffect(() => {
        if (schoolId) {
            console.log('Fetching employees for school:', schoolId, 'month:', month, 'year:', year);
            fetchEmployees();
        } else {
            console.error('School ID not available:', currentUser);
            setMessage('Error: School ID is missing. Please log in again.');
            setShowPopup(true);
        }
    }, [schoolId, tabValue, month, year, currentUser]);

    useEffect(() => {
        if (success) {
            setMessage(response?.message || 'Operation completed successfully');
            setShowPopup(true);
            dispatch(underControl());
            setProcessing(false);
            // Clear selected employees and refresh data without browser refresh
            setSelectedEmployees([]);
            setSelectAll(false);
            // Clear employees state and fetch fresh data
            dispatch(clearEmployees());
            setTimeout(() => {
                dispatch(getEmployeesWithSalaryStatus(schoolId, tabValue === 0 ? 'teacher' : 'staff', month, year));
            }, 50);
        }
    }, [success, response, dispatch, schoolId, tabValue, month, year]);

    useEffect(() => {
        if (error) {
            setMessage(error);
            setShowPopup(true);
            setProcessing(false);
        }
    }, [error]);

    const fetchEmployees = () => {
        const employeeType = tabValue === 0 ? 'teacher' : 'staff';
        console.log(`Fetching ${employeeType}s for school: ${schoolId}, month: ${month}, year: ${year}`);
        
        if (!schoolId) {
            console.error('Cannot fetch employees: schoolId is missing');
            setMessage('Error: School ID is missing. Please log in again.');
            setShowPopup(true);
            return;
        }
        
        // Clear current employees before fetching new data (fix for old data display issue)
        dispatch(clearEmployees());
        
        // Small delay to allow state to clear before new data arrives
        setTimeout(() => {
            dispatch(getEmployeesWithSalaryStatus(schoolId, employeeType, month, year));
        }, 50);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSelectedEmployees([]);
        setSelectAll(false);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees([]);
        } else {
            const allIds = employeesWithSalary.map(emp => emp._id);
            setSelectedEmployees(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectEmployee = (employeeId) => {
        if (selectedEmployees.includes(employeeId)) {
            setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
        } else {
            setSelectedEmployees([...selectedEmployees, employeeId]);
        }
        setSelectAll(selectedEmployees.length === employeesWithSalary.length);
    };

    const openSalarySetup = (employee) => {
        setSelectedEmployee(employee);
        if (employee.hasSalaryRecord) {
            setSalaryFormData({
                baseSalary: employee.baseSalary?.toString() || '',
                houseRent: employee.totalAllowances > 0 ? Math.round(employee.totalAllowances * 0.3).toString() : '0',
                medical: employee.totalAllowances > 0 ? Math.round(employee.totalAllowances * 0.1).toString() : '0',
                transport: employee.totalAllowances > 0 ? Math.round(employee.totalAllowances * 0.1).toString() : '0',
                other: (employee.totalAllowances - Math.round(employee.totalAllowances * 0.5)).toString() || '0',
                providentFund: employee.totalDeductions > 0 ? Math.round(employee.totalDeductions * 0.5).toString() : '0',
                tax: employee.totalDeductions > 0 ? Math.round(employee.totalDeductions * 0.3).toString() : '0',
                insurance: employee.totalDeductions > 0 ? Math.round(employee.totalDeductions * 0.2).toString() : '0',
                otherDeduction: (employee.totalDeductions - Math.round(employee.totalDeductions)).toString() || '0'
            });
        } else {
            setSalaryFormData({
                baseSalary: '',
                houseRent: '0',
                medical: '0',
                transport: '0',
                other: '0',
                providentFund: '0',
                tax: '0',
                insurance: '0',
                otherDeduction: '0'
            });
        }
        setOpenSalaryDialog(true);
    };

    const handleSaveSalary = async () => {
        if (!salaryFormData.baseSalary) {
            setMessage('Please enter base salary');
            setShowPopup(true);
            return;
        }

        setProcessing(true);
        const salaryData = {
            school: schoolId,
            employeeType: selectedEmployee.employeeType,
            employeeId: selectedEmployee._id,
            position: selectedEmployee.position,
            baseSalary: parseFloat(salaryFormData.baseSalary),
            allowances: {
                houseRent: parseFloat(salaryFormData.houseRent) || 0,
                medical: parseFloat(salaryFormData.medical) || 0,
                transport: parseFloat(salaryFormData.transport) || 0,
                other: parseFloat(salaryFormData.other) || 0
            },
            deductions: {
                providentFund: parseFloat(salaryFormData.providentFund) || 0,
                tax: parseFloat(salaryFormData.tax) || 0,
                insurance: parseFloat(salaryFormData.insurance) || 0,
                other: parseFloat(salaryFormData.otherDeduction) || 0
            }
        };

        console.log('Creating/updating salary for employee:', selectedEmployee?._id);
        console.log('Salary data:', salaryData);

        try {
            const result = await dispatch(createOrUpdateSalary(salaryData));
            console.log('Salary create/update result:', result);
            
            // Close dialog and reset states only after successful response
            setOpenSalaryDialog(false);
            setProcessing(false);
            
            // Show success message
            setMessage(selectedEmployee?.hasSalaryRecord ? 'Salary updated successfully' : 'Salary created successfully');
            setShowPopup(true);
            
            // Refresh employee list to show updated salary
            fetchEmployees();
        } catch (err) {
            console.error('Error creating/updating salary:', err);
            setProcessing(false);
            // Error will be shown via the error useEffect
        }
    };

    const handleBulkPayment = () => {
        if (selectedEmployees.length === 0) {
            setMessage('Please select at least one employee');
            setShowPopup(true);
            return;
        }
        setOpenPaymentDialog(true);
    };

    const processPayment = async () => {
        setProcessing(true);
        setOpenPaymentDialog(false);

        const selectedEmpData = employeesWithSalary
            .filter(emp => selectedEmployees.includes(emp._id))
            .map(emp => ({
                employeeId: emp._id,
                employeeType: emp.employeeType,
                salaryId: emp.salaryId,
                amount: emp.netSalary || emp.baseSalary || 0
            }));

        const paymentData = {
            schoolId,
            month,
            year,
            payments: selectedEmpData,
            paymentMethod
        };

        try {
            const result = await dispatch(bulkSalaryPayment(paymentData));
            console.log('Bulk payment result:', result);
            
            // Reset processing state
            setProcessing(false);
            setSelectedEmployees([]);
            setSelectAll(false);
            
            // Show success message
            setMessage(`Payment successful for ${selectedEmpData.length} employees`);
            setShowPopup(true);
            
            // Refresh employee list immediately to show updated status
            fetchEmployees();
        } catch (err) {
            console.error('Error processing bulk payment:', err);
            setProcessing(false);
            setMessage('Payment failed. Please try again.');
            setShowPopup(true);
        }
    };

    const handleSinglePayment = (employee) => {
        setSelectedEmployee(employee);
        setOpenPaymentDialog(true);
    };

    const processSinglePayment = async () => {
        if (!selectedEmployee) return;

        setProcessing(true);
        setOpenPaymentDialog(false);

        const paymentData = {
            schoolId,
            month,
            year,
            payments: [{
                employeeId: selectedEmployee._id,
                employeeType: selectedEmployee.employeeType,
                salaryId: selectedEmployee.salaryId,
                amount: selectedEmployee.netSalary || selectedEmployee.baseSalary || 0
            }],
            paymentMethod
        };

        try {
            const result = await dispatch(bulkSalaryPayment(paymentData));
            console.log('Single payment result:', result);
            
            // Reset processing state
            setProcessing(false);
            setSelectedEmployee(null);
            
            // Show success message
            setMessage(`Payment successful for ${selectedEmployee.name}`);
            setShowPopup(true);
            
            // Refresh employee list immediately to show updated status
            fetchEmployees();
        } catch (err) {
            console.error('Error processing single payment:', err);
            setProcessing(false);
            setMessage('Payment failed. Please try again.');
            setShowPopup(true);
        }
    };

    const calculateNetSalary = () => {
        const base = parseFloat(salaryFormData.baseSalary) || 0;
        const allowances = (parseFloat(salaryFormData.houseRent) || 0) +
            (parseFloat(salaryFormData.medical) || 0) +
            (parseFloat(salaryFormData.transport) || 0) +
            (parseFloat(salaryFormData.other) || 0);
        const deductions = (parseFloat(salaryFormData.providentFund) || 0) +
            (parseFloat(salaryFormData.tax) || 0) +
            (parseFloat(salaryFormData.insurance) || 0) +
            (parseFloat(salaryFormData.otherDeduction) || 0);
        return base + allowances - deductions;
    };

    const getSelectedTotal = () => {
        return employeesWithSalary
            .filter(emp => selectedEmployees.includes(emp._id))
            .reduce((sum, emp) => sum + (emp.netSalary || emp.baseSalary || 0), 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusChip = (lastPaymentStatus) => {
        switch (lastPaymentStatus) {
            case 'paid':
                return <Chip icon={<CheckCircle />} label="Paid" color="success" size="small" />;
            case 'pending':
                return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
            default:
                return <Chip label="No Record" color="default" size="small" />;
        }
    };

    if (loading && !employeesWithSalary.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading employees...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/Admin/salary')}
                    variant="outlined"
                >
                    Back
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    Salary Management
                </Typography>
                <Tooltip title="Refresh data">
                    <IconButton onClick={fetchEmployees} color="primary">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Enhanced Month/Year Selection Card with Current Date Display */}
            <Card sx={{ 
                mb: 3, 
                background: isCurrentPeriod(month, year) 
                    ? 'linear-gradient(135deg, #081346 0%, #764ba2 100%)' 
                    : 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <CalendarMonth sx={{ fontSize: 120 }} />
                </Box>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Current Date Display */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Today sx={{ fontSize: 24 }} />
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Current Date
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Event sx={{ fontSize: 20 }} />
                                {isMobile ? shortDate : formattedDate}
                            </Typography>
                            {isCurrentPeriod(month, year) && (
                                <Chip 
                                    label="Current Month" 
                                    size="small" 
                                    sx={{ 
                                        mt: 1, 
                                        bgcolor: 'rgba(255,255,255,0.2)', 
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                    icon={<CheckCircle sx={{ color: '#4caf50 !important' }} />}
                                />
                            )}
                        </Grid>

                        {/* Payment Period Selector */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarMonth sx={{ fontSize: 24 }} />
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Payment Period
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <FormControl 
                                    size="small" 
                                    sx={{ 
                                        minWidth: 130,
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            '& .MuiSelect-icon': { color: 'white' },
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                                    }}
                                >
                                    <InputLabel>Month</InputLabel>
                                    <Select
                                        value={month}
                                        label="Month"
                                        onChange={(e) => setMonth(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: 'white',
                                                    color: 'text.primary',
                                                    '& .MuiMenuItem-root:hover': {
                                                        bgcolor: 'rgba(102, 126, 234, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {months.map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl 
                                    size="small" 
                                    sx={{ 
                                        minWidth: 100,
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            '& .MuiSelect-icon': { color: 'white' },
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: 'white' }
                                    }}
                                >
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        value={year}
                                        label="Year"
                                        onChange={(e) => setYear(e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    bgcolor: 'white',
                                                    color: 'text.primary',
                                                    '& .MuiMenuItem-root:hover': {
                                                        bgcolor: 'rgba(102, 126, 234, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {years.map((y) => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            {/* Quick Selection Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        setMonth(months[new Date().getMonth()]);
                                        setYear(currentYear);
                                    }}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.75rem',
                                        py: 0.5,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    Current Month
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        const lastMonthIndex = new Date().getMonth() - 1;
                                        const lastMonth = lastMonthIndex >= 0 ? months[lastMonthIndex] : months[11];
                                        const lastMonthYear = lastMonthIndex >= 0 ? currentYear : currentYear - 1;
                                        setMonth(lastMonth);
                                        setYear(lastMonthYear);
                                    }}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        fontSize: '0.75rem',
                                        py: 0.5,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    Last Month
                                </Button>
                            </Box>
                        </Grid>

                        {/* Employee Summary */}
                        <Grid item xs={12} md={2}>
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                <FilterList sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {tabValue === 0 ? 'Teachers' : 'Staff'}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {employeesWithSalary.length}
                            </Typography>
                        </Grid>

                        {/* Selected Summary */}
                        <Grid item xs={12} md={2}>
                            {selectedEmployees.length > 0 && (
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Selected for Payment
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {selectedEmployees.length} employees
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        Total: {formatCurrency(getSelectedTotal())}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<Payment />}
                    onClick={handleBulkPayment}
                    disabled={selectedEmployees.length === 0 || processing}
                >
                    Pay Selected ({selectedEmployees.length})
                </Button>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                        value={paymentMethod}
                        label="Payment Method"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="bank">Bank Transfer</MenuItem>
                        <MenuItem value="cheque">Cheque</MenuItem>
                        <MenuItem value="digital">Digital Wallet</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label={`Teachers `} icon={<Person />} iconPosition="start" />
                    <Tab label={`Staff`} icon={<Person />} iconPosition="start" />
                </Tabs>
            </Paper>

            {/* Employee Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectAll}
                                    indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employeesWithSalary.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell align="right">Base Salary</TableCell>
                            <TableCell align="right">Allowances</TableCell>
                            <TableCell align="right">Deductions</TableCell>
                            <TableCell align="right">Net Salary</TableCell>
                            <TableCell>Last Paid</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employeesWithSalary.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">
                                        No {tabValue === 0 ? 'teachers' : 'staff'} found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            employeesWithSalary.map((employee) => (
                                <TableRow
                                    key={employee._id}
                                    hover
                                    selected={selectedEmployees.includes(employee._id)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedEmployees.includes(employee._id)}
                                            onChange={() => handleSelectEmployee(employee._id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={employee.photo ? `http://localhost:5000/${employee.photo}` : ''}
                                                sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                                            >
                                                {employee.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {employee.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {employee.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{employee.position}</Typography>
                                        {employee.className && (
                                            <Typography variant="caption" color="textSecondary">
                                                {employee.className}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2">
                                            {formatCurrency(employee.baseSalary)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" color="success.main">
                                            +{formatCurrency(employee.totalAllowances)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" color="error.main">
                                            -{formatCurrency(employee.totalDeductions)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(employee.netSalary)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {employee.lastPaid ? (
                                            <Typography variant="body2">
                                                {employee.lastPaid.month} {employee.lastPaid.year}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                Never
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(employee.lastPaymentStatus)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <Tooltip title="Setup Salary">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => openSalarySetup(employee)}
                                                >
                                                    Setup
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Pay Salary">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleSinglePayment(employee)}
                                                >
                                                    Pay
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Processing Indicator */}
            {processing && <LinearProgress sx={{ mt: 2 }} />}

            {/* Salary Setup Dialog */}
            <Dialog open={openSalaryDialog} onClose={() => setOpenSalaryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle component="div">
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Salary Setup - {selectedEmployee?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div">
                        {selectedEmployee?.position}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Basic Salary
                            </Typography>
                            <TextField
                                fullWidth
                                label="Base Salary"
                                type="number"
                                value={salaryFormData.baseSalary}
                                onChange={(e) => setSalaryFormData({ ...salaryFormData, baseSalary: e.target.value })}
                                InputProps={{ startAdornment: 'Rs. ' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                Allowances
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="House Rent"
                                        type="number"
                                        value={salaryFormData.houseRent}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, houseRent: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Medical"
                                        type="number"
                                        value={salaryFormData.medical}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, medical: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Transport"
                                        type="number"
                                        value={salaryFormData.transport}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, transport: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Other"
                                        type="number"
                                        value={salaryFormData.other}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, other: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
                                Deductions
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Provident Fund"
                                        type="number"
                                        value={salaryFormData.providentFund}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, providentFund: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Tax"
                                        type="number"
                                        value={salaryFormData.tax}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, tax: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Insurance"
                                        type="number"
                                        value={salaryFormData.insurance}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, insurance: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        size="small"
                                        label="Other"
                                        type="number"
                                        value={salaryFormData.otherDeduction}
                                        onChange={(e) => setSalaryFormData({ ...salaryFormData, otherDeduction: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ bgcolor: '#f5f5f5' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Net Salary Calculation
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>Base Salary:</Typography>
                                        <Typography>{formatCurrency(parseFloat(salaryFormData.baseSalary) || 0)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                                        <Typography>Allowances:</Typography>
                                        <Typography>
                                            +{formatCurrency(
                                                (parseFloat(salaryFormData.houseRent) || 0) +
                                                (parseFloat(salaryFormData.medical) || 0) +
                                                (parseFloat(salaryFormData.transport) || 0) +
                                                (parseFloat(salaryFormData.other) || 0)
                                            )}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                                        <Typography>Deductions:</Typography>
                                        <Typography>
                                            -{formatCurrency(
                                                (parseFloat(salaryFormData.providentFund) || 0) +
                                                (parseFloat(salaryFormData.tax) || 0) +
                                                (parseFloat(salaryFormData.insurance) || 0) +
                                                (parseFloat(salaryFormData.otherDeduction) || 0)
                                            )}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Net Salary:
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {formatCurrency(calculateNetSalary())}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSalaryDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSalary} disabled={processing}>
                        {selectedEmployee?.hasSalaryRecord ? 'Update Salary' : 'Create Salary'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Confirmation Dialog */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
                <DialogTitle>Confirm Salary Payment</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedEmployee ?
                            `Pay ${selectedEmployee.name} for ${month} ${year}?` :
                            `Pay ${selectedEmployees.length} employees for ${month} ${year}?`
                        }
                    </Typography>
                    {selectedEmployee ? (
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2">Amount: {formatCurrency(selectedEmployee.netSalary || selectedEmployee.baseSalary || 0)}</Typography>
                            <Typography variant="subtitle2">Method: {paymentMethod}</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2">Total Employees: {selectedEmployees.length}</Typography>
                            <Typography variant="subtitle2">Total Amount: {formatCurrency(getSelectedTotal())}</Typography>
                            <Typography variant="subtitle2">Method: {paymentMethod}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={selectedEmployee ? processSinglePayment : processPayment}
                        disabled={processing}
                    >
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Popup Messages */}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

            {/* Snackbar for success messages */}
            <Snackbar
                open={showPopup && success}
                autoHideDuration={6000}
                onClose={() => setShowPopup(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setShowPopup(false)}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddSalary;

