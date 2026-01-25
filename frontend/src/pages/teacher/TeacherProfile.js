import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Box, Typography, Avatar, Paper, Grid, 
    Container, Divider, Chip, Button
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { authSuccess } from '../../redux/userRelated/userSlice';

const TeacherProfile = () => {
    const dispatch = useDispatch();
    const { currentUser, response, error } = useSelector((state) => state.user);

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const teachSclass = currentUser?.teachSclass;
    const teachSubject = currentUser?.teachSubject;
    const teachSchool = currentUser?.school;

    // Get photo URL or use default avatar
    const photoUrl = currentUser?.photo 
        ? `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${currentUser.photo}`
        : null;

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadPhoto = async () => {
        if (!photo) return;
        
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', photo);

            const result = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/ProfilePhotoUpload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (result.data.photo) {
                // Update local state with new photo
                setPhotoPreview(null);
                setPhoto(null);
                
                // Update Redux state
                dispatch(authSuccess({
                    ...currentUser,
                    photo: result.data.photo
                }));
                
                alert('Photo updated successfully!');
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            alert('Error uploading photo. Please try again.');
        }
        setUploading(false);
    };

    const cancelPhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Profile Header Card */}
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box 
                    sx={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        p: 4,
                        textAlign: 'center',
                        color: 'white'
                    }}
                >
                    <Box display="flex" justifyContent="center" mb={2} sx={{ position: 'relative' }}>
                        <Avatar 
                            alt={currentUser?.name}
                            src={photoPreview || photoUrl}
                            sx={{ 
                                width: 150, 
                                height: 150,
                                border: '4px solid white',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                            }}
                        >
                            {currentUser?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        
                        {/* Photo Upload Button Overlay */}
                        <Button
                            component="label"
                            variant="contained"
                            color="error"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 'calc(50% - 75px)',
                                borderRadius: '50%',
                                minWidth: '50px',
                                width: '50px',
                                height: '50px',
                                p: 0,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                        </Button>
                    </Box>

                    {/* Photo Upload/Preview Section */}
                    {photoPreview && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                New photo selected - Click Update to save
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    onClick={handleUploadPhoto}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Update Photo'}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error"
                                    onClick={cancelPhoto}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    )}

                    <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mt: 2 }}>
                        {currentUser?.name}
                    </Typography>
                    <Chip 
                        label="Teacher" 
                        color="error" 
                        sx={{ mt: 1 }}
                    />
                </Box>

                {/* Professional Information */}
                <Box p={4}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Professional Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <ClassIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Assigned Class
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {teachSclass?.sclassName || 'Not Assigned'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <SubjectIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Subject
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {teachSubject?.subName || 'Not Assigned'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <SchoolIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        School
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {teachSchool?.schoolName || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <EmailIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {currentUser?.email || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Additional Info Card */}
                <Box p={4} bgcolor="#f9f9f9">
                    <Typography variant="h6" gutterBottom color="primary">
                        Additional Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <BadgeIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Role
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {currentUser?.role || 'Teacher'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <BadgeIcon color="primary" />
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Teacher ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {currentUser?._id?.slice(-8)}...
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                                Phone
                            </Typography>
                            <Typography variant="body1">
                                Not provided
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default TeacherProfile;

