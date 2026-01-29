import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSimpleStaffDetails } from '../../../redux/staffRelated/staffHandle';
import { Paper, Box, Typography, Avatar, Grid, Chip, Divider, Button, Card, CardContent } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const StaffDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { staff, loading, error } = useSelector((state) => state.staff);

    useEffect(() => {
        dispatch(getSimpleStaffDetails(id));
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

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return 'NPR 0';
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

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
                        />
                        <Button 
                            variant="contained" 
                            color="success"
                            startIcon={<AttachMoneyIcon />}
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/Admin/salary")}
                        >
                            Manage Salary
                        </Button>
                    </Grid>

                    {/* Information Section */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Staff Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                    <PhoneIcon color="action" />
                                    <Typography>
                                        <strong>Phone:</strong> {staff.phone || 'N/A'}
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
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Salary Information */}
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Salary Information
                        </Typography>

                        <Card sx={{ mt: 2, bgcolor: '#f5f5f5' }}>
                            <CardContent>
                                {staff.salary && staff.salary.baseSalary > 0 ? (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Base Salary
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {formatCurrency(staff.salary.baseSalary)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Net Salary
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                {formatCurrency(staff.salary.netSalary || staff.salary.baseSalary)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Allowances
                                            </Typography>
                                            <Typography variant="body1" color="success.main">
                                                +{formatCurrency(
                                                    (staff.salary.allowances?.houseRent || 0) +
                                                    (staff.salary.allowances?.medical || 0) +
                                                    (staff.salary.allowances?.transport || 0) +
                                                    (staff.salary.allowances?.other || 0)
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" color="textSecondary">
                                                Deductions
                                            </Typography>
                                            <Typography variant="body1" color="error.main">
                                                -{formatCurrency(
                                                    (staff.salary.deductions?.providentFund || 0) +
                                                    (staff.salary.deductions?.tax || 0) +
                                                    (staff.salary.deductions?.insurance || 0) +
                                                    (staff.salary.deductions?.other || 0)
                                                )}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography color="textSecondary" gutterBottom>
                                            No salary record found
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            startIcon={<AttachMoneyIcon />}
                                            onClick={() => navigate("/Admin/salary")}
                                        >
                                            Set Up Salary
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        <Divider sx={{ my: 3 }} />

                        {/* ID Information */}
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            ID Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                    Staff ID: {staff._id}
                                </Typography>
                            </Grid>
                            {staff.createdAt && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Created: {new Date(staff.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            )}
                            {staff.updatedAt && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">
                                        Last Updated: {new Date(staff.updatedAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default StaffDetails;

