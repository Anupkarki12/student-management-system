import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Typography, Paper, Container, Card, CardContent,
    Grid, Chip, Button, IconButton, Collapse, Avatar
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
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

const StudentNotes = () => {
    const { currentUser } = useSelector((state) => state.user);
    
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedSubjects, setExpandedSubjects] = useState({});

    const studentClassId = currentUser?.sclassName?._id;

    useEffect(() => {
        if (studentClassId) {
            fetchNotes();
        }
    }, [studentClassId]);

    const fetchNotes = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Notes/Student/${studentClassId}`);
            
            if (result.data && result.data.message) {
                setNotes([]);
                setMessage({ type: 'info', text: 'No notes available for your class yet' });
            } else if (result.data && result.data.length > 0) {
                setNotes(result.data);
                const subjects = getSubjectsByGrouping(result.data);
                if (Object.keys(subjects).length > 0) {
                    const firstSubject = Object.keys(subjects)[0];
                    setExpandedSubjects({ [firstSubject]: true });
                }
            } else {
                setNotes([]);
                setMessage({ type: 'info', text: 'No notes found' });
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setMessage({ type: 'error', text: 'Error loading notes' });
        }
        setLoading(false);
    };

    const handleDownload = (note) => {
        const link = note.filePath;
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
        if (fileType?.includes('pdf')) return '📄 PDF';
        if (fileType?.includes('word') || fileType?.includes('document')) return '📝 DOC';
        if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📊 PPT';
        return '📁 FILE';
    };

    const getSubjectsByGrouping = (notesList) => {
        const grouped = {};
        notesList.forEach(note => {
            const subjectName = note.subject?.subName || 'General';
            if (!grouped[subjectName]) {
                grouped[subjectName] = [];
            }
            grouped[subjectName].push(note);
        });
        return grouped;
    };

    const handleExpandSubject = (subjectName) => {
        setExpandedSubjects(prev => ({
            ...prev,
            [subjectName]: !prev[subjectName]
        }));
    };

    const groupedNotes = getSubjectsByGrouping(notes);

    return (
        <PageContainer>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Header */}
                <HeaderSection>
                    <HeaderIcon>📝</HeaderIcon>
                    <HeaderContent>
                        <HeaderTitle>My Notes</HeaderTitle>
                        <HeaderSubtitle>Access study materials from your teachers</HeaderSubtitle>
                    </HeaderContent>
                    <NotesCount>
                        <CountBadge>{notes.length}</CountBadge>
                        <CountLabel>Notes</CountLabel>
                    </NotesCount>
                </HeaderSection>

                {/* Message */}
                {message.text && (
                    <MessageCard $type={message.type}>
                        <MessageText $type={message.type}>{message.text}</MessageText>
                    </MessageCard>
                )}

                {/* Stats */}
                <StatsRow>
                    <StatItem>
                        <StatNumber>{notes.length}</StatNumber>
                        <StatLabel>Total Notes</StatLabel>
                    </StatItem>
                    <StatItem>
                        <StatNumber>{Object.keys(groupedNotes).length}</StatNumber>
                        <StatLabel>Subjects</StatLabel>
                    </StatItem>
                    <RefreshButton 
                        variant="contained" 
                        onClick={fetchNotes}
                        startIcon={<RefreshIcon />}
                    >
                        Refresh
                    </RefreshButton>
                </StatsRow>

                {/* Content */}
                {loading ? (
                    <LoadingState><LoadingText>Loading notes...</LoadingText></LoadingState>
                ) : notes.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>📚</EmptyIcon>
                        <EmptyTitle>No Notes Available</EmptyTitle>
                        <EmptyText>Your teachers haven't uploaded any notes for your class yet.</EmptyText>
                    </EmptyState>
                ) : (
                    <NotesGrid container spacing={3}>
                        {Object.entries(groupedNotes).map(([subjectName, subjectNotes]) => (
                            <Grid item xs={12} key={subjectName}>
                                <SubjectCard>
                                    <CardContent>
                                        <SubjectHeader 
                                            onClick={() => handleExpandSubject(subjectName)}
                                        >
                                            <SubjectInfo>
                                                <SubjectAvatar>
                                                    📖
                                                </SubjectAvatar>
                                                <Box>
                                                    <SubjectName>{subjectName}</SubjectName>
                                                    <SubjectCount>{subjectNotes.length} note{subjectNotes.length !== 1 ? 's' : ''}</SubjectCount>
                                                </Box>
                                            </SubjectInfo>
                                            <ExpandIcon $expanded={expandedSubjects[subjectName]}>
                                                <ExpandMoreIcon />
                                            </ExpandIcon>
                                        </SubjectHeader>

                                        <Collapse in={expandedSubjects[subjectName]}>
                                            <NotesList container spacing={2}>
                                                {subjectNotes.map((note) => (
                                                    <Grid item xs={12} md={6} key={note._id}>
                                                        <NoteCard>
                                                            <NoteCardHeader>
                                                                <FileTypeBadge>
                                                                    {getFileIcon(note.fileType)}
                                                                </FileTypeBadge>
                                                                <NoteTitle>{note.title}</NoteTitle>
                                                                <DownloadButton 
                                                                    color="primary" 
                                                                    size="small"
                                                                    onClick={() => handleDownload(note)}
                                                                    title="Download"
                                                                >
                                                                    <DownloadIcon />
                                                                </DownloadButton>
                                                            </NoteCardHeader>

                                                            <NoteDescription>
                                                                {note.description}
                                                            </NoteDescription>

                                                            <NoteMeta>
                                                                <MetaItem>
                                                                    <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: '#888' }} />
                                                                    <MetaText>{note.teacher?.name || 'Teacher'}</MetaText>
                                                                </MetaItem>
                                                                <MetaItem>
                                                                    <MetaText>{formatDate(note.createdAt)} • {formatFileSize(note.fileSize)}</MetaText>
                                                                </MetaItem>
                                                            </NoteMeta>

                                                            <FileName>
                                                                📎 {note.fileName}
                                                            </FileName>
                                                        </NoteCard>
                                                    </Grid>
                                                ))}
                                            </NotesList>
                                        </Collapse>
                                    </CardContent>
                                </SubjectCard>
                            </Grid>
                        ))}
                    </NotesGrid>
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

const HeaderContent = styled.div`
    flex: 1;
`;

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

const NotesCount = styled.div`
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

const StatsRow = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    background: white;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    @media (max-width: 600px) {
        flex-wrap: wrap;
        justify-content: center;
    }
`;

const StatItem = styled.div`
    text-align: center;
`;

const StatNumber = styled.span`
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
`;

const StatLabel = styled.span`
    display: block;
    font-size: 0.85rem;
    color: #888;
`;

const RefreshButton = styled(Button)`
    border-radius: 8px !important;
    text-transform: none !important;
    font-weight: 600 !important;
    margin-left: auto !important;
    
    @media (max-width: 600px) {
        margin-left: 0 !important;
        margin-top: 12px;
    }
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
    background: white;
    border-radius: 16px;
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

const NotesGrid = styled(Grid)`
    margin-bottom: 32px;
`;

const SubjectCard = styled(Card)`
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.5s ease-out;
    
    &:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
    }
`;

const SubjectHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    margin: -8px;
    margin-bottom: 8px;
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
        background: #f5f5f5;
    }
`;

const SubjectInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SubjectAvatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
`;

const SubjectName = styled(Typography)`
    font-weight: 700 !important;
    color: #1a1a2e !important;
    font-size: 1.1rem !important;
`;

const SubjectCount = styled(Typography)`
    font-size: 0.85rem !important;
    color: #888 !important;
`;

const ExpandIcon = styled(IconButton)`
    transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.3s ease;
`;

const NotesList = styled(Grid)`
    margin-top: 16px !important;
`;

const NoteCard = styled(Paper)`
    padding: 16px;
    background: #fafafa !important;
    border-radius: 12px !important;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
    
    &:hover {
        background: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
`;

const NoteCardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
`;

const FileTypeBadge = styled(Chip)`
    font-size: 0.75rem !important;
    height: 24px !important;
`;

const NoteTitle = styled(Typography)`
    flex: 1;
    font-weight: 600 !important;
    color: #1a1a2e !important;
    font-size: 1rem !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DownloadButton = styled(IconButton)`
    color: #667eea !important;
`;

const NoteDescription = styled(Typography)`
    color: #666 !important;
    font-size: 0.9rem !important;
    margin-bottom: 12px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    WebkitLineClamp: 2;
    WebkitBoxOrient: vertical;
`;

const NoteMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 8px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const MetaText = styled(Typography)`
    font-size: 0.8rem !important;
    color: #888 !important;
`;

const FileName = styled(Typography)`
    font-size: 0.8rem !important;
    color: #667eea !important;
    font-weight: 500;
`;

export default StudentNotes;

