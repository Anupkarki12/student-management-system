import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ShowSalary = () => {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [formData, setFormData] = useState({
        employeeType: 'teacher',
        employeeId: '',
        baseSalary: '',
        allowances: '',
        deductions: '',
        paymentDate: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/Salaries/:schoolId', {
                params: { schoolId: localStorage.getItem('schoolId') }
            });
            setSalaries(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching salaries:', error);
            setLoading(false);
        }
    };

    const handleOpenDialog = (salary = null) => {
        if (salary) {
            setEditingSalary(salary);
            setFormData({
                employeeType: salary.employeeType,
                employeeId: salary.employeeId,
                baseSalary: salary.baseSalary,
                allowances: salary.allowances,
                deductions: salary.deductions,
                paymentDate: salary.paymentDate,
                status: salary.status
            });
        } else {
            setEditingSalary(null);
            setFormData({
                employeeType: 'teacher',
                employeeId: '',
                baseSalary: '',
                allowances: '',
                deductions: '',
                paymentDate: '',
                status: 'pending'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingSalary(null);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingSalary) {
                await axios.put(`http://localhost:5000/api/Salary/${editingSalary._id}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/Salary/Create', {
                    ...formData,
                    schoolId: localStorage.getItem('schoolId')
                });
            }
            fetchSalaries();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving salary:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record?')) {
            try {
                await axios.delete(`http://localhost:5000/api/Salary/${id}`);
                fetchSalaries();
            } catch (error) {
                console.error('Error deleting salary:', error);
            }
        }
    };

    const calculateNetSalary = (baseSalary, allowances, deductions) => {
        return parseFloat(baseSalary || 0) + parseFloat(allowances || 0) - parseFloat(deductions || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Salary Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Salary
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee Type</TableCell>
                            <TableCell>Employee ID</TableCell>
                            <TableCell>Base Salary</TableCell>
                            <TableCell>Allowances</TableCell>
                            <TableCell>Deductions</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Payment Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {salaries.map((salary) => (
                            <TableRow key={salary._id}>
                                <TableCell>{salary.employeeType}</TableCell>
                                <TableCell>{salary.employeeId}</TableCell>
                                <TableCell>Rs. {salary.baseSalary}</TableCell>
                                <TableCell>Rs. {salary.allowances}</TableCell>
                                <TableCell>Rs. {salary.deductions}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    Rs. {calculateNetSalary(salary.baseSalary, salary.allowances, salary.deductions)}
                                </TableCell>
                                <TableCell>{new Date(salary.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={salary.status} 
                                        color={getStatusColor(salary.status)} 
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(salary)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(salary._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSalary ? 'Edit Salary' : 'Add New Salary'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Employee Type</InputLabel>
                            <Select
                                name="employeeType"
                                value={formData.employeeType}
                                onChange={handleChange}
                                label="Employee Type"
                            >
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="staff">Staff</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Employee ID"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Base Salary"
                            name="baseSalary"
                            type="number"
                            value={formData.baseSalary}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Allowances"
                            name="allowances"
                            type="number"
                            value={formData.allowances}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Deductions"
                            name="deductions"
                            type="number"
                            value={formData.deductions}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Payment Date"
                            name="paymentDate"
                            type="date"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="paid">Paid</MenuItem>
                                <MenuItem value="overdue">Overdue</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingSalary ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShowSalary;
