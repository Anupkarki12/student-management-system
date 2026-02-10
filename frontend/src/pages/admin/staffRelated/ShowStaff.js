import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSimpleStaffs, deleteSimpleStaff, deleteAllSimpleStaffs } from '../../../redux/staffRelated/staffHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { GreenButton } from '../../../components/buttonStyles';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import styled, { keyframes } from 'styled-components';
import PersonIcon from '@mui/icons-material/Person';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const cardFloat = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const ShowStaff = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { staffList, loading, error, response } = useSelector((state) => state.staff);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllSimpleStaffs(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading staff...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch({ type: 'staff/getDeleteSuccess', payload: null });
        dispatch(deleteSimpleStaff(deleteID)).then(() => {
            dispatch({ type: 'staff/getSuccess', payload: [] });
            dispatch(getAllSimpleStaffs(currentUser._id));
        });
    };

    const deleteAllHandler = () => {
        dispatch({ type: 'staff/getDeleteSuccess', payload: null });
        dispatch(deleteAllSimpleStaffs(currentUser._id)).then(() => {
            dispatch({ type: 'staff/getSuccess', payload: [] });
            dispatch(getAllSimpleStaffs(currentUser._id));
        });
    };

    const columns = [
        { id: 'photo', label: 'Photo', minWidth: 80 },
        { id: 'name', label: 'Name', minWidth: 150 },
        { id: 'address', label: 'Address', minWidth: 150 },
        { id: 'position', label: 'Position', minWidth: 120 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
    ];

    const rows = Array.isArray(staffList) ? staffList.map((staff) => {
        return {
            photo: staff.photo,
            name: staff.name,
            address: staff.address || '-',
            position: staff.position || '-',
            phone: staff.phone || '-',
            id: staff._id,
        };
    }) : [];

    const actions = [
        {
            icon: <AddIcon color="primary" />,
            name: 'Add New Staff',
            action: () => navigate("/Admin/addstaff")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Staff',
            action: () => deleteAllHandler()
        },
    ];

    const PhotoCell = ({ photo }) => (
        <StyledTableCell>
            {photo ? (
                <Avatar 
                    src={`http://localhost:5000/${photo}`} 
                    sx={{ width: 44, height: 44 }}
                />
            ) : (
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#667eea' }}>
                    <PersonIcon />
                </Avatar>
            )}
        </StyledTableCell>
    );

    // Empty state view
    if (response === "No staff found" || !Array.isArray(staffList) || staffList.length === 0) {
        return (
            <PageContainer>
                <EmptyStateContainer>
                    <EmptyStateIcon>👥</EmptyStateIcon>
                    <EmptyStateTitle>No Staff Found</EmptyStateTitle>
                    <EmptyStateText>Add staff members to manage your institution</EmptyStateText>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addstaff")}>
                        <AddIcon sx={{ mr: 1 }} />
                        Add Staff
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
                        <HeaderTitle>👥 Staff Management</HeaderTitle>
                        <HeaderSubtitle>Manage staff profiles and positions</HeaderSubtitle>
                    </HeaderLeft>
                    <AddButton variant="contained" onClick={() => navigate("/Admin/addstaff")}>
                        <AddIcon sx={{ mr: 1 }} />
                        Add Staff
                    </AddButton>
                </HeaderSection>

                <StatsRow>
                    <StatChip 
                        icon={<GroupIcon />} 
                        label={`${rows.length} Staff Members`} 
                    />
                </StatsRow>

                <TablePaper>
                    <TableContainer>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <StyledTableRow>
                                    {columns.map((column) => (
                                        <StyledTableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </StyledTableCell>
                                    ))}
                                    <StyledTableCell align="center">
                                        Actions
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={columns.length + 1} align="center">
                                            <EmptyTableCell>
                                                No staff found. Add a new staff to get started.
                                            </EmptyTableCell>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ) : (
                                    rows
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => {
                                            return (
                                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        if (column.id === 'photo') {
                                                            return <PhotoCell key={column.id} photo={value} />;
                                                        }
                                                        return (
                                                            <StyledTableCell key={column.id} align={column.align}>
                                                                <TableText>
                                                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                                                </TableText>
                                                            </StyledTableCell>
                                                        );
                                                    })}
                                                    <StyledTableCell align="center">
                                                        <ActionButtons>
                                                            <IconButton
                                                                onClick={() => navigate("/Admin/staff/" + row.id)}
                                                                title="View Details"
                                                                sx={{ color: '#667eea' }}
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => deleteHandler(row.id, "Staff")}
                                                                title="Delete Staff"
                                                                sx={{ color: '#f5576c' }}
                                                            >
                                                                <PersonRemoveIcon />
                                                            </IconButton>
                                                        </ActionButtons>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            );
                                        })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                            Showing {Math.min(page * rowsPerPage + 1, rows.length)}-{Math.min((page + 1) * rowsPerPage, rows.length)} of {rows.length}
                        </Typography>
                    </Box>
                    <SpeedDialTemplate actions={actions} />
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
`;

const StatChip = styled(Chip)`
    font-weight: 600 !important;
    background: #f0f4ff !important;
    color: #667eea !important;
    
    .MuiChip-icon {
        color: #667eea;
    }
`;

const TablePaper = styled(Paper)`
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
`;

const TableText = styled.span`
    color: #1a1a2e;
    font-size: 0.9rem;
`;

const EmptyTableCell = styled(Typography)`
    color: #888 !important;
    py: 4 !important;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 4px;
    justify-content: center;
`;

export default ShowStaff;

