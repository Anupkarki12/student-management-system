import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentFee } from '../../redux/feeRelated/feeHandle';
import { 
    Box, Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Grid
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

const ViewFee = () => {
    const dispatch = useDispatch();
    
    const { currentUser } = useSelector((state) => state.user);
    const { feesList, loading, error } = useSelector((state) => state.fee);

    const [feeData, setFeeData] = useState(null);

    useEffect(() => {
        if (currentUser) {
            dispatch(getStudentFee(currentUser._id));
        }
    }, [dispatch, currentUser]);

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

    if (loading) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography>Loading fee details...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <PaymentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4">
                    My Fee Details
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Total Fee
                        </Typography>
                        <Typography variant="h4">
                            ₹{summary.total.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Paid Amount
                        </Typography>
                        <Typography variant="h4">
                            ₹{summary.paid.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Due Amount
                        </Typography>
                        <Typography variant="h4">
                            ₹{summary.unpaid.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Fee Details Table */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1 }}>
                    Monthly Fee Breakdown
                </Typography>
                {feeData && feeData.feeDetails && feeData.feeDetails.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell><strong>Month</strong></TableCell>
                                    <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                                    <TableCell><strong>Due Date</strong></TableCell>
                                    <TableCell><strong>Payment Date</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                    <TableCell><strong>Description</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feeData.feeDetails.map((fee) => (
                                    <TableRow 
                                        key={fee?._id || Math.random()}
                                        sx={{ 
                                            '&:hover': { backgroundColor: '#f9f9f9' },
                                            backgroundColor: fee?.status === 'Unpaid' ? '#fff5f5' : 'inherit'
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="500">
                                                {fee?.month}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight="500">
                                                {fee?.amount?.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(fee?.dueDate)}</TableCell>
                                        <TableCell>{formatDate(fee?.paymentDate)}</TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={fee?.status || 'Unknown'} 
                                                color={getStatusColor(fee?.status)}
                                                size="medium"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {fee?.description || '-'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No fee records found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Your fee records will appear here once added by the administration.
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Payment Notice */}
            {summary.unpaid > 0 && (
                <Paper 
                    sx={{ 
                        p: 3, 
                        mt: 3, 
                        backgroundColor: '#fff3e0',
                        borderLeft: '4px solid #ff9800'
                    }}
                >
                    <Typography variant="h6" color="warning.dark" gutterBottom>
                        ⚠️ Payment Pending
                    </Typography>
                    <Typography variant="body1">
                        You have an outstanding balance of <strong>₹{summary.unpaid.toFixed(2)}</strong>. 
                        Please contact the administration office for fee payment.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default ViewFee;

