import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSimpleStaffs, deleteSimpleStaff, deleteAllSimpleStaffs } from '../../../redux/staffRelated/staffHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { GreenButton } from '../../../components/buttonStyles';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Paper, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Box, IconButton, Avatar, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddIcon from '@mui/icons-material/Add';

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
        return <div>Loading...</div>;
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
        { id: 'id', label: 'ID', minWidth: 100 },
        { id: 'name', label: 'Name', minWidth: 150 },
        { id: 'address', label: 'Address', minWidth: 150 },
        { id: 'position', label: 'Position', minWidth: 120 },
        { id: 'phone', label: 'Phone Number', minWidth: 120 },
    ];

    const rows = Array.isArray(staffList) ? staffList.map((staff) => {
        return {
            photo: staff.photo,
            id: staff._id ? staff._id.substring(0, 8) : '-',
            name: staff.name,
            address: staff.address || '-',
            position: staff.position,
            phone: staff.phone || '-',
            fullId: staff._id,
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
                    sx={{ width: 40, height: 40 }}
                />
            ) : (
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                </Avatar>
            )}
        </StyledTableCell>
    );

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {response === "No staff found" || !Array.isArray(staffList) || staffList.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                        No Staff Found
                    </Typography>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addstaff")}>
                        Add New Staff
                    </GreenButton>
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                        <Typography variant="h6" component="div">
                            Staff List
                        </Typography>
                        <GreenButton 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/Admin/addstaff")}
                        >
                            Add New Staff
                        </GreenButton>
                    </Box>
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
                                {rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        return (
                                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.fullId}>
                                                <PhotoCell photo={row.photo} />
                                                {columns.map((column) => {
                                                    if (column.id === 'photo') return null;
                                                    const value = row[column.id];
                                                    return (
                                                        <StyledTableCell key={column.id} align={column.align}>
                                                            {column.format && typeof value === 'number' ? column.format(value) : value}
                                                        </StyledTableCell>
                                                    );
                                                })}
                                                <StyledTableCell align="center">
                                                    <IconButton onClick={() => deleteHandler(row.fullId, "Staff")}>
                                                        <PersonRemoveIcon color="error" />
                                                    </IconButton>
                                                    <GreenButton 
                                                        variant="contained" 
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                        onClick={() => navigate("/Admin/staff/" + row.fullId)}
                                                    >
                                                        View
                                                    </GreenButton>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 5));
                            setPage(0);
                        }}
                    />
                    <SpeedDialTemplate actions={actions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowStaff;

