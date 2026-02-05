
import { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Paper, Typography, Box, Card, CardContent, CircularProgress, Button } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import Lessons from "../../assets/subjects.svg";
import Tests from "../../assets/assignment.svg";
import Time from "../../assets/time.svg";
import axios from 'axios';
import ClassIcon from '@mui/icons-material/Class';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1.25rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

const ClassCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const TeacherHomePage = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const teacherId = currentUser?._id;

    const fetchTeacherClasses = useCallback(async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
            const result = await axios.get(`${apiUrl}/Teacher/Classes/${teacherId}`);
            if (Array.isArray(result.data)) {
                setTeacherClasses(result.data);
            } else {
                setTeacherClasses([]);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching teacher classes:', err);
            setError('Failed to load assigned classes: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
    }, [teacherId]);

    useEffect(() => {
        if (teacherId) {
            fetchTeacherClasses();
        }
    }, [teacherId, fetchTeacherClasses]);

    const handleRefresh = () => {
        fetchTeacherClasses();
    };

    const handleClassClick = (classId) => {
        navigate(`/Teacher/class/${classId}`);
    };

    // Calculate totals
    const totalClasses = teacherClasses.length;
    const totalSubjects = teacherClasses.reduce((sum, cls) => {
        return sum + (cls.subjects?.length || 0);
    }, 0);

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
                        <Typography color="error">{error}</Typography>
                        <Button onClick={handleRefresh} sx={{ mt: 2 }}>Retry</Button>
                    </Paper>
                ) : (
                    <>
                        {/* Assigned Classes Section */}
                        {teacherClasses.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        My Assigned Classes
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefresh}
                                        size="small"
                                    >
                                        Refresh
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {teacherClasses.map((cls) => (
                                        <Grid item xs={12} sm={6} md={4} key={cls._id}>
                                            <ClassCard onClick={() => handleClassClick(cls._id)}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <ClassIcon color="primary" sx={{ mr: 1 }} />
                                                        <Typography variant="h6">
                                                            Class {cls.sclassName}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {cls.subjects?.length || 0} subjects assigned
                                                    </Typography>
                                                    <Box sx={{ mt: 2 }}>
                                                        {cls.subjects && cls.subjects.map((sub) => (
                                                            <Typography key={sub._id} variant="body2" sx={{ py: 0.5 }}>
                                                                • {sub.subName}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                </CardContent>
                                            </ClassCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Stats Cards */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3} lg={3}>
                                <StyledPaper>
                                    <img src={Students} alt="Students" />
                                    <Title>
                                        Assigned Classes
                                    </Title>
                                    <Data start={0} end={totalClasses} duration={2.5} />
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12} md={3} lg={3}>
                                <StyledPaper>
                                    <img src={Lessons} alt="Lessons" />
                                    <Title>
                                        Total Subjects
                                    </Title>
                                    <Data start={0} end={totalSubjects} duration={5} />
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12} md={3} lg={3}>
                                <StyledPaper>
                                    <img src={Tests} alt="Tests" />
                                    <Title>
                                        Tests Taken
                                    </Title>
                                    <Data start={0} end={24} duration={4} />
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12} md={3} lg={3}>
                                <StyledPaper>
                                    <img src={Time} alt="Time" />
                                    <Title>
                                        Total Hours
                                    </Title>
                                    <Data start={0} end={30} duration={4} suffix="hrs"/>
                                </StyledPaper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                    <SeeNotice />
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Empty State */}
                        {teacherClasses.length === 0 && (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', mt: 2 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No classes assigned yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Contact your administrator to assign classes to you.
                                </Typography>
                            </Paper>
                        )}
                    </>
                )}
            </Container>
        </>
    )
}

export default TeacherHomePage

