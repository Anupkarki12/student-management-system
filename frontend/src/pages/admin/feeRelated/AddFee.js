import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { addFee, getAllFees } from '../../../redux/feeRelated/feeHandle';
import { Box, Button, Container, MenuItem, Select, FormControl, InputLabel, TextField, Typography, Paper, Grid } from '@mui/material';
import Popup from '../../../components/Popup';

const AddFee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.user);
    const { studentsList } = useSelector((state) => state.student);
    const { response } = useSelector((state) => state.fee);

    const [studentId, setStudentId] = useState('');
    const [month, setMonth] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [duesAmount, setDuesAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (currentUser) {
            dispatch(getAllStudents(currentUser._id));
        }
    }, [currentUser, dispatch]);

    // Check for success response and redirect
    useEffect(() => {
        if (response === "Done") {
            setMessage("Fee added successfully!");
            setShowPopup(true);
            // Reset the response state so the popup can show again for subsequent operations
            dispatch({ type: 'fee/stuffDone', payload: null });
            // Redirect to fees page after short delay
            setTimeout(() => {
                navigate('/Admin/fees');
            }, 1500);
        }
    }, [response, dispatch, navigate]);

    const handleAddFee = () => {
        if (!studentId || !month || !monthlyAmount || !dueDate) {
            alert("Please fill all required fields");
            return;
        }

        const monthly = parseFloat(monthlyAmount);
        const dues = parseFloat(duesAmount) || 0;
        
        const newFeeDetail = {
            month: `${month} ${currentYear}`,
            monthlyAmount: monthly,
            duesAmount: dues,
            amount: monthly + dues,
            dueDate: dueDate,
            description: description,
            status: 'Unpaid'
        };

        const data = {
            studentId: studentId,
            schoolId: currentUser._id,
            feeDetails: [newFeeDetail]
        };

        dispatch(addFee(data));
        
        setMonth('');
        setMonthlyAmount('');
        setDuesAmount('');
        setDueDate('');
        setDescription('');
        setStudentId('');
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Add Fee for Student
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="student-select-label">Select Student</InputLabel>
                            <Select
                                labelId="student-select-label"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                label="Select Student"
                            >
                                {studentsList && studentsList.map((student) => (
                                    <MenuItem key={student._id} value={student._id}>
                                        {student.name} - Roll: {student.rollNum} - Class: {student.sclassName?.sclassName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select
                                labelId="month-select-label"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                label="Month"
                            >
                                {months.map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {m} {currentYear}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Monthly Fee"
                            type="number"
                            value={monthlyAmount}
                            onChange={(e) => setMonthlyAmount(e.target.value)}
                            InputProps={{ inputProps: { min: 0 } }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Dues (Previous Pending)"
                            type="number"
                            value={duesAmount}
                            onChange={(e) => setDuesAmount(e.target.value)}
                            InputProps={{ inputProps: { min: 0 } }}
                            helperText="Enter any previous dues amount (optional)"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Due Date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={handleAddFee}
                            >
                                Add Fee
                            </Button>
                            <Button 
                                variant="outlined"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddFee;

