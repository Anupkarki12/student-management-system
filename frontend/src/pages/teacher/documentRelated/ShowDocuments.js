import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDocuments, deleteDocument } from '../../../redux/documentRelated/documentHandle';
import { Paper, Typography, Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Link } from 'react-router-dom';

const ShowDocuments = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { documentsList, loading, error, response } = useSelector((state) => state.document);

    useEffect(() => {
        if (currentUser?._id && currentRole === "Teacher") {
            dispatch(getAllDocuments(currentUser._id, "Teacher"));
        }
    }, [dispatch, currentUser?._id, currentRole]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            dispatch(deleteDocument(id, "Documents"));
            // Refresh the list
            setTimeout(() => {
                dispatch(getAllDocuments(currentUser._id, "Teacher"));
            }, 500);
        }
    };

    const handleDownload = (document) => {
        // Create a link to download the file
        const link = document.filePath;
        if (link) {
            // For local development, construct the full URL
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    My Documents
                </Typography>
                <Button
                    component={Link}
                    to="/Teacher/adddocument"
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                >
                    Upload New
                </Button>
            </Box>

            {loading ? (
                <Typography>Loading...</Typography>
            ) : response ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No Documents Uploaded Yet
                    </Typography>
                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                        Upload your first document by clicking the button above
                    </Typography>
                    <Button
                        component={Link}
                        to="/Teacher/adddocument"
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Document
                    </Button>
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
                                            {doc.sclass ? (
                                                <Typography variant="body2">
                                                    Class {doc.sclass.sclassName}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    All Classes
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
                                                    -
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
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleDownload(doc)}
                                                title="Download"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(doc._id)}
                                                title="Delete"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
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

export default ShowDocuments;

