import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentFee, updateFeeStatus, deleteFee } from '../../../redux/feeRelated/feeHandle';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { 
    Box, Button, Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, IconButton, TextField, 
    MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, 
    DialogContent, DialogActions, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Popup from '../../../components/Popup';

const ViewStudentFee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    
    const studentID = params.id;
    const address = "Student";
    
    const { userDetails, loading: studentLoading } = useSelector((state) => state.user);
    const { feesList, loading: feeLoading } = useSelector((state) => state.fee);

    const [feeData, setFeeData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    
    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editMonthlyAmount, setEditMonthlyAmount] = useState('');
    const [editDuesAmount, setEditDuesAmount] = useState('');
    const [editPaymentDate, setEditPaymentDate] = useState('');

    useEffect(() => {
        if (studentID) {
            dispatch(getUserDetails(studentID, address));
            dispatch(getStudentFee(studentID));
        }
    }, [dispatch, studentID]);

    useEffect(() => {
        if (feesList && Array.isArray(feesList) && feesList.length > 0) {
            setFeeData(feesList[0]);
        }
    }, [feesList]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'success';
            case 'Unpaid':
                return 'error';
            case 'Partial':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleEditClick = (feeDetail) => {
        setEditingFee(feeDetail);
        setEditStatus(feeDetail.status);
        setEditMonthlyAmount(feeDetail.monthlyAmount || '');
        setEditDuesAmount(feeDetail.duesAmount || '');
        // Format payment date for input field (YYYY-MM-DD)
        if (feeDetail.paymentDate) {
            const date = new Date(feeDetail.paymentDate);
            const formattedDate = date.toISOString().split('T')[0];
            setEditPaymentDate(formattedDate);
        } else {
            setEditPaymentDate('');
        }
        setEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingFee) {
            const monthly = parseFloat(editMonthlyAmount) || 0;
            const dues = parseFloat(editDuesAmount) || 0;
            
            const data = {
                month: editingFee.month,
                status: editStatus,
                monthlyAmount: monthly,
                duesAmount: dues,
                amount: monthly + dues,
                paymentDate: editPaymentDate ? new Date(editPaymentDate).toISOString() : null
            };
            dispatch(updateFeeStatus(editingFee._id, data))
                .then(() => {
                    dispatch(getStudentFee(studentID));
                    setMessage("Fee updated successfully!");
                    setShowPopup(true);
                });
            setEditDialogOpen(false);
        }
    };

    const handleDeleteFee = (feeDetailId) => {
        // Reset response state before delete to avoid showing "No records" message
        dispatch({ type: 'fee/stuffDone', payload: null });
        
        dispatch(deleteFee(studentID, feeDetailId))
            .then(() => {
                // Clear the feesList temporarily to force re-fetch
                dispatch({ type: 'fee/getSuccess', payload: [] });
                // Then fetch fresh data
                dispatch(getStudentFee(studentID));
                setMessage("Fee deleted successfully!");
                setShowPopup(true);
            });
    };

    const handleToggleStatus = (fee) => {
        // Guard clause - check if fee exists and has _id
        if (!fee || !fee._id) {
            console.error('Invalid fee object:', fee);
            return;
        }
        
        console.log('=== handleToggleStatus called ===');
        console.log('fee object:', JSON.stringify(fee, null, 2));
        console.log('fee._id:', fee._id);
        console.log('fee.status:', fee.status);
        console.log('fee.month:', fee.month);
        console.log('fee.amount:', fee.amount);
        
        // Simple toggle between Unpaid and Paid
        const newStatus = fee.status === 'Paid' ? 'Unpaid' : 'Paid';
        
        console.log('Changing status from', fee.status, 'to', newStatus);
        
        // Calculate paidAmount based on new status
        let paidAmount = 0;
        let paymentDate = null;
        
        if (newStatus === 'Paid') {
            paidAmount = fee.amount;
            paymentDate = new Date().toISOString();
        } else {
            // Unpaid
            paidAmount = 0;
            paymentDate = null;
        }

        const data = {
            month: fee.month,
            status: newStatus,
            monthlyAmount: fee.monthlyAmount || 0,
            duesAmount: fee.duesAmount || 0,
            amount: fee.amount,
            paidAmount: paidAmount,
            paymentDate: paymentDate
        };

        console.log('Sending update data:', data);

        dispatch(updateFeeStatus(fee._id, data))
            .then((result) => {
                console.log('Update result:', result);
                // Simply refetch - let Redux handle state properly
                dispatch(getStudentFee(studentID));
                setMessage(`Fee status changed to ${newStatus}!`);
                setShowPopup(true);
            })
            .catch((error) => {
                console.error('Update failed:', error);
                setMessage(`Failed to change status: ${error.message}`);
                setShowPopup(true);
            });
    };

    const calculateSummary = () => {
        if (!feeData || !feeData.feeDetails) return { total: 0, paid: 0, partial: 0, unpaid: 0 };
        
        let total = 0;
        let paid = 0;
        let partial = 0;
        let unpaid = 0;
        
        feeData.feeDetails.forEach(fee => {
            total += fee.amount;
            if (fee.status === 'Paid') {
                paid += fee.amount;
            } else if (fee.status === 'Partial') {
                // For partial, use paidAmount if available, otherwise use half
                partial += fee.paidAmount || (fee.amount / 2);
                unpaid += fee.amount - (fee.paidAmount || (fee.amount / 2));
            } else {
                // Unpaid
                unpaid += fee.amount;
            }
        });
        
        return { total, paid, partial, unpaid };
    };

    const summary = calculateSummary();

    if (studentLoading || feeLoading) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(-1)}
                sx={{ mb: 3 }}
            >
                Go Back
            </Button>

            {/* Student Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Fee Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Typography><strong>Name:</strong> {userDetails?.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography><strong>Roll Number:</strong> {userDetails?.rollNum}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography><strong>Class:</strong> {userDetails?.sclassName?.sclassName}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                        <Typography variant="h6">Total Fee</Typography>
                        <Typography variant="h4">₹{summary.total.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                        <Typography variant="h6">Paid</Typography>
                        <Typography variant="h4" color="success.main">₹{summary.paid.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
                        <Typography variant="h6">Due</Typography>
                        <Typography variant="h4" color="error.main">₹{summary.unpaid.toFixed(2)}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Fee Details Table */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Monthly Fee Breakdown
                </Typography>
                {feeData && feeData.feeDetails && feeData.feeDetails.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Month</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Payment Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feeData.feeDetails.map((fee) => (
                                    <TableRow key={fee?._id || Math.random()}>
                                        <TableCell>{fee?.month}</TableCell>
                                        <TableCell align="right">₹{fee?.amount?.toFixed(2)}</TableCell>
                                        <TableCell>{formatDate(fee?.dueDate)}</TableCell>
                                        <TableCell>{formatDate(fee?.paymentDate)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={fee?.status || 'Unknown'} 
                                                color={getStatusColor(fee?.status)}
                                                size="small"
                                                onClick={() => fee && handleToggleStatus(fee)}
                                                clickable
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </TableCell>
                                        <TableCell>{fee?.description || '-'}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={() => fee && handleEditClick(fee)} size="small">
                                                <EditIcon color="primary" />
                                            </IconButton>
                                            <IconButton onClick={() => fee?._id && handleDeleteFee(fee._id)} size="small">
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography sx={{ textAlign: 'center', py: 3 }}>
                        No fee records found for this student.
                    </Typography>
                )}
            </Paper>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Fee</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="Unpaid">Unpaid</MenuItem>
                                <MenuItem value="Paid">Paid</MenuItem>
                                <MenuItem value="Partial">Partial</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Monthly Amount"
                            type="number"
                            value={editMonthlyAmount}
                            onChange={(e) => setEditMonthlyAmount(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Dues Amount"
                            type="number"
                            value={editDuesAmount}
                            onChange={(e) => setEditDuesAmount(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Payment Date"
                            type="date"
                            value={editPaymentDate}
                            onChange={(e) => setEditPaymentDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            helperText="Enter the date when payment was made"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ViewStudentFee;

