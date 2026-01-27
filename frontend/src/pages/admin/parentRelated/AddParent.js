import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerParent } from '../../../redux/parentRelated/parentHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/parentRelated/parentSlice';
import { 
    CircularProgress, Box, Typography, Button, TextField, 
    Grid, Paper, Autocomplete, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const AddParent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, response, error } = useSelector(state => state.parent);
    const { currentUser } = useSelector(state => state.user);

    // Father information
    const [fatherName, setFatherName] = useState('');
    const [fatherOccupation, setFatherOccupation] = useState('');
    const [fatherPhone, setFatherPhone] = useState('');
    const [fatherEmail, setFatherEmail] = useState('');

    // Mother information
    const [motherName, setMotherName] = useState('');
    const [motherOccupation, setMotherOccupation] = useState('');
    const [motherPhone, setMotherPhone] = useState('');
    const [motherEmail, setMotherEmail] = useState('');

    // Guardian information
    const [guardianName, setGuardianName] = useState('');
    const [guardianRelation, setGuardianRelation] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');
    const [guardianAddress, setGuardianAddress] = useState('');

    // General information
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');

    // Students linked to parent
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const school = currentUser._id;
    const role = "Parent";

    // Fetch all students for the school
    useEffect(() => {
        const fetchStudents = async () => {
            setStudentsLoading(true);
            try {
                const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Students/${school}`);
                if (result.data && Array.isArray(result.data)) {
                    const studentsWithoutParents = result.data.filter(student => !student.parent);
                    setAvailableStudents(studentsWithoutParents);
                }
            } catch (err) {
                console.error("Error fetching students:", err);
            }
            setStudentsLoading(false);
        };
        fetchStudents();
    }, [school]);

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
        ? { 
            fatherName, fatherOccupation, fatherPhone, fatherEmail,
            motherName, motherOccupation, motherPhone, motherEmail,
            guardianName, guardianRelation, guardianPhone, guardianEmail, guardianAddress,
            school, address, phone, email, password, role, photo,
            students: selectedStudents.map(s => s._id)
        }
        : { 
            fatherName, fatherOccupation, fatherPhone, fatherEmail,
            motherName, motherOccupation, motherPhone, motherEmail,
            guardianName, guardianRelation, guardianPhone, guardianEmail, guardianAddress,
            school, address, phone, email, password, role,
            students: selectedStudents.map(s => s._id)
        };

    const submitHandler = (event) => {
        event.preventDefault();
        
        if (!fatherName || !password) {
            setMessage("Father's name and password are required");
            setShowPopup(true);
            return;
        }
        
        if (selectedStudents.length === 0) {
            setMessage("Please select at least one student");
            setShowPopup(true);
            return;
        }
        
        setLoader(true);
        dispatch(registerParent(fields, role));
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/parents");
        }
        else if (status === 'failed') {
            setMessage(response || "Failed to add parent");
            setShowPopup(true);
            setLoader(false);
        }
        else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    // Section Title Component
    const SectionTitle = ({ title }) => (
        <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
                borderBottom: '2px solid #7f56da', 
                pb: 1,
                mb: 2,
                fontWeight: 600
            }}
        >
            {title}
        </Typography>
    );

    // Info Row Component
    const InfoRow = ({ icon: Icon, label, value }) => (
        <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="action" />
                <Typography>
                    <strong>{label}:</strong> {value || 'N/A'}
                </Typography>
            </Box>
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 4 }}>
                {/* Header */}
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                    Add Parent / Guardian
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Register parent or guardian information for a student
                </Typography>

                <Box component="form" onSubmit={submitHandler}>
                    <Grid container spacing={3}>
                        {/* Student Selection */}
                        <Grid item xs={12}>
                            <SectionTitle title="Student Information" />
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Select the student(s) whose parent/guardian this is
                            </Typography>
                            <Autocomplete
                                multiple
                                options={availableStudents}
                                getOptionLabel={(option) => `${option.name} (Roll: ${option.rollNum})`}
                                value={selectedStudents}
                                onChange={(event, newValue) => {
                                    setSelectedStudents(newValue);
                                }}
                                isOptionEqualToValue={(option, value) => option._id === value._id}
                                loading={studentsLoading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Student(s)"
                                        placeholder="Search student..."
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip
                                                key={key}
                                                label={option.name}
                                                size="small"
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                noOptionsText={
                                    studentsLoading 
                                        ? "Loading..." 
                                        : availableStudents.length === 0 
                                            ? "All students have parents assigned"
                                            : "No students found"
                                }
                            />
                            {selectedStudents.length > 0 && (
                                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                    {selectedStudents.length} student(s) selected
                                </Typography>
                            )}
                        </Grid>

                        {/* Father's Information */}
                        <Grid item xs={12}>
                            <SectionTitle title="Father's Information" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Father's Name *"
                                        value={fatherName}
                                        onChange={(e) => setFatherName(e.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Occupation"
                                        value={fatherOccupation}
                                        onChange={(e) => setFatherOccupation(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={fatherPhone}
                                        onChange={(e) => setFatherPhone(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={fatherEmail}
                                        onChange={(e) => setFatherEmail(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Mother's Information */}
                        <Grid item xs={12}>
                            <SectionTitle title="Mother's Information" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Mother's Name"
                                        value={motherName}
                                        onChange={(e) => setMotherName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Occupation"
                                        value={motherOccupation}
                                        onChange={(e) => setMotherOccupation(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={motherPhone}
                                        onChange={(e) => setMotherPhone(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={motherEmail}
                                        onChange={(e) => setMotherEmail(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Guardian Information */}
                        <Grid item xs={12}>
                            <SectionTitle title="Guardian Information (Optional)" />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Guardian's Name"
                                        value={guardianName}
                                        onChange={(e) => setGuardianName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Relationship"
                                        value={guardianRelation}
                                        onChange={(e) => setGuardianRelation(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={guardianPhone}
                                        onChange={(e) => setGuardianPhone(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={guardianEmail}
                                        onChange={(e) => setGuardianEmail(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        value={guardianAddress}
                                        onChange={(e) => setGuardianAddress(e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                            <SectionTitle title="Contact Information" />
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Password *"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        helperText="Required for parent login"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Photo Upload */}
                        <Grid item xs={12}>
                            <SectionTitle title="Photo (Optional)" />
                            <Box>
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
                                        onClick={() => document.getElementById('parent-photo-upload').click()}
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <img 
                                                src={photoPreview} 
                                                alt="Parent preview" 
                                                style={{ 
                                                    width: 120, 
                                                    height: 120, 
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
                                                X
                                            </Button>
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">
                                            Photo Preview
                                        </Typography>
                                    </Box>
                                )}
                                <input
                                    id="parent-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                            </Box>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loader}
                                startIcon={loader ? null : <AddIcon />}
                                sx={{ py: 1.5, px: 4, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
                            >
                                {loader ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Register Parent'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default AddParent;

