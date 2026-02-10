import React, { useEffect, useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction, Box, Button, Collapse, Paper, Table, TableBody, TableHead, Typography, Avatar, Card } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { formatNepaliDate } from '../../utils/nepaliDate';
import styled, { keyframes } from 'styled-components';

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

const ViewStdAttendance = () => {
    const dispatch = useDispatch();

    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getUserDetails(currentUser._id, "Student"));
        }
    }, [dispatch, currentUser?._id]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance)

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const subjectData = Object.entries(attendanceBySubject).map(([subName, { subCode, present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => {
        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Subject</StyledTableCell>
                            <StyledTableCell>Present</StyledTableCell>
                            <StyledTableCell>Total Sessions</StyledTableCell>
                            <StyledTableCell>Attendance %</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => {
                        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);

                        return (
                            <TableBody key={index}>
                                <StyledTableRow>
                                    <StyledTableCell>
                                        <SubjectName>{subName}</SubjectName>
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <PresentBadge $present={true}>{present}</PresentBadge>
                                    </StyledTableCell>
                                    <StyledTableCell>{sessions}</StyledTableCell>
                                    <StyledTableCell>
                                        <AttendanceChip percentage={subjectAttendancePercentage}>
                                            {subjectAttendancePercentage}%
                                        </AttendanceChip>
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        <ExpandButton
                                            variant="contained"
                                            onClick={() => handleOpen(subId)}
                                            startIcon={openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        >
                                            {openStates[subId] ? 'Hide' : 'Show'} Details
                                        </ExpandButton>
                                    </StyledTableCell>
                                </StyledTableRow>
                                <StyledTableRow>
                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                        <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <DetailHeader>
                                                    <DetailTitle>Attendance Details</DetailTitle>
                                                </DetailHeader>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <StyledTableRow>
                                                            <StyledTableCell>Date</StyledTableCell>
                                                            <StyledTableCell align="right">Status</StyledTableCell>
                                                        </StyledTableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {allData.map((data, index) => {
                                                            const date = new Date(data.date);
                                                            const dateString = date.toString() !== "Invalid Date" ? formatNepaliDate(date, { format: 'full', showDayName: false }) : "Invalid Date";
                                                            return (
                                                                <StyledTableRow key={index}>
                                                                    <StyledTableCell component="th" scope="row">
                                                                        {dateString}
                                                                    </StyledTableCell>
                                                                    <StyledTableCell align="right">
                                                                        <StatusBadge status={data.status}>
                                                                            {data.status}
                                                                        </StatusBadge>
                                                                    </StyledTableCell>
                                                                </StyledTableRow>
                                                            )
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Collapse>
                                    </StyledTableCell>
                                </StyledTableRow>
                            </TableBody>
                        )
                    }
                    )}
                </Table>
                <OverallSection>
                    <OverallTitle>Overall Attendance</OverallTitle>
                    <OverallPercentage percentage={overallAttendancePercentage}>
                        {overallAttendancePercentage.toFixed(2)}%
                    </OverallPercentage>
                </OverallSection>
            </TableContainer>
        )
    }

    const renderChartSection = () => {
        return (
            <ChartContainer>
                <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
            </ChartContainer>
        )
    };

    return (
        <PageContainer>
            {loading
                ? (
                    <LoadingState>
                        <LoadingText>Loading attendance data...</LoadingText>
                    </LoadingState>
                )
                :
                <div>
                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ?
                        <>
                            {/* Header */}
                            <AttendanceHeader>
                                <HeaderIcon>
                                    📊
                                </HeaderIcon>
                                <HeaderContent>
                                    <HeaderTitle>My Attendance</HeaderTitle>
                                    <HeaderSubtitle>Track your class attendance records</HeaderSubtitle>
                                </HeaderContent>
                                <OverallBadge percentage={overallAttendancePercentage}>
                                    {overallAttendancePercentage.toFixed(1)}% Overall
                                </OverallBadge>
                            </AttendanceHeader>

                            {/* Content */}
                            <ContentCard>
                                {selectedSection === 'table' && renderTableSection()}
                                {selectedSection === 'chart' && renderChartSection()}
                            </ContentCard>

                            {/* Bottom Navigation */}
                            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: '16px 16px 0 0' }} elevation={3}>
                                <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
                                    <BottomNavigationAction
                                        label="Table View"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <BottomNavigationAction
                                        label="Chart View"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </BottomNavigation>
                            </Paper>
                        </>
                        :
                        <EmptyState>
                            <EmptyIcon>📋</EmptyIcon>
                            <EmptyTitle>No Attendance Records</EmptyTitle>
                            <EmptyText>Your attendance details will appear here once your teachers start taking attendance.</EmptyText>
                        </EmptyState>
                    }
                </div>
            }
        </PageContainer>
    )
}

const PageContainer = styled.div`
    padding: 24px;
    padding-bottom: 80px;
`;

const LoadingState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
`;

const LoadingText = styled(Typography)`
    color: #888;
    font-size: 1.1rem;
`;

const AttendanceHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    animation: ${fadeIn} 0.5s ease-out;
    
    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
    }
`;

const HeaderIcon = styled.div`
    font-size: 3rem;
    animation: ${float} 3s ease-in-out infinite;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const HeaderTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 4px 0;
    
    @media (max-width: 600px) {
        font-size: 1.3rem;
    }
`;

const HeaderSubtitle = styled.p`
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
`;

const OverallBadge = styled.div`
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-weight: 700;
    font-size: 1.2rem;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    @media (max-width: 600px) {
        margin-top: 12px;
    }
`;

const ContentCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const TableContainer = styled.div`
    padding: 16px;
`;

const SubjectName = styled.span`
    font-weight: 600;
    color: #1a1a2e;
    font-size: 1rem;
`;

const PresentBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    padding: 4px 12px;
    background: ${({ $present }) => $present ? '#e8f5e9' : '#ffebee'};
    color: ${({ $present }) => $present ? '#2e7d32' : '#c62828'};
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
`;

const AttendanceChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    background: ${({ percentage }) => {
        if (percentage >= 80) return '#e8f5e9';
        if (percentage >= 60) return '#fff3e0';
        return '#ffebee';
    }};
    color: ${({ percentage }) => {
        if (percentage >= 80) return '#2e7d32';
        if (percentage >= 60) return '#f57c00';
        return '#c62828';
    }};
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
`;

const ExpandButton = styled(Button)`
    border-radius: 8px !important;
    text-transform: none !important;
    font-weight: 600 !important;
    padding: 8px 16px !important;
`;

const DetailHeader = styled.div`
    margin-bottom: 12px;
`;

const DetailTitle = styled(Typography)`
    font-size: 1rem !important;
    font-weight: 600 !important;
    color: #1a1a2e !important;
`;

const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: ${({ status }) => status === 'Present' ? '#e8f5e9' : '#ffebee'};
    color: ${({ status }) => status === 'Present' ? '#2e7d32' : '#c62828'};
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
`;

const OverallSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 12px;
    margin-top: 16px;
`;

const OverallTitle = styled(Typography)`
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    color: #1a1a2e !important;
`;

const OverallPercentage = styled.span`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ percentage }) => {
        if (percentage >= 80) return '#2e7d32';
        if (percentage >= 60) return '#f57c00';
        return '#c62828';
    }};
`;

const ChartContainer = styled.div`
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 16px;
`;

const EmptyTitle = styled(Typography)`
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    color: #1a1a2e !important;
    margin-bottom: 8px !important;
`;

const EmptyText = styled(Typography)`
    font-size: 1rem !important;
    color: #888 !important;
    max-width: 400px;
    margin: 0 auto !important;
`;

export default ViewStdAttendance

