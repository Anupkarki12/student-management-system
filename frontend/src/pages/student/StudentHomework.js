import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Container, Card, CardContent,
    Grid, Chip, TextField, Button, Avatar
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0px); }
`;

const StudentHomework = () => {
    const { currentUser } = useSelector((state) => state.user);
    
    const [homework, setHomework] = useState([]);
    const [filteredHomework, setFilteredHomework] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const studentClassId = currentUser?.sclassName?._id;

    useEffect(() => {
        if (studentClassId) {
            fetchHomework();
        }
    }, [studentClassId]);

    useEffect(() => {
        filterHomework();
    }, [homework, selectedDate]);

    const fetchHomework = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Homework/Student/${studentClassId}`);
            
            if (result.data && result.data.message) {
                setHomework([]);
                setMessage({ type: 'info', text: 'No homework assigned yet' });
            } else if (result.data && result.data.length > 0) {
                setHomework(result.data);
            } else {
                setHomework([]);
                setMessage({ type: 'info', text: 'No homework found' });
            }
        } catch (error) {
            console.error('Error fetching homework:', error);
            setMessage({ type: 'error', text: 'Error loading homework' });
        }
        setLoading(false);
    };

    const filterHomework = () => {
        if (!selectedDate) {
            setFilteredHomework(homework);
        } else {
            const filtered = homework.filter(hw => {
                const hwDate = new Date(hw.dueDate).toISOString().split('T')[0];
                return hwDate === selectedDate;
            });
            setFilteredHomework(filtered);
        }
    };

    const isOverdue = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        return due < today;
    };

    const isDueToday = (dueDate) => {
        const today = new Date().toISOString().split('T')[0];
        const due = new Date(dueDate).toISOString().split('T')[0];
        return due === today;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusChip = (dueDate) => {
        if (isOverdue(dueDate)) {
            return <StatusChip $status="overdue">Overdue</StatusChip>;
        } else if (isDueToday(dueDate)) {
            return <StatusChip $status="today">Due Today</StatusChip>;
        } else {
            return <StatusChip $status="pending">Pending</StatusChip>;
        }
    };

    const getDaysRemaining = (dueDate) => {
        if (isOverdue(dueDate)) return 'X';
        return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const getBorderColor = (dueDate) => {
        if (isOverdue(dueDate)) return '#f44336';
        if (isDueToday(dueDate)) return '#ff9800';
        return '#4caf50';
    };

    const getStatusColor = (dueDate) => {
        if (isOverdue(dueDate)) return '#f44336';
        if (isDueToday(dueDate)) return '#ff9800';
        return '#4caf50';
    };

    return (
        <PageContainer>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Header */}
                <HeaderSection>
                    <HeaderIcon>📚</HeaderIcon>
                    <HeaderContent>
                        <HeaderTitle>My Homework</HeaderTitle>
                        <HeaderSubtitle>View and track your assigned homework</HeaderSubtitle>
                    </HeaderContent>
                    <HomeworkCount>
                        <CountBadge>{filteredHomework.length}</CountBadge>
                        <CountLabel>Items</CountLabel>
                    </HomeworkCount>
                </HeaderSection>

                {/* Filter Section */}
                <FilterCard>
                    <FilterTitle>Filter Options</FilterTitle>
                    <FilterGrid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Filter by Due Date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="medium"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <RefreshButton 
                                variant="outlined" 
                                onClick={fetchHomework}
                                startIcon={<RefreshIcon />}
                            >
                                Refresh
                            </RefreshButton>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatsText>
                                {filteredHomework.length} homework item{filteredHomework.length !== 1 ? 's' : ''}
                            </StatsText>
                        </Grid>
                    </FilterGrid>
                </FilterCard>

                {/* Message */}
                {message.text && (
                    <MessageCard $type={message.type}>
                        <MessageText $type={message.type}>{message.text}</MessageText>
                    </MessageCard>
                )}

                {/* Content */}
                {loading ? (
                    <LoadingState><LoadingText>Loading homework...</LoadingText></LoadingState>
                ) : filteredHomework.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>📝</EmptyIcon>
                        <EmptyTitle>No Homework Found</EmptyTitle>
                        <EmptyText>Your teachers haven't assigned any homework yet.</EmptyText>
                    </EmptyState>
                ) : (
                    <HomeworkGrid container spacing={3}>
                        {filteredHomework.map((hw) => (
                            <Grid item xs={12} key={hw._id}>
                                <HomeworkCard 
                                    sx={{ borderLeft: `4px solid ${getBorderColor(hw.dueDate)}` }}
                                >
                                    <CardContent>
                                        <HomeworkHeader>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <HomeworkIcon $color={getBorderColor(hw.dueDate)}>
                                                    <AssignmentIcon sx={{ fontSize: 28 }} />
                                                </HomeworkIcon>
                                                <HomeworkTitle variant="h6" component="h2">
                                                    {hw.title}
                                                </HomeworkTitle>
                                            </Box>
                                            {getStatusChip(hw.dueDate)}
                                        </HomeworkHeader>
                                        
                                        <HomeworkDescription variant="body1">
                                            {hw.description}
                                        </HomeworkDescription>

                                        <HomeworkMetaGrid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <MetaItem>
                                                    <MetaIcon><PersonIcon sx={{ fontSize: 20 }} /></MetaIcon>
                                                    <MetaText>
                                                        <strong>Teacher:</strong> {hw.teacher?.name || 'Not specified'}
                                                    </MetaText>
                                                </MetaItem>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <MetaItem>
                                                    <MetaIcon><CalendarTodayIcon sx={{ fontSize: 20 }} /></MetaIcon>
                                                    <MetaText>
                                                        <strong>Due:</strong> {formatDate(hw.dueDate)}
                                                    </MetaText>
                                                </MetaItem>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <MetaItem>
                                                    <SubjectChip 
                                                        label={hw.subject?.subName || 'General'}
                                                        size="small"
                                                    />
                                                </MetaItem>
                                            </Grid>
                                        </HomeworkMetaGrid>

                                        <DaysRemainingCard $color={getStatusColor(hw.dueDate)}>
                                            <DaysLabel>Days Remaining</DaysLabel>
                                            <DaysNumber>{getDaysRemaining(hw.dueDate)}</DaysNumber>
                                        </DaysRemainingCard>
                                    </CardContent>
                                </HomeworkCard>
                            </Grid>
                        ))}
                    </HomeworkGrid>
                )}
            </Container>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
`;

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 32px;
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

const HeaderContent = styled.div`flex: 1;`;

const HeaderTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin: 0 0 4px 0;
    
    @media (max-width: 600px) {
        font-size: 1.4rem;
    }
`;

const HeaderSubtitle = styled.p`
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
`;

const HomeworkCount = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    
    @media (max-width: 600px) {
        margin-top: 12px;
    }
`;

const CountBadge = styled.span`
    font-size: 2rem;
    font-weight: 700;
    color: white;
`;

const CountLabel = styled.span`
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
`;

const FilterCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    margin-bottom: 24px;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
`;

const FilterTitle = styled(Typography)`
    font-size: 1rem !important;
    font-weight: 600 !important;
    color: #1a1a2e !important;
    padding: 16px 24px 8px !important;
`;

const FilterGrid = styled(Grid)`
    padding: 0 24px 16px !important;
`;

const RefreshButton = styled(Button)`
    border-radius: 8px !important;
    text-transform: none !important;
    font-weight: 600 !important;
`;

const StatsText = styled(Typography)`
    font-size: 0.95rem !important;
    color: #666 !important;
    text-align: right;
    
    @media (max-width: 600px) {
        text-align: center;
    }
`;

const MessageCard = styled(Paper)`
    padding: 16px 24px;
    margin-bottom: 24px;
    border-radius: 12px !important;
    background: ${({ $type }) => 
        $type === 'error' ? '#ffebee' : 
        $type === 'success' ? '#e8f5e9' : '#e3f2fd'} !important;
    animation: ${fadeIn} 0.3s ease-out;
`;

const MessageText = styled(Typography)`
    color: ${({ $type }) => 
        $type === 'error' ? '#c62828' : 
        $type === 'success' ? '#2e7d32' : '#1976d2'} !important;
    font-weight: 500 !important;
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 60px 20px;
`;

const LoadingText = styled(Typography)`
    font-size: 1.1rem !important;
    color: #888 !important;
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
`;

const HomeworkGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const HomeworkCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.5s ease-out;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
    }
`;

const HomeworkHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 12px;
`;

const HomeworkIcon = styled(Avatar)`
    background: ${({ $color }) => `${$color}20`} !important;
    color: ${({ $color }) => $color} !important;
`;

const HomeworkTitle = styled(Typography)`
    font-weight: 700 !important;
    color: #1a1a2e !important;
    font-size: 1.2rem !important;
`;

const StatusChip = styled(Chip)`
    font-weight: 600 !important;
    font-size: 0.8rem !important;
    padding: 4px 0 !important;
    background: ${({ $status }) => 
        $status === 'overdue' ? '#ffebee' : 
        $status === 'today' ? '#fff3e0' : '#e8f5e9'} !important;
    color: ${({ $status }) => 
        $status === 'overdue' ? '#c62828' : 
        $status === 'today' ? '#f57c00' : '#2e7d32'} !important;
    border: 2px solid ${({ $status }) => 
        $status === 'overdue' ? '#c62828' : 
        $status === 'today' ? '#f57c00' : '#2e7d32'} !important;
`;

const HomeworkDescription = styled(Typography)`
    color: #666 !important;
    margin-bottom: 16px !important;
    line-height: 1.6 !important;
`;

const HomeworkMetaGrid = styled(Grid)`
    margin-bottom: 16px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MetaIcon = styled.span`
    color: #888;
    display: flex;
    align-items: center;
`;

const MetaText = styled.span`
    font-size: 0.9rem;
    color: #666;
`;

const SubjectChip = styled(Chip)`
    font-weight: 600 !important;
`;

const DaysRemainingCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: ${({ $color }) => `${$color}10`};
    border-radius: 12px;
    border: 2px dashed ${({ $color }) => $color};
`;

const DaysLabel = styled.span`
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 4px;
`;

const DaysNumber = styled.span`
    font-size: 2rem;
    font-weight: 700;
    color: ${({ $color }) => $color};
`;

export default StudentHomework;

