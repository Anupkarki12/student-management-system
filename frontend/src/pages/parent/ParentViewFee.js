import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentFee } from '../../redux/feeRelated/feeHandle';
import { getParentDashboard } from '../../redux/parentRelated/parentHandle';
import { 
    Box, Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Grid, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Card
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatNepaliDate } from '../../utils/nepaliDate';

const ParentViewFee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { studentId } = useParams();

    const { currentUser, userDetails } = useSelector((state) => state.user);
    const { feesList, loading, error } = useSelector((state) => state.fee);
    const { userDetails: parentUserDetails } = useSelector((state) => state.parent);

    const [feeData, setFeeData] = useState(null);
    const [selectedChild, setSelectedChild] = useState(studentId || '');
    const [dashboardData, setDashboardData] = useState(null);

    const getChildrenList = () => {
        if (dashboardData?.students) {
            return dashboardData.students;
        }
        if (parentUserDetails?.students) {
            return parentUserDetails.students;
        }
        return [];
    };

    const children = getChildrenList();

    // Fetch parent dashboard data to get children list
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getParentDashboard(currentUser._id));
        }
    }, [dispatch, currentUser]);

    // Update dashboard data when parentUserDetails changes
    useEffect(() => {
        if (parentUserDetails?.students) {
            setDashboardData(parentUserDetails);
        }
    }, [parentUserDetails]);

    // Fetch fee data when a child is selected
    useEffect(() => {
        if (selectedChild) {
            dispatch(getStudentFee(selectedChild));
        }
    }, [dispatch, selectedChild]);

    // Update fee data when feesList changes
    useEffect(() => {
        if (feesList && Array.isArray(feesList) && feesList.length > 0) {
            setFeeData(feesList[0]);
        } else {
            setFeeData(null);
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
        const date = new Date(dateString);
        if (date.toString() === 'Invalid Date') return 'N/A';
        return formatNepaliDate(date, { format: 'full', showDayName: false });
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
                partial += fee.paidAmount || (fee.amount / 2);
                unpaid += fee.amount - (fee.paidAmount || (fee.amount / 2));
            } else {
                unpaid += fee.amount;
            }
        });
        
        return { total, paid, partial, unpaid };
    };

    const summary = calculateSummary();

    const handleChildChange = (event) => {
        const newChildId = event.target.value;
        setSelectedChild(newChildId);
        navigate(`/Parent/child/${newChildId}/fees`);
    };

    if (loading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    const selectedChildData = children.find(c => c.studentId === selectedChild);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <PaymentIcon sx={{ fontSize: 60, color: '#7f56da', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">
                    Fee Details
                </Typography>
            </Box>

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
                    {/* Student Info */}
                    {selectedChildData && (
                        <Card sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">
                                <strong>Student:</strong> {selectedChildData.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Roll No: {selectedChildData.rollNum} | Class: {selectedChildData.class}
                            </Typography>
                        </Card>
                    )}

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
                                        <TableRow sx={{ backgroundColor: '#7f56da' }}>
                                            <TableCell sx={{ color: 'white' }}><strong>Month</strong></TableCell>
                                            <TableCell align="right" sx={{ color: 'white' }}><strong>Amount (₹)</strong></TableCell>
                                            <TableCell sx={{ color: 'white' }}><strong>Due Date</strong></TableCell>
                                            <TableCell sx={{ color: 'white' }}><strong>Payment Date</strong></TableCell>
                                            <TableCell align="center" sx={{ color: 'white' }}><strong>Status</strong></TableCell>
                                            <TableCell sx={{ color: 'white' }}><strong>Description</strong></TableCell>
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
                                    Fee records for this student will appear here once added by the administration.
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
                                Outstanding balance: <strong>₹{summary.unpaid.toFixed(2)}</strong>. 
                                Please contact the administration office for fee payment.
                            </Typography>
                        </Paper>
                    )}
                </>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <PaymentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                        Please select a child to view their fee details
                    </Typography>
                </Card>
            )}
        </Container>
    );
};

export default ParentViewFee;

