import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllStaffs, deleteStaff } from '../../../redux/staffRelated/staffHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Paper, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow, Box, IconButton, Avatar, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const ShowStaff = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { staffList, loading, error, response } = useSelector((state) => state.staff);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllStaffs(currentUser._id));
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
        dispatch(deleteStaff(deleteID, address)).then(() => {
            dispatch({ type: 'staff/getSuccess', payload: [] });
            dispatch(getAllStaffs(currentUser._id));
        });
    };

    const columns = [
        { id: 'photo', label: 'Photo', minWidth: 80 },
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'position', label: 'Position', minWidth: 120 },
        { id: 'department', label: 'Department', minWidth: 120 },
        { id: 'email', label: 'Email', minWidth: 180 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
    ];

    const rows = staffList.map((staff) => {
        return {
            photo: staff.photo,
            name: staff.name,
            position: staff.position,
            department: staff.department || '-',
            email: staff.email,
            phone: staff.phone || '-',
            id: staff._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Staff',
            action: () => navigate("/Admin/addstaff")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Staff',
            action: () => deleteHandler(currentUser._id, "Staffs")
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
            {response ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', p: 2 }}>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addstaff")}>
                        Add Staff
                    </GreenButton>
                </Box>
            ) : (
                <>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                            Staff Management
                        </Typography>
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
                                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                <PhotoCell photo={row.photo} />
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <StyledTableCell key={column.id} align={column.align}>
                                                            {column.format && typeof value === 'number' ? column.format(value) : value}
                                                        </StyledTableCell>
                                                    );
                                                })}
                                                <StyledTableCell align="center">
                                                    <IconButton onClick={() => deleteHandler(row.id, "Staff")}>
                                                        <PersonRemoveIcon color="error" />
                                                    </IconButton>
                                                    <BlueButton variant="contained"
                                                        onClick={() => navigate("/Admin/staff/" + row.id)}>
                                                        View
                                                    </BlueButton>
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

