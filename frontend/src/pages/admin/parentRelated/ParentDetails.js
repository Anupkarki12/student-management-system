import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getParentDetails } from '../../../redux/parentRelated/parentHandle';
import { Paper, Box, Typography, Avatar, Grid, Chip, Divider, Button, List, ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const ParentDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { parent, loading, error } = useSelector((state) => state.parent);

    useEffect(() => {
        dispatch(getParentDetails(id));
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
                <Typography color="error">Error loading parent details</Typography>
            </Box>
        );
    }

    if (!parent) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Parent not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate("/Admin/parents")}
                sx={{ mb: 2 }}
            >
                Back to Parents List
            </Button>

            <Paper sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Profile Section */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        {parent.photo ? (
                            <Avatar 
                                src={`http://localhost:5000/${parent.photo}`}
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                            />
                        ) : (
                            <Avatar 
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                            >
                                <FamilyRestroomIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                        )}
                        <Typography variant="h5" gutterBottom>
                            {parent.fatherName}
                        </Typography>
                        <Chip 
                            label="Parent" 
                            color="primary" 
                            sx={{ mb: 1 }}
                        />
                    </Grid>

                    {/* Information Section */}
                    <Grid item xs={12} md={8}>
                        {/* Father's Information */}
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Father's Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="action" />
                                    <Typography>
                                        <strong>Name:</strong> {parent.fatherName}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WorkIcon color="action" />
                                    <Typography>
                                        <strong>Occupation:</strong> {parent.fatherOccupation || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon color="action" />
                                    <Typography>
                                        <strong>Phone:</strong> {parent.fatherPhone || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon color="action" />
                                    <Typography>
                                        <strong>Email:</strong> {parent.fatherEmail || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Mother's Information */}
                        {parent.motherName && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                                    Mother's Information
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon color="action" />
                                            <Typography>
                                                <strong>Name:</strong> {parent.motherName}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WorkIcon color="action" />
                                            <Typography>
                                                <strong>Occupation:</strong> {parent.motherOccupation || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon color="action" />
                                            <Typography>
                                                <strong>Phone:</strong> {parent.motherPhone || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon color="action" />
                                            <Typography>
                                                <strong>Email:</strong> {parent.motherEmail || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        {/* Guardian Information */}
                        {parent.guardianName && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                                    Guardian Information
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon color="action" />
                                            <Typography>
                                                <strong>Name:</strong> {parent.guardianName}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>
                                                <strong>Relation:</strong> {parent.guardianRelation || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PhoneIcon color="action" />
                                            <Typography>
                                                <strong>Phone:</strong> {parent.guardianPhone || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon color="action" />
                                            <Typography>
                                                <strong>Email:</strong> {parent.guardianEmail || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon color="action" />
                                            <Typography>
                                                <strong>Address:</strong> {parent.guardianAddress || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        {/* Contact Information */}
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Contact Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOnIcon color="action" />
                                    <Typography>
                                        <strong>Address:</strong> {parent.address || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon color="action" />
                                    <Typography>
                                        <strong>Phone:</strong> {parent.phone || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon color="action" />
                                    <Typography>
                                        <strong>Email:</strong> {parent.email || 'N/A'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Linked Students */}
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #7f56da', pb: 1 }}>
                            Linked Students
                        </Typography>

                        {parent.students && parent.students.length > 0 ? (
                            <List>
                                {parent.students.map((student) => (
                                    <ListItem key={student._id} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={student.name}
                                            secondary={`Roll: ${student.rollNum} - Class: ${student.sclassName?.sclassName || 'N/A'}`}
                                        />
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            onClick={() => navigate(`/Admin/students/student/${student._id}`)}
                                        >
                                            View Student
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <GroupIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                <Typography color="textSecondary">
                                    No students linked to this parent
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate(`/Admin/parents/link/${id}`)}
                                >
                                    Link Student
                                </Button>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ParentDetails;

