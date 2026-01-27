import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getStaffDetails } from '../../../redux/staffRelated/staffHandle';
import { Paper, Box, Typography, Avatar, Grid, Chip, Divider, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StaffDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { staff, loading, error } = useSelector((state) => state.staff);

    useEffect(() => {
        dispatch(getStaffDetails(id));
    }, [id, dispatch]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Error loading staff details</Typography>
            </Box>
        );
    }

    if (!staff) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Staff not found</Typography>
            </Box>
        );
    }

    // Calculate attendance stats
    const totalAttendance = staff.attendance?.length || 0;
    const presentCount = staff.attendance?.filter(a => a.status === 'Present').length || 0;
    const absentCount = staff.attendance?.filter(a => a.status === 'Absent').length || 0;
    const leaveCount = staff.attendance?.filter(a => a.status === 'Leave').length || 0;

    // Calculate salary
    const totalAllowances = 
        (staff.salary?.allowances?.houseRent || 0) +
        (staff.salary?.allowances?.medical || 0) +
        (staff.salary?.allowances?.transport || 0) +
        (staff.salary?.allowances?.other || 0);
    
    const totalDeductions = 
        (staff.salary?.deductions?.providentFund || 0) +
        (staff.salary?.deductions?.tax || 0) +
        (staff.salary?.deductions?.insurance || 0) +
        (staff.salary?.deductions?.other || 0);
    
    const netSalary = (staff.salary?.baseSalary || 0) + totalAllowances - totalDeductions;

    return (
        <Box sx={{ p: 3 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate("/Admin/staff")}
                sx={{ mb: 2 }}
            >
                Back to Staff List
            </Button>

            <Paper sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Profile Section */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        {staff.photo ? (
                            <Avatar 
                                src={`http://localhost:5000/${staff.photo}`}
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                            />
                        ) : (
                            <Avatar 
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                            >
                                <PersonIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                        )}
                        <Typography variant="h5" gutterBottom>
                            {staff.name}
                        </Typography>
                        <Chip 
                            label={staff.position} 
                            color="primary" 
                            sx={{ mb: 1 }}
                        />
                        <Chip 
                            label={staff.status || 'Active'} 
                            color={staff.status === 'Active' ? 'success' : 'warning'}
                            variant="outlined"
                        />
                    </Grid>

                    {/* Information Section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Personal Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon color="action" />
                                    <Typography>
                                        <strong>Email:</strong> {staff.email}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon color="action" />
                                    <Typography>
                                        <strong>Phone:</strong> {staff.phone || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WorkIcon color="action" />
                                    <Typography>
                                        <strong>Position:</strong> {staff.position}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon color="action" />
                                    <Typography>
                                        <strong>Department:</strong> {staff.department || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon color="action" />
                                    <Typography>
                                        <strong>Address:</strong> {staff.address || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarTodayIcon color="action" />
                                    <Typography>
                                        <strong>Joined:</strong> {new Date(staff.employmentDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Salary Information */}
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Salary Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={4}>
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="textSecondary">Base Salary</Typography>
                                    <Typography variant="h6">Rs. {staff.salary?.baseSalary?.toLocaleString() || '0'}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="textSecondary">Allowances</Typography>
                                    <Typography variant="h6">Rs. {totalAllowances.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Paper sx={{ p: 2, bgcolor: '#ffebee', textAlign: 'center' }}>
                                    <Typography variant="subtitle2" color="textSecondary">Deductions</Typography>
                                    <Typography variant="h6">Rs. {totalDeductions.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                                    <Typography variant="subtitle1" color="primary">Net Salary</Typography>
                                    <Typography variant="h4" color="primary">Rs. {netSalary.toLocaleString()}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Attendance Summary */}
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Attendance Summary
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main">{presentCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Present</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" color="error.main">{absentCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Absent</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" color="warning.main">{leaveCount}</Typography>
                                    <Typography variant="body2" color="textSecondary">Leave</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="h4">{totalAttendance}</Typography>
                                    <Typography variant="body2" color="textSecondary">Total Days</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default StaffDetails;

