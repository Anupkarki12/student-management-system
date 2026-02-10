import React, { useEffect, useState } from 'react'
import { Container, Grid, Paper, Typography, Box, Card, CardContent, Avatar } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import Subject from "../../assets/subjects.svg";
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const StudentHomePage = () => {
    const dispatch = useDispatch();

    const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const classID = currentUser?.sclassName?._id;
    const studentName = currentUser?.name || "Student";
    const className = currentUser?.sclassName?.sclassName || "N/A";

    useEffect(() => {
        if (currentUser?._id && classID) {
            dispatch(getUserDetails(currentUser._id, "Student"));
            dispatch(getSubjectList(classID, "ClassSubjects"));
        }
    }, [dispatch, currentUser?._id, classID]);

    const numberOfSubjects = subjectsList && subjectsList.length;

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    return (
        <PageContainer>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Welcome Header Section */}
                <WelcomeSection>
                    <WelcomeInfo>
                        <WelcomeTitle>Hello, {studentName}! 👋</WelcomeTitle>
                        <WelcomeSubtitle>Welcome to your student dashboard</WelcomeSubtitle>
                    </WelcomeInfo>
                    <WelcomeBadge>
                        🎓 Class {className}
                    </WelcomeBadge>
                </WelcomeSection>

                {/* Stats Cards Section */}
                <SectionTitle>📊 Quick Overview</SectionTitle>
                <StatsGrid container spacing={3}>
                    {/* Total Subjects Card */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard animationDelay="0.1s">
                            <StatIconWrapper $color="#64b5f6">
                                <MenuBookIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfSubjects} duration={2.5} />
                            </StatCount>
                            <StatLabel>Total Subjects</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Attendance Card */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard animationDelay="0.2s">
                            <StatIconWrapper $color="#81c784">
                                <CheckCircleIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={overallAttendancePercentage} duration={2.5} suffix="%" />
                            </StatCount>
                            <StatLabel>Attendance</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Homework Pending Card */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard animationDelay="0.3s">
                            <StatIconWrapper $color="#ffb74d">
                                <WarningIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={3} duration={1} />
                            </StatCount>
                            <StatLabel>Homework Pending</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Upcoming Exams Card */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard animationDelay="0.4s">
                            <StatIconWrapper $color="#ba68c8">
                                <EventIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={2} duration={1.5} />
                            </StatCount>
                            <StatLabel>Upcoming Exams</StatLabel>
                        </StatCard>
                    </Grid>
                </StatsGrid>

                {/* Main Content Grid */}
                <MainGrid container spacing={3}>
                    {/* Attendance Chart */}
                    <Grid item xs={12} md={6}>
                        <ChartCard>
                            <ChartHeader>
                                <Avatar sx={{ bgcolor: '#e3f2fd', width: 44, height: 44 }}>
                                    <CheckCircleIcon sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <ChartTitle>Attendance Overview</ChartTitle>
                            </ChartHeader>
                            <ChartContainer>
                                {
                                    response ?
                                        <EmptyState>
                                            <Typography variant="h6">No Attendance Found</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Your attendance records will appear here
                                            </Typography>
                                        </EmptyState>
                                        :
                                        <>
                                            {loading
                                                ? (
                                                    <EmptyState>
                                                        <Typography variant="h6">Loading...</Typography>
                                                    </EmptyState>
                                                )
                                                :
                                                <>
                                                    {
                                                        subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                                                        <ChartWrapper>
                                                            <CustomPieChart data={chartData} />
                                                            <ChartLegend>
                                                                <LegendItem>
                                                                    <LegendDot $color="#4caf50" />
                                                                    <span>Present: {overallAttendancePercentage.toFixed(1)}%</span>
                                                                </LegendItem>
                                                                <LegendItem>
                                                                    <LegendDot $color="#f44336" />
                                                                    <span>Absent: {overallAbsentPercentage.toFixed(1)}%</span>
                                                                </LegendItem>
                                                            </ChartLegend>
                                                        </ChartWrapper>
                                                    )
                                                        :
                                                        <EmptyState>
                                                            <Typography variant="h6">No Attendance Found</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                Your attendance records will appear here
                                                            </Typography>
                                                        </EmptyState>
                                                    }
                                                </>
                                            }
                                        </>
                                }
                            </ChartContainer>
                        </ChartCard>
                    </Grid>

                    {/* Notice Section */}
                    <Grid item xs={12} md={6}>
                        <NoticeCard>
                            <NoticeHeader>
                                <Avatar sx={{ bgcolor: '#fff3e0', width: 44, height: 44 }}>
                                    <EventIcon sx={{ color: '#f57c00' }} />
                                </Avatar>
                                <NoticeTitle>School Notices</NoticeTitle>
                            </NoticeHeader>
                            <NoticeContent>
                                <SeeNotice />
                            </NoticeContent>
                        </NoticeCard>
                    </Grid>
                </MainGrid>

                {/* Footer */}
                <DashboardFooter>
                    <FooterText>🎓 Student Management System</FooterText>
                </DashboardFooter>
            </Container>
        </PageContainer>
    )
}

const PageContainer = styled.div`
    min-height: calc(100vh - 100px);
`;

const WelcomeSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    
    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
        gap: 16px;
    }
`;

const WelcomeInfo = styled.div`
    animation: ${fadeIn} 0.6s ease-out;
`;

const WelcomeTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px 0;
    
    @media (max-width: 600px) {
        font-size: 1.4rem;
    }
`;

const WelcomeSubtitle = styled.p`
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
`;

const WelcomeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-weight: 600;
    font-size: 1rem;
    backdrop-filter: blur(10px);
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
    
    &:hover {
        background: rgba(255, 255, 255, 0.25);
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 20px 0;
    padding-left: 4px;
`;

const StatsGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const StatCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out ${({ animationDelay }) => animationDelay || '0s'} both;
    height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
    }
`;

const StatIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: ${({ $color }) => `${$color}15`};
    color: ${({ $color }) => $color};
    margin-bottom: 12px;
    animation: ${float} 3s ease-in-out infinite;
    
    & svg {
        font-size: 26px;
    }
`;

const StatCount = styled.div`
    margin-bottom: 6px;
`;

const StatLabel = styled.p`
    font-size: 0.85rem;
    color: #666;
    margin: 0;
    font-weight: 500;
`;

const Data = styled(CountUp)`
    font-size: calc(1.8rem + 0.8vw);
    font-weight: 700;
    color: #1a1a2e;
`;

const MainGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const ChartCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    height: 100%;
    overflow: hidden;
`;

const ChartHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
`;

const ChartTitle = styled(Typography)`
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
`;

const ChartContainer = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
`;

const ChartWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
`;

const ChartLegend = styled.div`
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #666;
`;

const LegendDot = styled.span`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: #888;
`;

const NoticeCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    height: 100%;
    overflow: hidden;
`;

const NoticeHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
`;

const NoticeTitle = styled(Typography)`
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
`;

const NoticeContent = styled.div`
    padding: 16px;
    
    & > div {
        margin-top: 0 !important;
        margin-right: 0 !important;
    }
`;

const DashboardFooter = styled.div`
    margin-top: 32px;
    padding: 24px 0;
    text-align: center;
    border-top: 1px solid #e0e0e0;
`;

const FooterText = styled.p`
    font-size: 0.85rem;
    color: #888;
    margin: 0;
`;

export default StudentHomePage

