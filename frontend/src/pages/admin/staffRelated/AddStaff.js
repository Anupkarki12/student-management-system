import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerStaff } from '../../../redux/staffRelated/staffHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/staffRelated/staffSlice';
import { CircularProgress, Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AddStaff = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, error } = useSelector(state => state.staff);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const { currentUser } = useSelector(state => state.user);
    const school = currentUser._id;
    const role = "Staff";

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
        ? { name, email, password, role, school, position, department, phone, address, photo }
        : { name, email, password, role, school, position, department, phone, address };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(registerStaff(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
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
        <div>
            <div className="register">
                <form className="registerForm" onSubmit={submitHandler}>
                    <span className="registerTitle">Add Staff</span>

                    <label>Name</label>
                    <input className="registerInput" type="text" placeholder="Enter staff name..."
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name" required />

                    <label>Email</label>
                    <input className="registerInput" type="email" placeholder="Enter staff email..."
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email" required />

                    <label>Password</label>
                    <input className="registerInput" type="password" placeholder="Enter staff password..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password" required />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Position</InputLabel>
                        <Select
                            value={position}
                            label="Position"
                            onChange={(event) => setPosition(event.target.value)}
                            required
                        >
                            {positions.map((pos) => (
                                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Department (Optional)"
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {/* Photo Upload Section */}
                    <label>Staff Photo (Optional)</label>
                    <Box sx={{ mb: 2 }}>
                        {!photoPreview ? (
                            <Box
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 1,
                                    p: 3,
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
                                        p: 0.5
                                    }}
                                >
                                    ×
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

                    <button className="registerButton" type="submit" disabled={loader}>
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </div>
    );
};

export default AddStaff;

