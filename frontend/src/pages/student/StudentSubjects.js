import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { BottomNavigation, BottomNavigationAction, Container, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Chip, Avatar, Card, CardContent, Grid, Divider, LinearProgress } from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart'
import PersonIcon from '@mui/icons-material/Person';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const StudentSubjects = () => {

    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails])

    useEffect(() => {
        if (subjectMarks.length === 0) {
            dispatch(getSubjectList(currentUser?.sclassName?._id, "ClassSubjects"));
        }
    }, [subjectMarks, dispatch, currentUser?.sclassName?._id]);

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => {
        return (
            <>
                <Typography variant="h4" align="center" gutterBottom>
                    Subject Marks
                </Typography>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject</StyledTableCell>
                            <StyledTableCell>Marks</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {subjectMarks.map((result, index) => {
                            if (!result.subName || !result.marksObtained) {
                                return null;
                            }
                            return (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </>
        );
    };

    const renderChartSection = () => {
        return <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />;
    };

    const renderClassDetailsSection = () => {
        const className = sclassDetails?.sclassName || currentUser?.sclassName?.sclassName || 'N/A';
        const totalSubjects = subjectsList?.length || 0;
        const assignedTeachers = subjectsList?.filter(s => s.teacher && s.teacher.name).length || 0;
        const unassignedSubjects = totalSubjects - assignedTeachers;
        const assignmentPercentage = totalSubjects > 0 ? Math.round((assignedTeachers / totalSubjects) * 100) : 0;

        // Color themes for different rows
        const rowColors = [
            { bg: '#e3f2fd', icon: '#1976d2' },
            { bg: '#f3e5f5', icon: '#7b1fa2' },
            { bg: '#e8f5e9', icon: '#2e7d32' },
            { bg: '#fff3e0', icon: '#f57c00' },
            { bg: '#e0f7fa', icon: '#00838f' },
            { bg: '#fce4ec', icon: '#c2185b' },
        ];

        return (
            <Container maxWidth="lg">
                {/* Class Header with Gradient */}
                <Box sx={{ 
                    mb: 4, 
                    p: 2.5, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%)',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative circles */}
                    <Box sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)'
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)'
                    }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1.5, position: 'relative' }}>
                        <SchoolIcon sx={{ fontSize: 32 }} />
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                            Class Details
                        </Typography>
                    </Box>
                    <Chip 
                        icon={<SchoolIcon sx={{ color: 'white !important' }} />}
                        label={`Class ${className}`} 
                        sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            color: 'white',
                            fontSize: '1.1rem',
                            py: 1.8,
                            px: 2,
                            fontWeight: 'bold',
                            backdropFilter: 'blur(10px)',
                            '& .MuiChip-icon': { color: 'white' },
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                        }}
                    />
                </Box>

                {/* Stats Cards with enhanced styling */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ 
                            height: '100%',
                            borderRadius: 4,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': { 
                                transform: 'translateY(-8px)', 
                                boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                                borderColor: '#1976d2'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    <Avatar sx={{ 
                                        width: 75, 
                                        height: 75, 
                                        bgcolor: '#e3f2fd',
                                        mx: 'auto',
                                    }}>
                                        <MenuBookIcon sx={{ fontSize: 38, color: '#1976d2' }} />
                                    </Avatar>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: '#1976d2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <AssignmentIcon sx={{ fontSize: 16, color: 'white' }} />
                                    </Box>
                                </Box>
                                <Typography variant="h2" color="primary" sx={{ fontWeight: '800', mb: 1 }}>
                                    {totalSubjects}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: '600', color: '#666' }}>
                                    Total Subjects
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ 
                            height: '100%',
                            borderRadius: 4,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': { 
                                transform: 'translateY(-8px)', 
                                boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                                borderColor: '#2e7d32'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    <Avatar sx={{ 
                                        width: 75, 
                                        height: 75, 
                                        bgcolor: '#e8f5e9',
                                        mx: 'auto',
                                    }}>
                                        <PersonIcon sx={{ fontSize: 38, color: '#2e7d32' }} />
                                    </Avatar>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: '#2e7d32',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                                    </Box>
                                </Box>
                                <Typography variant="h2" sx={{ color: '#2e7d32', fontWeight: '800', mb: 1 }}>
                                    {assignedTeachers}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: '600', color: '#666' }}>
                                    Teachers Assigned
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ 
                            height: '100%',
                            borderRadius: 4,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': { 
                                transform: 'translateY(-8px)', 
                                boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                                borderColor: unassignedSubjects > 0 ? '#f57c00' : '#2e7d32'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    <Avatar sx={{ 
                                        width: 75, 
                                        height: 75, 
                                        bgcolor: unassignedSubjects > 0 ? '#fff3e0' : '#e8f5e9',
                                        mx: 'auto',
                                    }}>
                                        <GroupIcon sx={{ fontSize: 38, color: unassignedSubjects > 0 ? '#f57c00' : '#2e7d32' }} />
                                    </Avatar>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: unassignedSubjects > 0 ? '#f57c00' : '#2e7d32',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {unassignedSubjects > 0 ? (
                                            <AssignmentIcon sx={{ fontSize: 16, color: 'white' }} />
                                        ) : (
                                            <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                                        )}
                                    </Box>
                                </Box>
                                <Typography variant="h2" sx={{ color: unassignedSubjects > 0 ? '#f57c00' : '#2e7d32', fontWeight: '800', mb: 1 }}>
                                    {unassignedSubjects}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: '600', color: '#666' }}>
                                    Pending Assignment
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Assignment Progress Bar */}
                {totalSubjects > 0 && (
                    <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Teacher Assignment Progress
                            </Typography>
                            <Chip 
                                label={`${assignmentPercentage}% Complete`}
                                color={assignmentPercentage === 100 ? 'success' : 'primary'}
                                size="medium"
                            />
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={assignmentPercentage}
                            sx={{ 
                                height: 12, 
                                borderRadius: 6,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 6,
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {assignedTeachers} of {totalSubjects} subjects have teachers
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {unassignedSubjects} pending
                            </Typography>
                        </Box>
                    </Card>
                )}

                {/* Subjects & Teachers Section */}
                <Card sx={{ 
                    borderRadius: 4,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ 
                        p: 3.5, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <MenuBookIcon sx={{ fontSize: 36, color: 'white' }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                            Subjects & Teachers
                        </Typography>
                    </Box>
                    
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, fontSize: '1rem', borderBottom: '2px solid #667eea' }}>Subject Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, fontSize: '1rem', borderBottom: '2px solid #667eea' }}>Subject Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 2.5, fontSize: '1rem', borderBottom: '2px solid #667eea' }}>Teacher</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {subjectsList && subjectsList.length > 0 ? (
                                subjectsList.map((subject, index) => {
                                    const colors = rowColors[index % rowColors.length];
                                    return (
                                        <TableRow 
                                            key={index}
                                            sx={{ 
                                                transition: 'all 0.3s ease',
                                                '&:hover': { 
                                                    backgroundColor: `${colors.bg}40`,
                                                    transform: 'scale(1.01)'
                                                }
                                            }}
                                        >
                                            <TableCell component="th" scope="row" sx={{ py: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ 
                                                        bgcolor: colors.bg,
                                                        width: 48,
                                                        height: 48,
                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <MenuBookIcon sx={{ color: colors.icon, fontSize: 24 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: '700', color: '#333' }}>
                                                            {subject.subName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Subject
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={subject.subCode} 
                                                    size="medium" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        borderRadius: 2,
                                                        bgcolor: colors.bg,
                                                        color: colors.icon,
                                                        border: `2px solid ${colors.icon}`,
                                                        '&:hover': {
                                                            bgcolor: colors.icon,
                                                            color: 'white'
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {subject.teacher && subject.teacher.name ? (
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 2,
                                                        p: 1.5,
                                                        borderRadius: 2.5,
                                                        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                                        width: 'fit-content',
                                                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
                                                    }}>
                                                        <Avatar sx={{ width: 44, height: 44, bgcolor: '#2e7d32', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                                            <PersonIcon fontSize="medium" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: '700', color: '#1b5e20' }}>
                                                                {subject.teacher.name}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                                                                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: '600' }}>
                                                                    Assigned
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 1.5,
                                                        p: 1.5,
                                                        borderRadius: 2.5,
                                                        background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                                                        width: 'fit-content'
                                                    }}>
                                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#f57c00' }}>
                                                            <PersonIcon fontSize="small" />
                                                        </Avatar>
                                                        <Chip 
                                                            label="Not Assigned" 
                                                            size="small" 
                                                            color="warning"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Avatar sx={{ width: 80, height: 80, bgcolor: '#f5f5f5', mx: 'auto', mb: 2 }}>
                                                <MenuBookIcon sx={{ fontSize: 40, color: '#ccc' }} />
                                            </Avatar>
                                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: '600' }}>
                                                No subjects found for this class.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Summary Card with enhanced styling */}
                {subjectsList && subjectsList.length > 0 && (
                    <Card sx={{ 
                        mt: 4, 
                        p: 3, 
                        borderRadius: 4,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        background: 'linear-gradient(135deg, #fffde7 0%, #fff9c4 50%, #fff59d 100%)',
                        border: '2px solid #ffd54f'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#ffd54f', width: 44, height: 44 }}>
                                <StarIcon sx={{ color: '#f57c00' }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                Summary
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2, borderColor: '#ffd54f' }} />
                        <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: 1.8 }}>
                            You are currently enrolled in <strong style={{ color: '#667eea', fontSize: '1.2rem' }}>Class {className}</strong> with{' '}
                            <strong style={{ color: '#1976d2', fontSize: '1.2rem' }}>{totalSubjects}</strong> subject{totalSubjects !== 1 ? 's' : ''}.{' '}
                            {assignedTeachers > 0 ? (
                                <>A total of <strong style={{ color: '#2e7d32', fontSize: '1.2rem' }}>{assignedTeachers}</strong> teacher{assignedTeachers !== 1 ? 's' : ''} {assignedTeachers !== 1 ? 'have' : 'has'} been assigned.</>
                            ) : (
                                <>No teachers have been assigned yet.</>
                            )}
                            {unassignedSubjects > 0 && (
                                <> <Chip label={`${unassignedSubjects} pending`} size="small" color="warning" sx={{ ml: 1 }} /></>
                            )}
                        </Typography>
                    </Card>
                )}
            </Container>
        );
    };

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Typography variant="h6">Loading...</Typography>
                </Box>
            ) : (
                <div>
                    {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0
                        ?
                        (<>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}

                            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                                <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                    <BottomNavigationAction
                                        label="Table"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <BottomNavigationAction
                                        label="Chart"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </BottomNavigation>
                            </Paper>
                        </>)
                        :
                        (<>
                            {renderClassDetailsSection()}
                        </>)
                    }
                </div>
            )}
        </>
    );
};

export default StudentSubjects;

