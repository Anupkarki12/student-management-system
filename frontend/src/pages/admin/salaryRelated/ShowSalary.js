import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, Card, CardContent, Avatar, Divider, LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    ArrowBack,
    Payment,
    Visibility,
    CheckCircle
} from '@mui/icons-material';
import {
    getAllSalaryRecords,
    deleteSalaryRecord
} from '../../../redux/salaryRelated/salaryHandle';
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

    useEffect(() => {
        if (schoolId) {
            console.log('Fetching salary records for school:', schoolId);
            dispatch(getAllSalaryRecords(schoolId));
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/Admin/salary/add')}
                    sx={{ bgcolor: '#7f56da', '&:hover': { bgcolor: '#6b45c8' } }}
                >
                    Add Salary
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                                Total Records
                            </Typography>
                            <Typography variant="h4">
                                {safeSalaryRecords.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                                Teachers
                            </Typography>
                            <Typography variant="h4">
                                {safeSalaryRecords.filter(r => r.employeeType === 'teacher').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                                Staff
                            </Typography>
                            <Typography variant="h4">
                                {safeSalaryRecords.filter(r => r.employeeType === 'staff').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Salary Records Table */}
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
                        {safeSalaryRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography color="textSecondary">
                                        No salary records found
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => navigate('/Admin/salary/add')}
                                        sx={{ mt: 2 }}
                                    >
                                        Add First Salary Record
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            safeSalaryRecords.map((record) => {
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

