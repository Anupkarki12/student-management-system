import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import IDCardTemplate from '../../../components/IDCardTemplate';
import {
    Box, Button, Typography, Paper, Grid, Card, CardContent,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Chip, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GenerateIDCards = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList, sclassStudents, loading, error } = useSelector((state) => state.sclass);

    const [selectedClass, setSelectedClass] = useState(null);
    const [viewMode, setViewMode] = useState('select');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [previewStudent, setPreviewStudent] = useState(null);

    React.useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    const handleClassSelect = (classData) => {
        setSelectedClass(classData);
        dispatch(getClassStudents(classData._id));
        setViewMode('preview');
        setSelectedStudents([]);
        setSelectAll(false);
    };

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(sclassStudents.map(s => s._id));
        }
        setSelectAll(!selectAll);
    };

    const filteredStudents = sclassStudents?.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.rollNum)?.includes(searchTerm)
    ) || [];

    const getStudentsForCards = () => {
        if (selectedStudents.length > 0) {
            return sclassStudents.filter(s => selectedStudents.includes(s._id));
        }
        return sclassStudents || [];
    };

    const handlePrintSingle = (student) => {
        setPreviewStudent(student);
        setPrintDialogOpen(true);
    };

    const handleBulkPrint = () => {
        window.print();
    };

    const handleBack = () => {
        if (viewMode === 'preview') {
            setViewMode('select');
            setSelectedClass(null);
            setSelectedStudents([]);
        } else {
            navigate(-1);
        }
    };

    const renderClassSelection = () => (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Select a Class to Generate ID Cards
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error">Error loading classes</Typography>
                </Paper>
            ) : !sclassesList || sclassesList.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No classes found
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 2 }}>
                        Please add a class first to generate ID cards
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {Array.isArray(sclassesList) && sclassesList.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cls._id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6
                                    }
                                }}
                                onClick={() => handleClassSelect(cls)}
                            >
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        Class {cls.sclassName}
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                                        Generate ID Cards for all students
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    const renderPreview = () => {
        const studentsToShow = getStudentsForCards();

        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={handleBack}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h5">
                                Generate ID Cards - Class {selectedClass?.sclassName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {studentsToShow.length} students ready
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Search by name or roll..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handleBulkPrint}
                            disabled={studentsToShow.length === 0}
                        >
                            Print All ({selectedStudents.length || studentsToShow.length})
                        </Button>
                    </Box>
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant={selectAll ? "contained" : "outlined"}
                            onClick={handleSelectAll}
                            size="small"
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </Button>
                        <Chip
                            icon={<CheckCircleIcon />}
                            label={`${selectedStudents.length} selected`}
                            color={selectedStudents.length > 0 ? "primary" : "default"}
                        />
                        <Typography variant="body2" color="textSecondary">
                            Click on cards to select/deselect for printing
                        </Typography>
                    </Box>
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredStudents.map((student) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedStudents.includes(student._id) 
                                            ? '3px solid #1976d2' 
                                            : '1px solid #e0e0e0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: 4
                                        }
                                    }}
                                    onClick={() => handleStudentToggle(student._id)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: selectedStudents.includes(student._id)
                                                        ? 'linear-gradient(135deg, #1976d2, #42a5f5)'
                                                        : '#e0e0e0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {selectedStudents.includes(student._id) ? '✓' : student.rollNum}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {student.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Roll: {student.rollNum}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                            <div onClick={(e) => { e.stopPropagation(); }}>
                                                <IDCardTemplate
                                                    student={student}
                                                    school={currentUser}
                                                    cardSize="compact"
                                                />
                                            </div>
                                        </Box>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            startIcon={<PrintIcon />}
                                            sx={{ mt: 2 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrintSingle(student);
                                            }}
                                        >
                                            Print This Card
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Dialog
                    open={printDialogOpen}
                    onClose={() => setPrintDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Student ID Card
                        <IconButton onClick={() => setPrintDialogOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3, bgcolor: '#f5f5f5' }}>
                        {previewStudent && (
                            <IDCardTemplate
                                student={previewStudent}
                                school={currentUser}
                                cardSize="standard"
                            />
                        )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button onClick={() => setPrintDialogOpen(false)}>Close</Button>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={() => {
                                window.print();
                            }}
                        >
                            Print ID Card
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3 }} className="id-cards-page">
            {viewMode === 'select' && renderClassSelection()}
            {viewMode === 'preview' && renderPreview()}
        </Box>
    );
};

export default GenerateIDCards;
