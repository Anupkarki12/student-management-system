import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllFees, updateFeeStatus } from '../../../redux/feeRelated/feeHandle';
import { deleteFee } from '../../../redux/feeRelated/feeHandle';
import { 
    Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Typography, Chip, Tooltip, Card, CardContent,
    Grid, Avatar, LinearProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import Popup from '../../../components/Popup';
import { GreenButton } from '../../../components/buttonStyles';

const ShowAllFees = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.user);
    const { feesList, loading, error, response } = useSelector((state) => state.fee);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    useEffect(() => {
        if (currentUser) {
            dispatch(getAllFees(currentUser._id));
        }
    }, [currentUser, dispatch]);

    const handleDelete = (studentId, feeDetailId) => {
        // Guard clause - validate inputs
        if (!studentId || !feeDetailId) {
            console.error('Invalid delete parameters:', { studentId, feeDetailId });
            return;
        }
        
        dispatch({ type: 'fee/stuffDone', payload: null });
        
        dispatch(deleteFee(studentId, feeDetailId))
            .then(() => {
                dispatch({ type: 'fee/getSuccess', payload: [] });
                dispatch(getAllFees(currentUser._id));
                setMessage("Fee deleted successfully!");
                setShowPopup(true);
            });
    };

    const handleViewDetails = (studentId) => {
        navigate(`/Admin/students/student/fee/${studentId}`);
    };

    const handleToggleStatus = (fee) => {
        // Guard clause - check if fee exists and has _id
        if (!fee || !fee._id) {
            console.error('Invalid fee object:', fee);
            return;
        }
        
        const newStatus = fee.status === 'Paid' ? 'Unpaid' : 'Paid';
        
        let paidAmount = 0;
        let paymentDate = null;
        
        if (newStatus === 'Paid') {
            paidAmount = fee.amount;
            paymentDate = new Date().toISOString();
        } else {
            paidAmount = 0;
            paymentDate = null;
        }

        const data = {
            month: fee.month,
            status: newStatus,
            amount: fee.amount,
            paidAmount: paidAmount,
            paymentDate: paymentDate
        };

        dispatch(updateFeeStatus(fee._id, data))
            .then(() => {
                dispatch(getAllFees(currentUser._id));
                setMessage(`Fee status changed to ${newStatus}!`);
                setShowPopup(true);
            });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return '#4caf50';
            case 'Unpaid': return '#f44336';
            case 'Partial': return '#ff9800';
            default: return '#9e9e9e';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'Paid': return '#e8f5e9';
            case 'Unpaid': return '#ffebee';
            case 'Partial': return '#fff3e0';
            default: return '#f5f5f5';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getFlattenedFees = () => {
        if (!feesList || !Array.isArray(feesList) || feesList.length === 0) return [];
        
        let flattened = [];
        feesList.forEach((fee) => {
            if (fee.feeDetails && fee.feeDetails.length > 0) {
                fee.feeDetails.forEach((detail) => {
                    flattened.push({
                        ...detail,
                        studentId: fee.student?._id,
                        studentName: fee.student?.name || 'Unknown',
                        rollNum: fee.student?.rollNum || 'N/A',
                        className: fee.student?.sclassName?.sclassName || fee.student?.sclassName || 'N/A',
                        classId: fee.student?.sclassName?._id || '',
                        feeId: fee._id
                    });
                });
            }
        });

        // Filter by selected class
        if (selectedClass) {
            flattened = flattened.filter(fee => fee.classId === selectedClass);
        }

        return flattened;
    };

    const calculateAllSummary = () => {
        const feesToUse = getFlattenedFees();
        if (feesToUse.length === 0) {
            return { total: 0, paid: 0, partial: 0, unpaid: 0 };
        }
        
        let total = 0;
        let paid = 0;
        let partial = 0;
        let unpaid = 0;
        
        feesToUse.forEach((detail) => {
            total += detail.amount;
            if (detail.status === 'Paid') {
                paid += detail.amount;
            } else if (detail.status === 'Partial') {
                partial += detail.paidAmount || (detail.amount / 2);
                unpaid += detail.amount - (detail.paidAmount || (detail.amount / 2));
            } else {
                unpaid += detail.amount;
            }
        });
        
        return { total, paid, partial, unpaid };
    };

    const allSummary = calculateAllSummary();
    const allFees = getFlattenedFees();
    const paymentPercentage = allSummary.total > 0 ? ((allSummary.paid + allSummary.partial) / allSummary.total * 100).toFixed(1) : 0;

    // Get unique classes from the fee records
    const getUniqueClasses = () => {
        if (!feesList || !Array.isArray(feesList)) return [];
        
        const classes = new Map();
        feesList.forEach((fee) => {
            if (fee.student?.sclassName) {
        classes.set(fee.student?.sclassName?._id, fee.student?.sclassName);
            }
        });
        return Array.from(classes.values());
    };

    const uniqueClasses = getUniqueClasses();

    if (loading) {
        return (
            <Box sx={{ width: '100%', p: 3 }}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: '700', color: '#1e293b' }}>
                        Fee Management
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Track and manage all student fee payments
                    </Typography>
                </Box>
                <GreenButton 
                    variant="contained" 
                    onClick={() => navigate("/Admin/addfee")}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    + Add New Fee
                </GreenButton>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#e3f2fd', width: 40, height: 40 }}>
                                    <PaymentIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Typography variant="body2" color="textSecondary">Total</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: '700', color: '#1e293b' }}>
                                ₹{allSummary.total.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9', width: 40, height: 40 }}>
                                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                </Avatar>
                                <Typography variant="body2" color="textSecondary">Paid</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: '700', color: '#4caf50' }}>
                                ₹{allSummary.paid.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#fff3e0', width: 40, height: 40 }}>
                                    <WarningIcon sx={{ color: '#ff9800' }} />
                                </Avatar>
                                <Typography variant="body2" color="textSecondary">Due</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: '700', color: '#ff9800' }}>
                                ₹{allSummary.unpaid.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#fce4ec', width: 40, height: 40 }}>
                                    <PaymentIcon sx={{ color: '#e91e63' }} />
                                </Avatar>
                                <Typography variant="body2" color="textSecondary">Collected</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: '700', color: '#1e293b' }}>
                                {paymentPercentage}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(paymentPercentage)} 
                                sx={{ mt: 1, borderRadius: 5, height: 6 }} 
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Section */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Class</InputLabel>
                        <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            label="Filter by Class"
                        >
                            <MenuItem value="">All Classes</MenuItem>
                            {uniqueClasses.map((cls) => (
                                <MenuItem key={cls._id} value={cls._id}>
                                    {cls.sclassName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    {selectedClass && (
                        <Chip 
                            label={uniqueClasses.find(c => c._id === selectedClass)?.sclassName || 'Selected Class'}
                            onDelete={() => setSelectedClass("")}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    
                    <Typography variant="body2" color="textSecondary">
                        {allFees.length} record{allFees.length !== 1 ? 's' : ''} found
                    </Typography>
                </Box>
            </Card>

            {/* Fee Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: '600', color: '#1e293b' }}>
                        Fee Records
                    </Typography>
                </Box>
                
                {error ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : response ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No fee records found
                        </Typography>
                        <GreenButton variant="contained" onClick={() => navigate("/Admin/addfee")}>
                            Add First Fee
                        </GreenButton>
                    </Box>
                ) : allFees.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                            {selectedClass ? 'No fee records found for this class' : 'No fee records available'}
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Student</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Roll No.</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Month</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: '600', color: '#64748b' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Due Date</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Payment Date</TableCell>
                                    <TableCell sx={{ fontWeight: '600', color: '#64748b' }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: '600', color: '#64748b' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allFees.map((fee, index) => (
                                    <TableRow 
                                        key={index}
                                        sx={{ 
                                            '&:hover': { backgroundColor: '#f8fafc' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ 
                                                    width: 36, 
                                                    height: 36, 
                                                    bgcolor: '#1976d2',
                                                    fontSize: 14,
                                                    fontWeight: '600'
                                                }}>
                                                    {fee.studentName?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight="500">
                                                    {fee.studentName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {fee.rollNum}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={fee.className} 
                                                size="small"
                                                sx={{ 
                                                    bgcolor: '#f1f5f9',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {fee.month}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="600">
                                                ₹{fee.amount?.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {formatDate(fee.dueDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {formatDate(fee.paymentDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={fee.status} 
                                                size="small"
                                                onClick={() => fee && fee._id && handleToggleStatus(fee)}
                                                clickable
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    bgcolor: getStatusBgColor(fee.status),
                                                    color: getStatusColor(fee.status),
                                                    '&:hover': {
                                                        bgcolor: getStatusBgColor(fee.status),
                                                        opacity: 0.9
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton 
                                                    onClick={() => fee.studentId && handleViewDetails(fee.studentId)}
                                                    size="small"
                                                    sx={{ color: '#1976d2' }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton 
                                                    onClick={() => fee.studentId && fee._id && handleDelete(fee.studentId, fee._id)}
                                                    size="small"
                                                    sx={{ color: '#f44336' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
            
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowAllFees;

