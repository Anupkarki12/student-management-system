import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addDocument } from '../../../redux/documentRelated/documentHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Button, TextField, MenuItem, Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Popup from '../../../components/Popup';
import NepaliDatePicker from '../../../components/NepaliDatePicker';

const AddDocument = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { loading, response, error } = useSelector(state => state.document);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [sclassID, setSclassID] = useState('');
    const [subjectID, setSubjectID] = useState('');
    const [expirationDate, setExpirationDate] = useState('');

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Get teacher's class and subjects
    const teacherSclass = currentUser?.teachSclass;
    const teacherSubjects = currentUser?.teachSubject || [];

    useEffect(() => {
        if (currentUser?.teachSclass) {
            setSclassID(currentUser.teachSclass._id);
        }
    }, [currentUser]);

    useEffect(() => {
        if (teacherSubjects.length > 0 && !subjectID) {
            setSubjectID(teacherSubjects[0]._id);
        }
    }, [teacherSubjects, subjectID]);

    useEffect(() => {
        if (response === 'success' || response === 'added') {
            navigate('/Teacher/documents');
            dispatch(underControl());
        } else if (error) {
            setMessage("Error: " + (error.response?.data?.message || error.message || "Unknown error"))
            setShowPopup(true)
            setLoader(false)
        }
    }, [response, error, navigate, dispatch]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if (!file) {
            setMessage("Please select a file")
            setShowPopup(true)
            return;
        }

        if (!currentUser || !currentUser._id) {
            setMessage("Error: User not authenticated")
            setShowPopup(true)
            return;
        }

        if (!currentUser.school || !currentUser.school._id) {
            setMessage("Error: School information not found. Please contact administrator.")
            setShowPopup(true)
            return;
        }

        setLoader(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', file);
        formData.append('teacherID', currentUser._id);
        formData.append('schoolID', currentUser.school._id);
        if (sclassID) {
            formData.append('sclassID', sclassID);
        }
        if (subjectID) {
            formData.append('subjectID', subjectID);
        }
        if (expirationDate) {
            formData.append('expirationDate', expirationDate);
        }

        console.log('Submitting document with data:', {
            title,
            description,
            teacherID: currentUser._id,
            schoolID: currentUser.school._id,
            sclassID: sclassID || 'All Classes',
            subjectID: subjectID || 'Not specified',
            fileName: file.name,
            fileSize: file.size
        });

        dispatch(addDocument(formData, 'DocumentCreate'));
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    Upload Document
                </Typography>
                
                <form onSubmit={submitHandler}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        margin="normal"
                        variant="outlined"
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        margin="normal"
                        variant="outlined"
                        multiline
                        rows={3}
                    />

                    <Button
                        component="label"
                        fullWidth
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2, mb: 1, py: 1.5 }}
                        color={file ? "success" : "primary"}
                    >
                        {file ? "Change File" : "Choose File (PDF, DOC, PPT)"}
                        <input
                            type="file"
                            name="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    
                    {file && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </Typography>
                    )}

                    <TextField
                        fullWidth
                        select
                        label="Class"
                        value={sclassID}
                        onChange={(event) => setSclassID(event.target.value)}
                        margin="normal"
                        variant="outlined"
                    >
                        {teacherSclass && (
                            <MenuItem key={teacherSclass._id} value={teacherSclass._id}>
                                Class {teacherSclass.sclassName}
                            </MenuItem>
                        )}
                        <MenuItem value="">
                            All Classes
                        </MenuItem>
                    </TextField>

                    {teacherSubjects.length > 0 && (
                    <TextField
                        fullWidth
                        select
                        label="Subject"
                        value={subjectID}
                        onChange={(event) => setSubjectID(event.target.value)}
                        margin="normal"
                        variant="outlined"
                    >
                        {teacherSubjects.map((subject) => (
                            <MenuItem key={subject._id} value={subject._id}>
                                {subject.subName}
                            </MenuItem>
                        ))}
                    </TextField>
                    )}

                    <NepaliDatePicker
                        label="Expiration Date (Optional)"
                        value={expirationDate}
                        onChange={(date) => setExpirationDate(date)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loader}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Upload Document'
                        )}
                    </Button>
                </form>

                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Paper>
        </Box>
    );
};

export default AddDocument;
