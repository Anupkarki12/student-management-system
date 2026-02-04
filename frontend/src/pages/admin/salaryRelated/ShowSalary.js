import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, Card, CardContent, Avatar, Divider, LinearProgress,
    Tooltip, Alert, Tab, Tabs, Collapse, CircularProgress,
    List, ListItem, ListItemIcon, ListItemText
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
    Refresh,
    Warning,
    BugReport,
    ExpandMore,
    ExpandLess,
    HelpOutline,
    Settings,
    People,
    AttachMoney,
    FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import {
    getAllSalaryRecords,
    deleteSalaryRecord,
    getEmployeesWithSalaryStatus,
    getSalaryDebugInfo,
    fixSalaryRecords
} from '../../../redux/salaryRelated/salaryHandle';
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSimpleStaffs } from '../../../redux/staffRelated/staffHandle';
import { underControl } from '../../../redux/salaryRelated/salarySlice';
import Popup from '../../../components/Popup';
import { GreenButton } from '../../../components/buttonStyles';
import { exportToExcel, getCurrentDateString } from '../../../utils/excelExport';
import axios from 'axios';

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
    const { salaryRecords, loading, error, success, response, employeesWithSalary } = useSelector(state => state.salary);

    // Ensure salaryRecords is always an array
    const safeSalaryRecords = Array.isArray(salaryRecords) ? salaryRecords : [];
    // Ensure employeesWithSalary is always an array
    const safeEmployeesWithSalary = Array.isArray(employeesWithSalary) ? employeesWithSalary : [];

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
    // Use unified salary records for all calculations
    // Teachers with salary configured - use salary data from teacher schema directly
    const teachersWithSalary = safeTeachers.filter(t => t.salary && t.salary.baseSalary > 0);
    const staffWithSalary = safeStaffs.filter(s => s.salary && s.salary.baseSalary > 0);

    // Build unified salary records from teachers and staff schema data
    // This is used as a fallback when Salary collection is empty
    const buildUnifiedSalaryRecords = () => {
        const records = [];

        // Add records from teachers with salary
        teachersWithSalary.forEach(teacher => {
            const allowances = (teacher.salary?.allowances?.houseRent || 0) +
                (teacher.salary?.allowances?.medical || 0) +
                (teacher.salary?.allowances?.transport || 0) +
                (teacher.salary?.allowances?.other || 0);
            const deductions = (teacher.salary?.deductions?.providentFund || 0) +
                (teacher.salary?.deductions?.tax || 0) +
                (teacher.salary?.deductions?.insurance || 0) +
                (teacher.salary?.deductions?.other || 0);
            const netSalary = teacher.salary?.netSalary || teacher.salary?.baseSalary || 0;

            records.push({
                _id: teacher._id,
                employee: {
                    _id: teacher._id,
                    name: teacher.name,
                    email: teacher.email,
                    photo: teacher.photo
                },
                employeeType: 'teacher',
                position: teacher.teachSubject?.subName || 'Teacher',
                baseSalary: teacher.salary?.baseSalary || 0,
                allowances: teacher.salary?.allowances || {},
                deductions: teacher.salary?.deductions || {},
                netSalary,
                totalAllowances: allowances,
                totalDeductions: deductions,
                paymentHistory: [],
                hasSalaryFromSchema: true
            });
        });

        // Add records from staff with salary
        staffWithSalary.forEach(staff => {
            const allowances = (staff.salary?.allowances?.houseRent || 0) +
                (staff.salary?.allowances?.medical || 0) +
                (staff.salary?.allowances?.transport || 0) +
                (staff.salary?.allowances?.other || 0);
            const deductions = (staff.salary?.deductions?.providentFund || 0) +
                (staff.salary?.deductions?.tax || 0) +
                (staff.salary?.deductions?.insurance || 0) +
                (staff.salary?.deductions?.other || 0);
            const netSalary = staff.salary?.netSalary || staff.salary?.baseSalary || 0;

            records.push({
                _id: staff._id,
                employee: {
                    _id: staff._id,
                    name: staff.name,
                    email: staff.email,
                    photo: staff.photo
                },
                employeeType: 'staff',
                position: staff.position || 'Staff',
                baseSalary: staff.salary?.baseSalary || 0,
                allowances: staff.salary?.allowances || {},
                deductions: staff.salary?.deductions || {},
                netSalary,
                totalAllowances: allowances,
                totalDeductions: deductions,
                paymentHistory: [],
                hasSalaryFromSchema: true
            });
        });

        return records;
    };

    // Use Salary collection records if available, otherwise use schema data
    const hasValidSalaryRecords = safeSalaryRecords.length > 0;
    const unifiedSalaryRecords = hasValidSalaryRecords ? safeSalaryRecords : buildUnifiedSalaryRecords();

    // Calculate totals from unified records
    const calculateTotalSalaryPaid = (records) => {
        return records.reduce((sum, record) => {
            if (record.paymentHistory && Array.isArray(record.paymentHistory) && record.paymentHistory.length > 0) {
                const paidPayments = record.paymentHistory.filter(p =>
                    p.status && p.status.toLowerCase() === 'paid'
                );
                const recordTotal = paidPayments.reduce((paymentSum, payment) => {
                    return paymentSum + (payment.amount || 0);
                }, 0);
                return sum + recordTotal;
            }
            // If no payment history, use netSalary as one-time total
            if (record.netSalary && record.netSalary > 0 && (!record.paymentHistory || record.paymentHistory.length === 0)) {
                return sum + record.netSalary;
            }
            return sum;
        }, 0);
    };

    // Count records by type from unified data
    const teacherRecords = unifiedSalaryRecords.filter(r =>
        r.employeeType && r.employeeType.toLowerCase() === 'teacher'
    ).length;
    const staffRecords = unifiedSalaryRecords.filter(r =>
        r.employeeType && r.employeeType.toLowerCase() === 'staff'
    ).length;
    const totalRecords = unifiedSalaryRecords.length;
    const totalSalaryPaid = calculateTotalSalaryPaid(unifiedSalaryRecords);

    // DEBUG: Log salary records data to diagnose the issue
    console.log('=== SALARY RECORDS DEBUG ===');
    console.log('Total salary records from API:', safeSalaryRecords.length);
    console.log('Teachers with salary in schema:', teachersWithSalary.length);
    console.log('Staff with salary in schema:', staffWithSalary.length);
    console.log('Unified salary records (used for display):', totalRecords);
    console.log('Total salary paid:', totalSalaryPaid);
    console.log('===========================');

    // Month/Year filter state
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    
    // State for storing filtered employees data (teachers and staff)
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Month options
    const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = ['All', ...Array.from({ length: 10 }, (_, i) => currentYear - i)];

    // Convert month name to number
    const getMonthNumber = (monthName) => {
        const monthsMap = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4,
            'May': 5, 'June': 6, 'July': 7, 'August': 8,
            'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        return monthsMap[monthName] || null;
    };

    // State for attendance data
    const [teacherAttendanceData, setTeacherAttendanceData] = useState({});
    const [staffAttendanceData, setStaffAttendanceData] = useState({});
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    // Fetch attendance data when month/year filter changes
    useEffect(() => {
        const fetchAttendanceData = async () => {
            if (!schoolId || selectedMonth === 'All' || selectedYear === 'All') {
                setTeacherAttendanceData({});
                setStaffAttendanceData({});
                return;
            }

            setLoadingAttendance(true);
            const monthNum = getMonthNumber(selectedMonth);
            const yearNum = parseInt(selectedYear);

            try {
                // Fetch teacher attendance
                const teacherAttData = {};
                for (const teacher of teachersWithSalary) {
                    try {
                        const result = await axios.get(
                            `${process.env.REACT_APP_BASE_URL}/Teacher/Attendance/${teacher._id}?month=${monthNum}&year=${yearNum}`
                        );
                        if (result.data && result.data.summary) {
                            teacherAttData[teacher._id] = result.data.summary;
                        }
                    } catch (err) {
                        console.error(`Error fetching attendance for teacher ${teacher._id}:`, err);
                    }
                }
                setTeacherAttendanceData(teacherAttData);

                // Fetch staff attendance
                const staffAttData = {};
                for (const staff of staffWithSalary) {
                    try {
                        const result = await axios.get(
                            `${process.env.REACT_APP_BASE_URL}/Staff/Attendance/${staff._id}?month=${monthNum}&year=${yearNum}`
                        );
                        if (result.data && result.data.summary) {
                            staffAttData[staff._id] = result.data.summary;
                        }
                    } catch (err) {
                        console.error(`Error fetching attendance for staff ${staff._id}:`, err);
                    }
                }
                setStaffAttendanceData(staffAttData);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            } finally {
                setLoadingAttendance(false);
            }
        };

        fetchAttendanceData();
    }, [schoolId, selectedMonth, selectedYear, teachersWithSalary, staffWithSalary]);

    // Debug: Log Redux state when employeesWithSalary changes
    useEffect(() => {
        if (safeEmployeesWithSalary.length > 0) {
            console.log('Redux employeesWithSalary updated:', {
                count: safeEmployeesWithSalary.length,
                sample: safeEmployeesWithSalary[0],
                allTypes: [...new Set(safeEmployeesWithSalary.map(e => e.employeeType))]
            });
        }
    }, [safeEmployeesWithSalary]);

    // Fetch employees with salary status when month/year filter changes
    useEffect(() => {
        if (schoolId) {
            setLoadingEmployees(true);
            
            // FIX: When "All" is selected, pass "All" to backend instead of defaulting to current values
            // Backend will handle the "All" case appropriately
            const effectiveMonth = selectedMonth !== 'All' ? selectedMonth : null;
            const effectiveYear = selectedYear !== 'All' ? selectedYear : null;
            
            console.log(`Fetching employees with salary status - Month: ${effectiveMonth || 'All'}, Year: ${effectiveYear || 'All'}`);
            
            // Fetch teachers
            dispatch(getEmployeesWithSalaryStatus(schoolId, 'teacher', effectiveMonth, effectiveYear))
                .then((teachers) => {
                    console.log('Teachers API response:', {
                        isArray: Array.isArray(teachers),
                        length: teachers?.length,
                        sample: teachers?.[0]
                    });
                    const filtered = Array.isArray(teachers) ? teachers : [];
                    setFilteredTeachers(filtered);
                    
                    // Log payment status breakdown for teachers
                    const paidCount = filtered.filter(t => t.isPaidForSelectedMonth).length;
                    console.log(`Teachers: ${paidCount} paid out of ${filtered.length}`);
                })
                .catch((err) => {
                    console.error('Error fetching teachers:', err);
                    setFilteredTeachers([]);
                });
            
            // Fetch staff
            dispatch(getEmployeesWithSalaryStatus(schoolId, 'staff', effectiveMonth, effectiveYear))
                .then((staff) => {
                    console.log('Staff API response:', {
                        isArray: Array.isArray(staff),
                        length: staff?.length,
                        sample: staff?.[0]
                    });
                    const filtered = Array.isArray(staff) ? staff : [];
                    setFilteredStaff(filtered);
                    
                    // Log payment status breakdown for staff
                    const paidCount = filtered.filter(s => s.isPaidForSelectedMonth).length;
                    console.log(`Staff: ${paidCount} paid out of ${filtered.length}`);
                })
                .catch((err) => {
                    console.error('Error fetching staff:', err);
                    setFilteredStaff([]);
                })
                .finally(() => {
                    setLoadingEmployees(false);
                });
        }
    }, [schoolId, selectedMonth, selectedYear, dispatch]);

    // Calculate summary for filtered employees
    const paidTeachers = filteredTeachers.filter(t => t.isPaidForSelectedMonth === true).length;
    const unpaidTeachers = filteredTeachers.length - paidTeachers;
    const paidStaff = filteredStaff.filter(s => s.isPaidForSelectedMonth === true).length;
    const unpaidStaff = filteredStaff.length - paidStaff;

    // Debug log the counts
    useEffect(() => {
        if (selectedMonth !== 'All' && selectedYear !== 'All') {
            console.log('Payment Status Counts:', {
                paidTeachers,
                unpaidTeachers,
                paidStaff,
                unpaidStaff,
                totalTeachers: filteredTeachers.length,
                totalStaff: filteredStaff.length
            });
        }
    }, [paidTeachers, unpaidTeachers, paidStaff, unpaidStaff, filteredTeachers.length, filteredStaff.length, selectedMonth, selectedYear]);

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

    // Calculate total salary paid for the filtered month/year
    const filteredTotalSalaryPaid = filteredSalaryRecords.reduce((sum, record) => {
        if (record.paymentHistory && Array.isArray(record.paymentHistory)) {
            const paidPayments = record.paymentHistory.filter(p =>
                p.status === 'paid' &&
                (selectedMonth === 'All' || p.month === selectedMonth) &&
                (selectedYear === 'All' || p.year.toString() === selectedYear)
            );
            const recordTotal = paidPayments.reduce((paymentSum, payment) => {
                return paymentSum + (payment.amount || 0);
            }, 0);
            return sum + recordTotal;
        }
        return sum;
    }, 0);

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

    // Export salary records to Excel
    const handleExportSalary = () => {
        const allEmployees = [...filteredTeachers, ...filteredStaff];
        
        if (allEmployees.length === 0) {
            alert('No salary records to export');
            return;
        }

        const exportData = allEmployees.map((emp) => ({
            'Employee Name': emp.name || 'N/A',
            'Email': emp.email || 'N/A',
            'Type': emp.employeeType ? emp.employeeType.charAt(0).toUpperCase() + emp.employeeType.slice(1) : 'N/A',
            'Position': emp.position || 'N/A',
            'Base Salary (NPR)': emp.baseSalary || 0,
            'House Rent (NPR)': emp.salary?.allowances?.houseRent || 0,
            'Medical (NPR)': emp.salary?.allowances?.medical || 0,
            'Transport (NPR)': emp.salary?.allowances?.transport || 0,
            'Other Allowances (NPR)': emp.salary?.allowances?.other || 0,
            'Total Allowances (NPR)': emp.totalAllowances || 0,
            'Provident Fund (NPR)': emp.salary?.deductions?.providentFund || 0,
            'Tax (NPR)': emp.salary?.deductions?.tax || 0,
            'Insurance (NPR)': emp.salary?.deductions?.insurance || 0,
            'Other Deductions (NPR)': emp.salary?.deductions?.other || 0,
            'Total Deductions (NPR)': emp.totalDeductions || 0,
            'Net Salary (NPR)': emp.netSalary || 0,
            'Payment Status': emp.isPaidForSelectedMonth ? 'Paid' : 'Unpaid',
            'Selected Month': selectedMonth !== 'All' ? selectedMonth : 'All',
            'Selected Year': selectedYear !== 'All' ? selectedYear : 'All'
        }));

        const monthSuffix = selectedMonth !== 'All' ? `_${selectedMonth.replace(' ', '_')}` : '_AllMonths';
        const yearSuffix = selectedYear !== 'All' ? `_${selectedYear}` : '_AllYears';
        const fileName = `Salary_Report${monthSuffix}${yearSuffix}_${getCurrentDateString()}`;
        exportToExcel(exportData, fileName, 'Salary Records');
    };

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
                    <GreenButton
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportSalary}
                        disabled={filteredTeachers.length === 0 && filteredStaff.length === 0}
                        sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                    >
                        Export Excel
                    </GreenButton>
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
                    
                </CardContent>
            </Card>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Total Salary Records Card */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoney color="primary" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Salary Records
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'primary.main' }}>
                                {totalRecords}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {totalRecords === 0 
                                    ? 'No salary records found'
                                    : `${teacherRecords} teachers, ${staffRecords} staff`}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Teachers Card */}
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
                            <Typography variant="caption" color="textSecondary">
                                {teachersWithSalary.length} with salary configured
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Staff Card */}
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
                            <Typography variant="caption" color="textSecondary">
                                {staffWithSalary.length} with salary configured
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Total Salary Paid Card - Shown separately */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoney color="secondary" />
                                <Typography variant="subtitle2" color="textSecondary">
                                    Total Salary Paid (All Time)
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: 'secondary.main' }}>
                                {formatCurrency(totalSalaryPaid)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {totalSalaryPaid > 0
                                    ? 'Based on salary data'
                                    : 'No payments recorded yet'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Always show Payment Status section when data is loaded */}
            {/* Payment Status Summary */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                {(() => {
                    const monthText = selectedMonth === 'All' ? 'All Months' : selectedMonth;
                    const yearText = selectedYear === 'All' ? 'All Years' : selectedYear;
                    return `Payment Status for ${monthText} / ${yearText}`;
                })()}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Teachers Paid</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>{paidTeachers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Teachers Unpaid</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>{unpaidTeachers}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Staff Paid</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>{paidStaff}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">Staff Unpaid</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>{unpaidStaff}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Loading Indicator */}
            {loadingEmployees && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <Typography>Loading employee salary data...</Typography>
                </Box>
            )}

            {/* Teachers with Salary Payment Status */}
            {!loadingEmployees && filteredTeachers.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                        Teachers Salary Status
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                    <TableCell>Teacher Name</TableCell>
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
                                {filteredTeachers.map((teacher) => {
                                    const allowances = teacher.totalAllowances || 0;
                                    const deductions = teacher.totalDeductions || 0;
                                    const netSalary = teacher.netSalary || 0;
                                    
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
                                            <TableCell>{teacher.position}</TableCell>
                                            <TableCell align="right">{formatCurrency(teacher.baseSalary || 0)}</TableCell>
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
                                            <TableCell>
                                                <Chip 
                                                    label={teacher.isPaidForSelectedMonth ? 'Paid' : 'Unpaid'} 
                                                    color={teacher.isPaidForSelectedMonth ? 'success' : 'error'}
                                                    size="small"
                                                    icon={teacher.isPaidForSelectedMonth ? <CheckCircle /> : undefined}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => navigate('/Admin/salary/add')}
                                                >
                                                    Pay
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Staff with Salary Payment Status */}
            {!loadingEmployees && filteredStaff.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
                        Staff Salary Status
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
                                    <TableCell>Payment Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStaff.map((staff) => {
                                    const allowances = staff.totalAllowances || 0;
                                    const deductions = staff.totalDeductions || 0;
                                    const netSalary = staff.netSalary || 0;
                                    
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
                                            <TableCell>{staff.position}</TableCell>
                                            <TableCell align="right">{formatCurrency(staff.baseSalary || 0)}</TableCell>
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
                                            <TableCell>
                                                <Chip 
                                                    label={staff.isPaidForSelectedMonth ? 'Paid' : 'Unpaid'} 
                                                    color={staff.isPaidForSelectedMonth ? 'success' : 'error'}
                                                    size="small"
                                                    icon={staff.isPaidForSelectedMonth ? <CheckCircle /> : undefined}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => navigate('/Admin/salary/add')}
                                                >
                                                    Pay
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* Show message when no employees found with current filters */}
            {!loadingEmployees && filteredTeachers.length === 0 && filteredStaff.length === 0 && (safeTeachers.length > 0 || safeStaffs.length > 0) && (
                <Card sx={{ mb: 3, bgcolor: '#fff8e1', border: '1px solid #ffc107' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <HelpOutline sx={{ fontSize: 40, color: 'warning.main', mt: 0.5 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                                    No Employees Found for Selected Period
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {(() => {
                                        const monthText = selectedMonth === 'All' ? 'any month' : selectedMonth;
                                        const yearText = selectedYear === 'All' ? 'any year' : selectedYear;
                                        return (
                                            <>
                                                Employees exist with salary records but no payments have been recorded for <strong>{monthText} {yearText}</strong>. 
                                                You can still view salary details below and make payments.
                                            </>
                                        );
                                    })()}
                                </Typography>
                                
                                {/* Diagnostic Information */}
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        System Status:
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <People sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                                                Total Teachers: <strong>{totalTeachers}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <People sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                                                Total Staff: <strong>{totalStaffs}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <AttachMoney sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                                                Teachers with Salary: <strong>{teachersWithSalary.length}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <AttachMoney sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                                                Staff with Salary: <strong>{staffWithSalary.length}</strong>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                <Payment sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                                                Total Salary Records: <strong>{totalRecords}</strong>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => navigate('/Admin/salary/add')}
                                        sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6b45c8' } }}
                                    >
                                        Make Payment
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        onClick={handleRefresh}
                                    >
                                        Refresh Data
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
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
                                    {selectedMonth !== 'All' && selectedYear !== 'All' && (
                                        <TableCell align="center">Present Days</TableCell>
                                    )}
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
                                    const attendance = teacherAttendanceData[teacher._id];

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
                                            {selectedMonth !== 'All' && selectedYear !== 'All' && (
                                                <TableCell align="center">
                                                    {loadingAttendance ? (
                                                        <Typography variant="caption" color="textSecondary">Loading...</Typography>
                                                    ) : attendance ? (
                                                        <Chip 
                                                            label={`${attendance.presentDays || 0} days`}
                                                            color={attendance.presentDays > 0 ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">-</Typography>
                                                    )}
                                                </TableCell>
                                            )}
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
                                    {selectedMonth !== 'All' && selectedYear !== 'All' && (
                                        <TableCell align="center">Present Days</TableCell>
                                    )}
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
                                    const attendance = staffAttendanceData[staff._id];

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
                                            {selectedMonth !== 'All' && selectedYear !== 'All' && (
                                                <TableCell align="center">
                                                    {loadingAttendance ? (
                                                        <Typography variant="caption" color="textSecondary">Loading...</Typography>
                                                    ) : attendance ? (
                                                        <Chip 
                                                            label={`${attendance.presentDays || 0} days`}
                                                            color={attendance.presentDays > 0 ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">-</Typography>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

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

