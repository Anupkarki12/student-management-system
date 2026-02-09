import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    Chip
} from "@mui/material";
import SeeNotice from "../../components/SeeNotice";
import styled, { keyframes } from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import { getSalarySummary } from "../../redux/salaryRelated/salaryHandle";
import { getAllStaffs } from "../../redux/staffRelated/staffHandle";
import { getAllNotices } from "../../redux/noticeRelated/noticeHandle";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import SchoolIcon from "@mui/icons-material/School";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CampaignIcon from "@mui/icons-material/Campaign";
import ViewListIcon from "@mui/icons-material/ViewList";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaymentIcon from "@mui/icons-material/Payment";

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

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(100, 181, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(100, 181, 246, 0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { salaryRecords } = useSelector((state) => state.salary);
    const { noticesList = [] } = useSelector((state) => state.notice);
    const { staffList } = useSelector((state) => state.staff);
    const { currentUser } = useSelector((state) => state.user);

    const adminID = currentUser?._id;
    const adminName = currentUser?.name || "Admin";

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (adminID) {
            dispatch(getAllStudents(adminID));
            dispatch(getAllSclasses(adminID, "Sclass"));
            dispatch(getAllTeachers(adminID));
            dispatch(getSalarySummary(adminID));
            dispatch(getAllStaffs(adminID));
            dispatch(getAllNotices(adminID, 'Notice'));
        }
    }, [adminID, dispatch]);

    // Update date every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;
    const numberOfStaff = staffList && staffList.length;
    const numberOfNotices = noticesList.length;

    // Calculate total salary records from salaryRecords
    const salaryData = salaryRecords || {};
    const totalSalaryRecords = 
        (salaryData.byEmployeeType?.teacher?.count || 0) +
        (salaryData.byEmployeeType?.staff?.count || 0) +
        (salaryData.byEmployeeType?.admin?.count || 0);

    const formatDate = (date) => {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <PageContainer>
            <Container maxWidth="xl">
                {/* Welcome Header Section */}
                <WelcomeSection>
                    <WelcomeInfo>
                        <WelcomeTitle>Welcome back, {adminName}! 👋</WelcomeTitle>
                        <WelcomeSubtitle>Here's what's happening in your school today</WelcomeSubtitle>
                    </WelcomeInfo>
                    <DateBadge>
                        <DateIcon>📅</DateIcon>
                        {formatDate(currentDate)}
                    </DateBadge>
                </WelcomeSection>

                {/* Stats Cards Section */}
                <SectionTitle>📊 Quick Statistics</SectionTitle>
                <StatsGrid container spacing={3}>
                    {/* Total Students Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.1s">
                            <StatIconWrapper $color="#64b5f6">
                                <PeopleIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfStudents} duration={2.5} />
                            </StatCount>
                            <StatLabel>Total Students</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Total Classes Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.2s">
                            <StatIconWrapper $color="#ffb74d">
                                <ClassIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfClasses} duration={2.5} />
                            </StatCount>
                            <StatLabel>Total Classes</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Total Teachers Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.3s">
                            <StatIconWrapper $color="#81c784">
                                <SchoolIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfTeachers} duration={2.5} />
                            </StatCount>
                            <StatLabel>Total Teachers</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Total Staff Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.4s">
                            <StatIconWrapper $color="#ba68c8">
                                <GroupIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfStaff} duration={2.5} />
                            </StatCount>
                            <StatLabel>Total Staff</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Salary Records Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.5s">
                            <StatIconWrapper $color="#ff8a65">
                                <AttachMoneyIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={totalSalaryRecords} duration={2} />
                            </StatCount>
                            <StatLabel>Salary Records</StatLabel>
                        </StatCard>
                    </Grid>

                    {/* Notices Card */}
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard animationDelay="0.6s">
                            <StatIconWrapper $color="#4dd0e1">
                                <NotificationsIcon />
                            </StatIconWrapper>
                            <StatCount>
                                <Data start={0} end={numberOfNotices} duration={1.5} />
                            </StatCount>
                            <StatLabel>Active Notices</StatLabel>
                        </StatCard>
                    </Grid>
                </StatsGrid>

                {/* Quick Actions Section */}
                <SectionTitle>⚡ Quick Actions</SectionTitle>
                <ActionsGrid container spacing={2}>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/addstudents">
                            <ActionIcon $color="#64b5f6">
                                <PersonAddIcon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>Add Student</ActionLabel>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/teachers/addteacher">
                            <ActionIcon $color="#81c784">
                                <PersonAddAlt1Icon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>Add Teacher</ActionLabel>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/addnotice">
                            <ActionIcon $color="#ffb74d">
                                <CampaignIcon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>Add Notice</ActionLabel>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/classes">
                            <ActionIcon $color="#ba68c8">
                                <ViewListIcon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>View Classes</ActionLabel>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/results">
                            <ActionIcon $color="#ff8a65">
                                <AssessmentIcon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>View Reports</ActionLabel>
                        </ActionCard>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <ActionCard to="/Admin/fees">
                            <ActionIcon $color="#4dd0e1">
                                <PaymentIcon fontSize="inherit" />
                            </ActionIcon>
                            <ActionLabel>View Fees</ActionLabel>
                        </ActionCard>
                    </Grid>
                </ActionsGrid>

                {/* Notice Section */}
                <SectionTitle>📢 School Notices</SectionTitle>
                <NoticePaper>
                    <SeeNoticeWrapper>
                        <SeeNotice />
                    </SeeNoticeWrapper>
                </NoticePaper>

                {/* Footer */}
                <DashboardFooter>
                    <FooterText>🎓 Student Management System • Admin Dashboard</FooterText>
                </DashboardFooter>
            </Container>
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
`;

const WelcomeSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    background: linear-gradient(135deg, #1f1f38 0%, #2c2c6c 100%);
    border-radius: 16px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(31, 31, 56, 0.3);
    
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

const DateBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-weight: 500;
    font-size: 0.9rem;
    backdrop-filter: blur(10px);
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
    
    &:hover {
        background: rgba(255, 255, 255, 0.25);
    }
`;

const DateIcon = styled.span`
    font-size: 1.1rem;
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

const ActionsGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const ActionCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    background: #ffffff;
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    height: 100%;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        border-color: ${({ $color }) => $color};
    }
`;

const ActionIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${({ $color }) => `${$color}12`};
    color: ${({ $color }) => $color};
    margin-bottom: 10px;
    font-size: 24px;
    transition: all 0;
    
    ${ActionCard}:hover.3s ease & {
        background: ${({ $color }) => $color};
        color: #ffffff;
        animation: ${pulse} 1.5s infinite;
    }
`;

const ActionLabel = styled.span`
    font-size: 0.85rem;
    font-weight: 600;
    color: #1a1a2e;
    text-align: center;
`;

const NoticePaper = styled(Paper)`
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
`;

const SeeNoticeWrapper = styled.div`
    width: 100%;
    
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

export default AdminHomePage;

