import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addSimpleStaff } from '../../../redux/staffRelated/staffHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/staffRelated/staffSlice';
import { CircularProgress, Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Button, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddStaff = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, error } = useSelector(state => state.staff);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [position, setPosition] = useState('');
    const [phone, setPhone] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const { currentUser } = useSelector(state => state.user);
    const school = currentUser._id;

    const positions = [
        'Administration',
        'Accountant',
        'Librarian',
        'Lab Assistant',
        'Clerk',
        'Peon',
        'Security',
        'Driver',
        'Canteen Staff',
        'Other'
    ];

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

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    const fields = photo 
        ? { name, address, position, phone, photo }
        : { name, address, position, phone };

    const submitHandler = (event) => {
        event.preventDefault();
        
        // Force close any open MUI Select dropdowns and remove focus
        // This prevents the aria-hidden accessibility issue
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
            activeElement.blur();
        }
        
        // Close any open MUI Select menus
        document.body.click();
        
        // Use setTimeout to ensure the DOM has updated and MUI Select is closed
        setTimeout(() => {
            setLoader(true);
            dispatch(addSimpleStaff(fields, school));
        }, 100);
    };

    useEffect(() => {
        if (status === 'added') {
            // Reset form fields before navigating
            setName('');
            setAddress('');
            setPosition('');
            setPhone('');
            setPhoto(null);
            setPhotoPreview(null);
            setLoader(false);
            
            dispatch(underControl());
            navigate("/Admin/staff");
        }
        else if (status === 'failed') {
            setMessage(response || "Failed to add staff");
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Box sx={{ p: 3 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate("/Admin/staff")}
                sx={{ mb: 2 }}
            >
                Back to Staff List
            </Button>

            <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                    Add New Staff
                </Typography>

                <form onSubmit={submitHandler}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        sx={{ mb: 2 }}
                        placeholder="Enter staff name"
                    />

                    <TextField
                        fullWidth
                        label="Address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        multiline
                        rows={2}
                        sx={{ mb: 2 }}
                        placeholder="Enter address"
                    />

                    <FormControl fullWidth sx={{ mb: 2 }} required>
                        <InputLabel>Position</InputLabel>
                        <Select
                            value={position}
                            label="Position"
                            onChange={(event) => setPosition(event.target.value)}
                        >
                            {positions.map((pos) => (
                                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="Enter phone number"
                    />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Staff Photo (Optional)
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                        {!photoPreview ? (
                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: '#f5f5f5'
                                    }
                                }}
                                onClick={() => document.getElementById('staff-photo-upload').click()}
                            >
                                <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                <Typography variant="body2" color="textSecondary">
                                    Click to upload photo
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    (JPG, PNG, GIF - Max 5MB)
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                    <img 
                                        src={photoPreview} 
                                        alt="Staff preview" 
                                        style={{ 
                                            width: 150, 
                                            height: 150, 
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: '2px solid #ddd'
                                        }} 
                                    />
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={removePhoto}
                                        sx={{ 
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            minWidth: 'auto',
                                            p: 0.5,
                                            borderRadius: '50%'
                                        }}
                                    >
                                        X
                                    </Button>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={() => document.getElementById('staff-photo-upload').click()}
                                    sx={{ mt: 1 }}
                                >
                                    Change Photo
                                </Button>
                            </Box>
                        )}
                        <input
                            id="staff-photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loader}
                        sx={{ 
                            py: 1.5,
                            backgroundColor: '#7f56da',
                            '&:hover': {
                                backgroundColor: '#6b45c8'
                            }
                        }}
                    >
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Add Staff'
                        )}
                    </Button>
                </form>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AddStaff;

