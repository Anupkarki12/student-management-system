import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDocuments } from '../../../redux/documentRelated/documentHandle';
import { Paper, Typography, Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const StudentDocuments = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { documentsList, loading, error, response } = useSelector((state) => state.document);

    useEffect(() => {
        console.log('StudentDocuments - Current user:', currentUser);
        console.log('StudentDocuments - Current role:', currentRole);
        console.log('StudentDocuments - School ID:', currentUser?.school?._id);
        console.log('StudentDocuments - Class ID (sclassName):', currentUser?.sclassName?._id);
        console.log('StudentDocuments - Full school object:', currentUser?.school);
        console.log('StudentDocuments - Full sclassName object:', currentUser?.sclassName);
        
        if (currentUser?._id && currentRole === "Student" && currentUser.school?._id && currentUser.sclassName?._id) {
            console.log('Fetching documents for student...');
            const schoolId = currentUser.school._id;
            const classId = currentUser.sclassName._id;
            console.log('Calling API with schoolId:', schoolId, 'classId:', classId);
            const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/StudentDocuments/${schoolId}/${classId}`;
            console.log('API URL:', apiUrl);
            dispatch(getAllDocuments(currentUser._id, "Student", schoolId, classId));
        } else {
            console.log('Missing required data for document fetch');
            console.log('currentUser?._id:', currentUser?._id);
            console.log('currentRole === "Student":', currentRole === "Student");
            console.log('currentUser.school?._id:', currentUser?.school?._id);
            console.log('currentUser.sclassName?._id:', currentUser?.sclassName?._id);
        }
    }, [dispatch, currentUser, currentRole]);

    const handleDownload = (document) => {
        const link = document.filePath;
        if (link) {
            const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const fullUrl = `${baseUrl}/${link}`;
            window.open(fullUrl, '_blank');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
        return '📎';
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Documents from Teachers
            </Typography>

            {loading ? (
                <Typography>Loading...</Typography>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No Documents Available
                    </Typography>
                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                        Your teachers haven't uploaded any documents yet
                    </Typography>
                </Paper>
            ) : error ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee' }}>
                    <Typography color="error">
                        Error loading documents: {error}
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>File</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(documentsList) && documentsList.length > 0 ? (
                                documentsList.map((doc) => (
                                    <TableRow key={doc._id} hover>
                                        <TableCell>
                                            <Typography variant="h5">
                                                {getFileIcon(doc.fileType)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {doc.title}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {doc.fileName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {doc.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {doc.teacher ? (
                                                <Typography variant="body2">
                                                    {doc.teacher.name}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {doc.subject ? (
                                                <Typography variant="body2">
                                                    {doc.subject.subName}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    General
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatFileSize(doc.fileSize)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(doc.uploadDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleDownload(doc)}
                                            >
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body1" color="textSecondary">
                                            No documents found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default StudentDocuments;

