import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import ParentChooser from '../../../components/ParentChooser';
import {
    CircularProgress, Box, Typography, Button,
    Grid, Paper, FormControlLabel, Switch,
    Card, CardContent, Avatar, Divider, Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LinkIcon from '@mui/icons-material/Link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOffIcon from '@mui/icons-material/PersonOff';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('')
    const [className, setClassName] = useState('')
    const [sclassName, setSclassName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)

    // Parent selection state
    const [linkToParent, setLinkToParent] = useState(false);
    const [selectedParent, setSelectedParent] = useState(null);
    const [parentChooserOpen, setParentChooserOpen] = useState(false);

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

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

    const handleParentSelect = (parent) => {
        setSelectedParent(parent);
    };

    const handleRemoveParent = () => {
        setSelectedParent(null);
    };

    const fields = photo 
        ? { 
            name, rollNum, password, sclassName, adminID, role, attendance, 
            photo, email, phone, address,
            ...(linkToParent && selectedParent ? { parent: selectedParent._id } : {})
          }
        : { 
            name, rollNum, password, sclassName, adminID, role, attendance, 
            email, phone, address,
            ...(linkToParent && selectedParent ? { parent: selectedParent._id } : {})
          };

    const submitHandler = (event) => {
        event.preventDefault()
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
        }
        else {
            setLoader(true)
            dispatch(registerUser(fields, role))
        }
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            setMessage("Student added successfully!")
            setShowPopup(true)
            setLoader(false)
            setTimeout(() => {
                navigate(-1)
            }, 1500)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <>
            <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                        Add New Student
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                        Fill in the student information below
                    </Typography>

                    <form onSubmit={submitHandler}>
                        <Grid container spacing={3}>
                            {/* Student Basic Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ borderBottom: '2px solid #7f56da', pb: 1, mb: 2 }}>
                                    Basic Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Name *</label>
                                <input 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14
                                    }}
                                    type="text" 
                                    placeholder="Enter student's name..."
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    autoComplete="name" 
                                    required 
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Roll Number *</label>
                                <input 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14
                                    }}
                                    type="number" 
                                    placeholder="Enter student's Roll Number..."
                                    value={rollNum}
                                    onChange={(event) => setRollNum(event.target.value)}
                                    required 
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Password *</label>
                                <input 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14
                                    }}
                                    type="password" 
                                    placeholder="Enter student's password..."
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="new-password" 
                                    required 
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Class *</label>
                                {situation === "Student" ? (
                                    <select
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: 8,
                                            border: '1px solid #ccc',
                                            fontSize: 14,
                                            backgroundColor: 'white'
                                        }}
                                        value={className}
                                        onChange={changeHandler}
                                        required
                                    >
                                        <option value='Select Class'>Select Class</option>
                                        {sclassesList.map((classItem, index) => (
                                            <option key={index} value={classItem.sclassName}>
                                                {classItem.sclassName}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: 8,
                                            border: '1px solid #ccc',
                                            fontSize: 14,
                                            backgroundColor: '#f5f5f5'
                                        }}
                                        type="text"
                                        value={`Class ${className || params.id}`}
                                        disabled
                                    />
                                )}
                            </Grid>

                            {/* Contact Information */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ borderBottom: '2px solid #7f56da', pb: 1, mb: 2, mt: 1 }}>
                                    Contact Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email Address (Optional)</label>
                                <input 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14
                                    }}
                                    type="email" 
                                    placeholder="Enter student's email..."
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email" 
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Phone Number (Optional)</label>
                                <input 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14
                                    }}
                                    type="tel" 
                                    placeholder="Enter student's phone number..."
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    autoComplete="tel" 
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Address (Optional)</label>
                                <textarea 
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        fontSize: 14,
                                        minHeight: 80,
                                        resize: 'vertical'
                                    }}
                                    placeholder="Enter student's address..."
                                    value={address}
                                    onChange={(event) => setAddress(event.target.value)}
                                    autoComplete="street-address" 
                                />
                            </Grid>

                            {/* Parent Linking Section */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" sx={{ borderBottom: 'none', pb: 0 }}>
                                        Parent / Guardian
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={linkToParent}
                                                onChange={(e) => setLinkToParent(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Link to Parent"
                                    />
                                </Box>

                                {linkToParent ? (
                                    <Card variant="outlined" sx={{ bgcolor: '#f9f9ff' }}>
                                        <CardContent>
                                            {selectedParent ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                                                            <PersonIcon />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {selectedParent.fatherName || 'Parent'}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {selectedParent.phone || selectedParent.fatherPhone || 'No phone'}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {selectedParent.students?.length || 0} student(s) linked
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<PersonOffIcon />}
                                                        onClick={handleRemoveParent}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                                        Select a parent/guardian to link with this student
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<LinkIcon />}
                                                        onClick={() => setParentChooserOpen(true)}
                                                    >
                                                        Select Parent
                                                    </Button>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Alert severity="info" icon={<PersonAddIcon />}>
                                        You can link this student to an existing parent later, or skip for now.
                                    </Alert>
                                )}
                            </Grid>

                            {/* Photo Upload Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ borderBottom: '2px solid #7f56da', pb: 1, mb: 2, mt: 1 }}>
                                    Photo (Optional)
                                </Typography>
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
                                            onClick={() => document.getElementById('photo-upload').click()}
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
                                                    alt="Student preview" 
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
                                                    ×
                                                </Button>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary">
                                                Photo Preview
                                            </Typography>
                                        </Box>
                                    )}
                                    <input
                                        id="photo-upload"
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
                                    startIcon={loader ? null : <PersonAddIcon />}
                                    sx={{ py: 1.5, px: 4, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
                                >
                                    {loader ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Add Student'
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>

            {/* Parent Chooser Dialog */}
            <ParentChooser
                open={parentChooserOpen}
                onClose={() => setParentChooserOpen(false)}
                onSelect={handleParentSelect}
                onCreateNew={() => navigate("/Admin/addparent")}
                schoolId={adminID}
                title="Select Parent / Guardian"
                buttonText="Select Parent"
                selectedParent={selectedParent}
                showCreateNew={true}
            />

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudent;

