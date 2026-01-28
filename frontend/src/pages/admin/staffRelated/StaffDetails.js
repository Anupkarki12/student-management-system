import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSimpleStaffDetails } from '../../../redux/staffRelated/staffHandle';
import { Paper, Box, Typography, Avatar, Grid, Chip, Divider, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

