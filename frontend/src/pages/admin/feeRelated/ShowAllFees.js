import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllFees, updateFeeStatus } from '../../../redux/feeRelated/feeHandle';
import { deleteFee } from '../../../redux/feeRelated/feeHandle';
import { 
    Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Typography, Chip, Tooltip, Card, CardContent,
    Grid, Avatar, LinearProgress, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import styled, { keyframes } from 'styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import Popup from '../../../components/Popup';
import { GreenButton } from '../../../components/buttonStyles';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddCircleIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { 
    exportToExcel, 
    getCurrentDateString, 
    monthsList, 
    getCurrentYear, 
    getMonthYearOptions,
    formatDate 
} from '../../../utils/excelExport';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const ShowAllFees = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.user);
    const { feesList, loading, error, response } = useSelector((state) => state.fee);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

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

    // Get unique months from the fee records
    const getUniqueMonths = () => {
        if (!feesList || !Array.isArray(feesList)) return [];
        
        const months = new Set();
        feesList.forEach((fee) => {
            if (fee.feeDetails && fee.feeDetails.length > 0) {
                fee.feeDetails.forEach((detail) => {
                    if (detail.month) {
                        months.add(detail.month);
                    }
                });
            }
        });
        return Array.from(months).sort((a, b) => {
            const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
            return monthsOrder.indexOf(monthA) - monthsOrder.indexOf(monthB);
        });
    };

    const uniqueMonths = getUniqueMonths();

    // Export fees to Excel
    const handleExportFees = () => {
        const feesToExport = getFlattenedFees();
        if (feesToExport.length === 0) {
            alert('No fees to export');
            return;
        }

        const exportData = feesToExport.map((fee) => ({
            'Student Name': fee.studentName,
            'Roll Number': fee.rollNum,
            'Class': fee.className,
            'Month': fee.month,
            'Amount (₹)': fee.amount,
            'Paid Amount (₹)': fee.paidAmount || 0,
            'Due Amount (₹)': (fee.amount - (fee.paidAmount || 0)),
            'Due Date': formatDate(fee.dueDate),
            'Payment Date': formatDate(fee.paymentDate),
            'Status': fee.status,
            'Description': fee.description || '-'
        }));

        const monthSuffix = selectedMonth ? `_${selectedMonth.replace(' ', '_')}` : '';
        const classSuffix = selectedClass ? `_Class_${uniqueClasses.find(c => c._id === selectedClass)?.sclassName || ''}` : '';
        const fileName = `Fees${monthSuffix}${classSuffix}_${getCurrentDateString()}`;
        exportToExcel(exportData, fileName, 'Fees');
    };

    // Get filtered fees for display
    const getFilteredFeesForDisplay = () => {
        let fees = getFlattenedFees();
        
        // Filter by selected month
        if (selectedMonth) {
            fees = fees.filter(fee => fee.month === selectedMonth);
        }
        
        return fees;
    };

    const displayFees = getFilteredFeesForDisplay();
    const displaySummary = calculateDisplaySummary(displayFees);

    function calculateDisplaySummary(fees) {
        if (fees.length === 0) {
            return { total: 0, paid: 0, partial: 0, unpaid: 0 };
        }
        
        let total = 0;
        let paid = 0;
        let partial = 0;
        let unpaid = 0;
        
        fees.forEach((detail) => {
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
    }

    const paymentPercentage = displaySummary.total > 0 ? ((displaySummary.paid + displaySummary.partial) / displaySummary.total * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading fees...</LoadingText>
            </LoadingContainer>
        );
    }

    // Empty state view
    if (response || !allFees || allFees.length === 0) {
        return (
            <PageContainer>
                <EmptyStateContainer>
                    <EmptyStateIcon>💰</EmptyStateIcon>
                    <EmptyStateTitle>No Fee Records Found</EmptyStateTitle>
                    <EmptyStateText>Add fee records to track payments</EmptyStateText>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addfee")}>
                        <AddCircleIcon sx={{ mr: 1 }} />
                        Add Fee
                    </GreenButton>
                </EmptyStateContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContainer>
                <HeaderSection>
                    <HeaderLeft>
                        <HeaderTitle>💰 Fee Management</HeaderTitle>
                        <HeaderSubtitle>Track and manage all student fee payments</HeaderSubtitle>
                    </HeaderLeft>
                    <AddButton variant="contained" onClick={() => navigate("/Admin/addfee")}>
                        <AddCircleIcon sx={{ mr: 1 }} />
                        Add Fee
                    </AddButton>
                </HeaderSection>

                <StatsRow>
                    <StatChip 
                        icon={<AttachMoneyIcon />}
                        label={`Total: ₹${allSummary.total.toLocaleString()}`}
                    />
                    <StatChip 
                        icon={<CheckCircleIcon />}
                        label={`Paid: ₹${allSummary.paid.toLocaleString()}`}
                        sx={{ bgcolor: '#e8f5e9 !important', color: '#4caf50 !important' }}
                    />
                    <StatChip 
                        icon={<WarningIcon />}
                        label={`Due: ₹${allSummary.unpaid.toLocaleString()}`}
                        sx={{ bgcolor: '#ffebee !important', color: '#f44336 !important' }}
                    />
                </StatsRow>

                <FilterCard>
                    <FilterTitle>Filter Records</FilterTitle>
                    <FilterRow>
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
                        
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Filter by Month</InputLabel>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                label="Filter by Month"
                            >
                                <MenuItem value="">All Months</MenuItem>
                                {uniqueMonths.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {selectedMonth && (
                            <Chip 
                                label={selectedMonth}
                                onDelete={() => setSelectedMonth("")}
                                color="secondary"
                                variant="outlined"
                            />
                        )}
                        
                        <Box sx={{ flexGrow: 1 }} />
                        
                        <ExportButton 
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExportFees}
                            disabled={allFees.length === 0}
                        >
                            Export Excel
                        </ExportButton>
                        
                        <Typography variant="body2" color="textSecondary">
                            {displayFees.length} record{displayFees.length !== 1 ? 's' : ''} found
                        </Typography>
                    </FilterRow>
                </FilterCard>

                {/* Summary Cards */}
                <SummaryGrid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <SummaryCard bgcolor="#e3f2fd">
                            <SummaryIcon bgcolor="#bbdefb">
                                <PaymentIcon sx={{ color: '#1976d2' }} />
                            </SummaryIcon>
                            <SummaryInfo>
                                <SummaryLabel>Total Amount</SummaryLabel>
                                <SummaryValue>₹{allSummary.total.toLocaleString()}</SummaryValue>
                            </SummaryInfo>
                        </SummaryCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <SummaryCard bgcolor="#e8f5e9">
                            <SummaryIcon bgcolor="#c8e6c9">
                                <CheckCircleIcon sx={{ color: '#4caf50' }} />
                            </SummaryIcon>
                            <SummaryInfo>
                                <SummaryLabel>Paid Amount</SummaryLabel>
                                <SummaryValue color="#4caf50">₹{allSummary.paid.toLocaleString()}</SummaryValue>
                            </SummaryInfo>
                        </SummaryCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <SummaryCard bgcolor="#fff3e0">
                            <SummaryIcon bgcolor="#ffe0b2">
                                <WarningIcon sx={{ color: '#ff9800' }} />
                            </SummaryIcon>
                            <SummaryInfo>
                                <SummaryLabel>Due Amount</SummaryLabel>
                                <SummaryValue color="#ff9800">₹{allSummary.unpaid.toLocaleString()}</SummaryValue>
                            </SummaryInfo>
                        </SummaryCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <SummaryCard bgcolor="#f3e5f5">
                            <SummaryIcon bgcolor="#e1bee7">
                                <PaymentIcon sx={{ color: '#9c27b0' }} />
                            </SummaryIcon>
                            <SummaryInfo>
                                <SummaryLabel>Collection Rate</SummaryLabel>
                                <SummaryValue color="#9c27b0">{paymentPercentage}%</SummaryValue>
                            </SummaryInfo>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(paymentPercentage)} 
                                sx={{ mt: 1, borderRadius: 5, height: 6, bgcolor: 'rgba(156, 39, 176, 0.1)' }} 
                            />
                        </SummaryCard>
                    </Grid>
                </SummaryGrid>

                {/* Fee Table */}
                <TablePaper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTh>Student</StyledTh>
                                    <StyledTh>Roll No.</StyledTh>
                                    <StyledTh>Class</StyledTh>
                                    <StyledTh>Month</StyledTh>
                                    <StyledTh align="right">Amount</StyledTh>
                                    <StyledTh>Due Date</StyledTh>
                                    <StyledTh>Payment Date</StyledTh>
                                    <StyledTh>Status</StyledTh>
                                    <StyledTh align="center">Actions</StyledTh>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allFees.map((fee, index) => (
                                    <StyledTableRow 
                                        key={index}
                                    >
                                        <TableCell>
                                            <StudentCell>
                                                <StudentAvatar>
                                                    {fee.studentName?.charAt(0)?.toUpperCase()}
                                                </StudentAvatar>
                                                <StudentName>{fee.studentName}</StudentName>
                                            </StudentCell>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {fee.rollNum}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ClassChip label={fee.className} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {fee.month}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <AmountText>₹{fee.amount?.toLocaleString()}</AmountText>
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
                                            <StatusChip 
                                                label={fee.status}
                                                onClick={() => fee && fee._id && handleToggleStatus(fee)}
                                                clickable
                                                sx={{ 
                                                    bgcolor: getStatusBgColor(fee.status),
                                                    color: getStatusColor(fee.status),
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <ActionButtons>
                                                <IconButton
                                                    onClick={() => fee.studentId && handleViewDetails(fee.studentId)}
                                                    title="View Details"
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => fee.studentId && fee._id && handleDelete(fee.studentId, fee._id)}
                                                    title="Delete Fee"
                                                    sx={{ color: '#f5576c' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ActionButtons>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TablePaper>
            </MainContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
    padding: 24px;
`;

const MainContainer = styled.div`
    animation: ${fadeIn} 0.4s ease-out;
`;

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
    
    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    flex-direction: column;
`;

const HeaderTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 0.9rem;
    color: #888;
    margin: 0;
`;

const AddButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
    
    &:hover {
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
        transform: translateY(-2px);
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    color: #667eea;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid #f0f0f0;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingText = styled.p`
    margin-top: 16px;
    font-size: 1rem;
    color: #888;
`;

const EmptyStateContainer = styled.div`
    text-align: center;
    padding: 80px 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    max-width: 400px;
    margin: 100px auto;
`;

const EmptyStateIcon = styled.div`
    font-size: 5rem;
    margin-bottom: 16px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
    font-size: 0.95rem;
    color: #888;
    margin: 0 0 16px 0;
`;

const StatsRow = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
`;

const StatChip = styled(Chip)`
    font-weight: 600 !important;
    background: #f0f4ff !important;
    color: #667eea !important;
    
    .MuiChip-icon {
        color: #667eea;
    }
`;

const FilterCard = styled(Card)`
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    margin-bottom: 24px;
`;

const FilterTitle = styled(Typography)`
    font-weight: 600 !important;
    color: #1a1a2e;
    padding: 16px 20px 8px;
`;

const FilterRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px 16px;
    flex-wrap: wrap;
`;

const ExportButton = styled(Button)`
    border-radius: 12px !important;
    padding: 8px 16px !important;
    font-weight: 600 !important;
    border-color: #667eea !important;
    color: #667eea !important;
    
    &:hover {
        background: #f0f4ff !important;
        border-color: #667eea !important;
    }
`;

const SummaryGrid = styled(Grid)`
    margin-bottom: 24px;
`;

const SummaryCard = styled(Card)`
    border-radius: 16px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    height: 100%;
    background: ${props => props.bgcolor} !important;
`;

const SummaryIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.bgcolor};
    margin-bottom: 12px;
    
    & svg {
        font-size: 24px;
    }
`;

const SummaryInfo = styled.div`
    flex: 1;
`;

const SummaryLabel = styled.p`
    font-size: 0.85rem;
    color: #888;
    margin: 0 0 4px 0;
`;

const SummaryValue = styled.p`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.color || '#1a1a2e'};
    margin: 0;
`;

const TablePaper = styled(Paper)`
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
`;

const StyledTh = styled(TableCell)`
    font-weight: 600 !important;
    color: #64748b !important;
    background: #f8fafc !important;
    padding: 16px !important;
`;

const StyledTableRow = styled(TableRow)`
    &:hover {
        background-color: #f8fafc !important;
    }
    transition: background-color 0.2s;
`;

const StudentCell = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const StudentAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    font-weight: 600;
`;

const StudentName = styled(Typography)`
    font-weight: 500 !important;
    color: #1a1a2e;
`;

const ClassChip = styled(Chip)`
    background: #f1f5f9 !important;
    font-weight: 500 !important;
`;

const AmountText = styled.span`
    font-weight: 600;
    color: #1a1a2e;
`;

const StatusChip = styled(Chip)`
    font-weight: 600 !important;
    cursor: pointer;
    
    &:hover {
        opacity: 0.9;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 4px;
    justify-content: center;
`;

export default ShowAllFees;

