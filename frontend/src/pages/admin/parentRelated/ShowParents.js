import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllParents, deleteParent } from '../../../redux/parentRelated/parentHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Paper, Table, TableBody, TableContainer, TableHead, TableRow, Box, IconButton, Avatar, Typography, Chip, Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ShowParents = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { parentList, loading, error, response } = useSelector((state) => state.parent);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllParents(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Loading parents...</Typography>
            </Box>
        );
    }

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch({ type: 'parent/getDeleteSuccess', payload: null });
        dispatch(deleteParent(deleteID, address)).then(() => {
            dispatch({ type: 'parent/getSuccess', payload: [] });
            dispatch(getAllParents(currentUser._id));
        });
    };

    const columns = [
        { id: 'photo', label: 'Photo', minWidth: 80 },
        { id: 'fatherName', label: 'Father Name', minWidth: 150 },
        { id: 'motherName', label: 'Mother Name', minWidth: 150 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
        { id: 'email', label: 'Email', minWidth: 180 },
        { id: 'students', label: 'Linked Students', minWidth: 200 },
    ];

    const rows = parentList.map((parent) => {
        return {
            photo: parent.photo,
            fatherName: parent.fatherName,
            motherName: parent.motherName || '-',
            phone: parent.phone || parent.fatherPhone || '-',
            email: parent.email || '-',
            students: parent.students || [],
            id: parent._id,
        };
    });

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />,
            name: 'Add New Parent',
            action: () => navigate("/Admin/addparent")
        },
        {
            icon: <PersonRemoveIcon color="error" />,
            name: 'Delete All Parents',
            action: () => deleteHandler(currentUser._id, "Parents")
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

    const StudentCell = ({ students }) => {
        if (!students || students.length === 0) {
            return (
                <StyledTableCell>
                    <Typography variant="body2" color="textSecondary">
                        No students linked
                    </Typography>
                </StyledTableCell>
            );
        }
        
        return (
            <StyledTableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {students.slice(0, 2).map((student, index) => (
                        <Chip
                            key={student._id || index}
                            icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                            label={student.name}
                            size="small"
                            sx={{ mb: 0.5 }}
                        />
                    ))}
                    {students.length > 2 && (
                        <Chip
                            label={`+${students.length - 2} more`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Stack>
            </StyledTableCell>
        );
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            {response ? (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', p: 2 }}>
                    <GreenButton variant="contained" onClick={() => navigate("/Admin/addparent")}>
                        Add Parent
                    </GreenButton>
                </Box>
            ) : (
                <>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" component="div" sx={{ mb: 0, fontWeight: 600 }}>
                            Parent Management
                        </Typography>
                        {rows.length > 0 && (
                            <Chip 
                                icon={<GroupIcon />} 
                                label={`${rows.length} Parents`} 
                                size="small" 
                            />
                        )}
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
                                {rows.length === 0 ? (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={columns.length + 1} align="center">
                                            <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                                                No parents found. Add a new parent to get started.
                                            </Typography>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ) : (
                                    rows.map((row) => {
                                        return (
                                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    if (column.id === 'photo') {
                                                        return <PhotoCell key={column.id} photo={value} />;
                                                    }
                                                    if (column.id === 'students') {
                                                        return <StudentCell key={column.id} students={value} />;
                                                    }
                                                    return (
                                                        <StyledTableCell key={column.id} align={column.align}>
                                                            {column.format && typeof value === 'number' ? column.format(value) : value}
                                                        </StyledTableCell>
                                                    );
                                                })}
                                                <StyledTableCell align="center">
                                                    <IconButton
                                                        onClick={() => navigate("/Admin/parents/" + row.id)}
                                                        title="View Details"
                                                        color="primary"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => deleteHandler(row.id, "Parent")}
                                                        title="Delete Parent"
                                                        color="error"
                                                    >
                                                        <PersonRemoveIcon />
                                                    </IconButton>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <SpeedDialTemplate actions={actions} />
                </>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Paper>
    );
};

export default ShowParents;

