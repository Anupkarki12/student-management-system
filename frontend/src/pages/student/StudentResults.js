import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getStudentMarks } from '../../redux/marksRelated/marksHandle';
import { 
    Container, Typography, Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Chip, Avatar, Grid, LinearProgress, Divider, FormControl, 
    InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
    Assessment as AssessmentIcon, 
    TrendingUp as TrendingUpIcon,
    School as SchoolIcon,
    EmojiEvents as EmojiEventsIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

const StudentResults = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser } = useSelector((state) => state.user);
    const { marksList, loading, error } = useSelector((state) => state.marks);
    
    const [examType, setExamType] = useState('all');
    const [selectedExam, setSelectedExam] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getStudentMarks(currentUser._id, examType));
        }
    }, [dispatch, currentUser._id, examType]);

    // Get unique exam types
    const examTypes = marksList && marksList.length > 0 
        ? [...new Set(marksList.map(m => m.examType))]
        : [];

    // Calculate statistics
    const calculateStats = () => {
        if (!marksList || marksList.length === 0) return null;
        
        const totalMarks = marksList.reduce((acc, curr) => acc + curr.marksObtained, 0);
        const totalMaxMarks = marksList.reduce((acc, curr) => acc + curr.maxMarks, 0);
        const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;
        const passedCount = marksList.filter(m => (m.marksObtained / m.maxMarks) * 100 >= 40).length;
        
        return {
            totalMarks,
            totalMaxMarks,
            percentage,
            passedCount,
            totalExams: marksList.length,
            failedCount: marksList.length - passedCount
        };
    };

    const stats = calculateStats();

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A+', color: '#2e7d32', bg: '#e8f5e9' };
        if (percentage >= 80) return { grade: 'A', color: '#1976d2', bg: '#e3f2fd' };
        if (percentage >= 70) return { grade: 'B+', color: '#7b1fa2', bg: '#f3e5f5' };
        if (percentage >= 60) return { grade: 'B', color: '#f57c00', bg: '#fff3e0' };
        if (percentage >= 50) return { grade: 'C+', color: '#00838f', bg: '#e0f7fa' };
        if (percentage >= 40) return { grade: 'C', color: '#c2185b', bg: '#fce4ec' };
        return { grade: 'F', color: '#d32f2f', bg: '#ffebee' };
    };

    const getGradeIcon = (percentage) => {
        if (percentage >= 90) return <EmojiEventsIcon sx={{ color: '#2e7d32' }} />;
        if (percentage >= 70) return <TrendingUpIcon sx={{ color: '#1976d2' }} />;
        if (percentage >= 40) return <CheckCircleIcon sx={{ color: '#f57c00' }} />;
        return <WarningIcon sx={{ color: '#d32f2f' }} />;
    };

    const handleViewDetails = (mark) => {
        setSelectedExam(mark);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedExam(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Loading Results...</Typography>
                    <LinearProgress sx={{ width: 200 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <AssessmentIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            My Results
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Academic Performance & Examination Results
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Filter */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Filter by Exam Type:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="all">All Exams</MenuItem>
                            {examTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: '#e3f2fd', mx: 'auto', mb: 2 }}>
                                    <AssessmentIcon sx={{ color: '#1976d2', fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {stats.totalExams}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total Exams
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', mx: 'auto', mb: 2 }}>
                                    <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                    {stats.percentage}%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Overall Percentage
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: '#fff3e0', mx: 'auto', mb: 2 }}>
                                    <CheckCircleIcon sx={{ color: '#f57c00', fontSize: 30 }} />
                                </Avatar>
                                <Typography variant="h3" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                                    {stats.passedCount}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Passed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: stats.failedCount > 0 ? '#ffebee' : '#e8f5e9', mx: 'auto', mb: 2 }}>
                                    {getGradeIcon(parseFloat(stats.percentage))}
                                </Avatar>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: getGrade(parseFloat(stats.percentage)).color }}>
                                    {getGrade(parseFloat(stats.percentage)).grade}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Grade
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Results Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <Box sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <AssessmentIcon sx={{ fontSize: 32, color: 'white' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Examination Results
                    </Typography>
                </Box>
                
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Exam Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Marks</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, borderBottom: '2px solid #667eea' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {marksList && marksList.length > 0 ? (
                                marksList.map((mark, index) => {
                                    const percentage = ((mark.marksObtained / mark.maxMarks) * 100).toFixed(2);
                                    const gradeInfo = getGrade(percentage);
                                    const isPassed = percentage >= 40;
                                    
                                    return (
                                        <TableRow 
                                            key={index}
                                            sx={{ 
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    backgroundColor: '#f5f5f5',
                                                    transform: 'scale(1.01)'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: gradeInfo.bg }}>
                                                        <SchoolIcon sx={{ color: gradeInfo.color, fontSize: 20 }} />
                                                    </Avatar>
                                                    <Typography variant="body1" sx={{ fontWeight: '600' }}>
                                                        {mark.subject?.subName || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={mark.examType} 
                                                    size="medium"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: '600' }}>
                                                        {mark.marksObtained} / {mark.maxMarks}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({percentage}%)
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={gradeInfo.grade}
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        bgcolor: gradeInfo.bg,
                                                        color: gradeInfo.color
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={isPassed ? 'Passed' : 'Failed'}
                                                    color={isPassed ? 'success' : 'error'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(mark.examDate).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => handleViewDetails(mark)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Avatar sx={{ width: 80, height: 80, bgcolor: '#f5f5f5', mx: 'auto', mb: 2 }}>
                                                <AssessmentIcon sx={{ fontSize: 40, color: '#ccc' }} />
                                            </Avatar>
                                            <Typography variant="h6" color="text.secondary">
                                                No results found.
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Your exam results will appear here once published.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Overall Progress */}
            {stats && (
                <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <TrendingUpIcon color="primary" />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Overall Performance
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(parseFloat(stats.percentage), 100)}
                                    sx={{ 
                                        height: 16, 
                                        borderRadius: 8,
                                        backgroundColor: '#e0e0e0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 8,
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                        }
                                    }}
                                />
                            </Box>
                            <Chip 
                                label={`${stats.percentage}%`}
                                color="primary"
                                sx={{ fontWeight: 'bold', fontSize: '1.1rem', px: 2, py: 2.5 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Marks: {stats.totalMarks} / {stats.totalMaxMarks}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Grade: <strong style={{ color: getGrade(parseFloat(stats.percentage)).color }}>
                                    {getGrade(parseFloat(stats.percentage)).grade}
                                </strong>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    py: 2
                }}>
                    Exam Details
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedExam && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                                    <Typography variant="h6">{selectedExam.subject?.subName || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Exam Type</Typography>
                                    <Typography variant="body1">{selectedExam.examType}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Exam Date</Typography>
                                    <Typography variant="body1">{new Date(selectedExam.examDate).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Marks Obtained</Typography>
                                    <Typography variant="h5" color="primary">{selectedExam.marksObtained}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Max Marks</Typography>
                                    <Typography variant="h5">{selectedExam.maxMarks}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Percentage</Typography>
                                    <Chip 
                                        label={`${((selectedExam.marksObtained / selectedExam.maxMarks) * 100).toFixed(2)}%`}
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    />
                                </Grid>
                                {selectedExam.comments && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                                        <Typography variant="body1">{selectedExam.comments}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentResults;

