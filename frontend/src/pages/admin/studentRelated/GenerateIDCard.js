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
import styled, { keyframes } from 'styled-components';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Animation keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const cardFloat = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
`;

const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
    100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
`;

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
        <ViewContainer>
            <HeaderSection>
                <HeaderLeft>
                    <HeaderTitle>🎴 Select a Class to Generate ID Cards</HeaderTitle>
                    <HeaderSubtitle>Choose a class to generate ID cards for students</HeaderSubtitle>
                </HeaderLeft>
                <AddButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                    <AddCircleIcon sx={{ mr: 1 }} />
                    Add Class
                </AddButton>
            </HeaderSection>

            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                    <LoadingText>Loading classes...</LoadingText>
                </LoadingContainer>
            ) : error ? (
                <EmptyStateContainer>
                    <EmptyStateIcon>⚠️</EmptyStateIcon>
                    <EmptyStateTitle>Error Loading Classes</EmptyStateTitle>
                    <EmptyStateText>Please try again later</EmptyStateText>
                </EmptyStateContainer>
            ) : !sclassesList || sclassesList.length === 0 ? (
                <EmptyStateContainer>
                    <EmptyStateIcon>📋</EmptyStateIcon>
                    <EmptyStateTitle>No Classes Found</EmptyStateTitle>
                    <EmptyStateText>Please add a class first to generate ID cards</EmptyStateText>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </GreenButton>
                </EmptyStateContainer>
            ) : (
                <Grid container spacing={3}>
                    {Array.isArray(sclassesList) && sclassesList.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cls._id}>
                            <ClassCard onClick={() => handleClassSelect(cls)}>
                                <CardIconWrapper>
                                    <GroupIcon sx={{ fontSize: 40 }} />
                                </CardIconWrapper>
                                <CardTitle>Class {cls.sclassName}</CardTitle>
                                <CardSubtitle>Generate ID Cards for all students</CardSubtitle>
                                <ViewChip label="Select Class" icon={<ArrowForwardIcon />} />
                                <ArrowHint>→</ArrowHint>
                            </ClassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </ViewContainer>
    );

    const renderPreview = () => {
        const studentsToShow = getStudentsForCards();

        return (
            <ViewContainer>
                <BreadcrumbsStyled>
                    <BreadcrumbLink
                        color="inherit"
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleBack(); }}
                        sx={{ display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowBackIcon sx={{ mr: 0.5 }} /> Classes
                    </BreadcrumbLink>
                    <BreadcrumbCurrent>ID Cards</BreadcrumbCurrent>
                </BreadcrumbsStyled>

                <HeaderSection>
                    <HeaderLeft>
                        <HeaderTitle>🎴 ID Cards - Class {selectedClass?.sclassName}</HeaderTitle>
<HeaderSubtitle>{studentsToShow.length} students ready</HeaderSubtitle>
                    </HeaderLeft>
                    <ActionButtons>
                        <SearchField
                            size="small"
                            placeholder="Search by name or roll..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                        <PrintButton
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handleBulkPrint}
                            disabled={studentsToShow.length === 0}
                        >
                            Print All ({selectedStudents.length || studentsToShow.length})
                        </PrintButton>
                    </ActionButtons>
                </HeaderSection>

                <SelectionPaper>
                    <SelectionContent>
                        <SelectButton
                            variant={selectAll ? "contained" : "outlined"}
                            onClick={handleSelectAll}
                            size="small"
                        >
                            {selectAll ? 'Deselect All' : 'Select All'}
                        </SelectButton>
                        <SelectionChip
                            icon={<CheckCircleIcon />}
                            label={`${selectedStudents.length} selected`}
                            color={selectedStudents.length > 0 ? "primary" : "default"}
                        />
                        <SelectionText>
                            Click on cards to select/deselect for printing
                        </SelectionText>
                    </SelectionContent>
                </SelectionPaper>

                {loading ? (
                    <LoadingContainer>
                        <CircularProgress />
                        <LoadingText>Loading students...</LoadingText>
                    </LoadingContainer>
                ) : (
                    <Grid container spacing={3}>
                        {filteredStudents.map((student) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                                <StudentCard
                                    selected={selectedStudents.includes(student._id)}
                                    onClick={() => handleStudentToggle(student._id)}
                                >
                                    <CardContent>
                                        <StudentHeader>
                                            <AvatarCircle selected={selectedStudents.includes(student._id)}>
                                                {selectedStudents.includes(student._id) ? '✓' : student.rollNum}
                                            </AvatarCircle>
                                            <StudentInfo>
                                                <StudentName>{student.name}</StudentName>
                                                <StudentRoll>Roll: {student.rollNum}</StudentRoll>
                                            </StudentInfo>
                                        </StudentHeader>
                                        <CardPreview>
                                            <div onClick={(e) => { e.stopPropagation(); }}>
                                                <IDCardTemplate
                                                    student={student}
                                                    school={currentUser}
                                                    cardSize="compact"
                                                />
                                            </div>
                                        </CardPreview>
                                        <PrintButton
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<PrintIcon />}
                                            sx={{ mt: 2 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrintSingle(student);
                                            }}
                                        >
                                            Print This Card
                                        </PrintButton>
                                    </CardContent>
                                </StudentCard>
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
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BadgeIcon />
                            Student ID Card
                        </Box>
                        <IconButton onClick={() => setPrintDialogOpen(false)} sx={{ color: 'white' }}>
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
            </ViewContainer>
        );
    };

    return (
        <PageContainer>
            <MainContainer maxWidth="xl">
                {viewMode === 'select' && renderClassSelection()}
                {viewMode === 'preview' && renderPreview()}
            </MainContainer>
        </PageContainer>
    );
};

// Styled Components - DEPENDENT COMPONENTS FIRST
// Components that are referenced by other components' hover styles MUST be defined before those components
const CardIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 18px;
    background: #f0f4ff;
    color: #667eea;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    
    & svg {
        font-size: 36px;
    }
`;

const ArrowHint = styled.span`
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) translateX(-10px);
    opacity: 0;
    font-size: 1.5rem;
    color: #667eea;
    transition: all 0.3s ease;
`;

const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
    padding: 24px;
`;

const MainContainer = styled.div`
    animation: ${fadeIn} 0.4s ease-out;
`;

const ViewContainer = styled.div`
    animation: ${fadeIn} 0.4s ease-out;
`;

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
    
    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    flex-direction: column;
`;

const HeaderTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
    font-size: 0.9rem;
    color: #888;
    margin: 0;
`;

const AddButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
    
    &:hover {
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
        transform: translateY(-2px);
    }
`;

const GreenButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
    box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3) !important;
    
    &:hover {
        box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4) !important;
        transform: translateY(-2px);
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #667eea;
`;

const LoadingText = styled.p`
    margin-top: 16px;
    font-size: 1rem;
    color: #888;
`;

const EmptyStateContainer = styled.div`
    text-align: center;
    padding: 60px 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const EmptyStateIcon = styled.div`
    font-size: 4rem;
    margin-bottom: 16px;
`;

const EmptyStateTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a1a2e;
    margin: 0 0 8px 0;
`;

const EmptyStateText = styled.p`
    font-size: 0.95rem;
    color: #888;
    margin: 0;
`;

const ClassCard = styled(Card)`
    cursor: pointer;
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    padding: 24px !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    
    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        
        ${CardIconWrapper} {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            animation: ${cardFloat} 2s ease-in-out infinite;
        }
        
        ${ArrowHint} {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
        }
    }
`;

const CardTitle = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 8px;
`;

const CardSubtitle = styled(Typography)`
    font-size: 0.85rem;
    color: #888;
`;

const ViewChip = styled(Chip)`
    margin-top: 16px !important;
    border-radius: 20px !important;
    background: #f0f4ff !important;
    color: #667eea !important;
    font-weight: 500 !important;
    
    .MuiChip-icon {
        color: #667eea;
    }
`;

const BreadcrumbsStyled = styled.div`
    margin-bottom: 24px;
`;

const BreadcrumbLink = styled.a`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #667eea !important;
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
        text-decoration: underline;
    }
`;

const BreadcrumbCurrent = styled.span`
    color: #1a1a2e !important;
    font-weight: 500;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
`;

const SearchField = styled(TextField)`
    min-width: 200px;
    
    & .MuiOutlinedInput-root {
        border-radius: 12px;
    }
`;

const PrintButton = styled(Button)`
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    background: #667eea !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4) !important;
    opacity: 1 !important;
    
    &:hover {
        background: #5a6fd6 !important;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5) !important;
        transform: translateY(-2px);
    }
    
    &:disabled {
        background: #b0b0b0 !important;
        box-shadow: none !important;
        opacity: 0.7 !important;
    }
`;

const SelectionPaper = styled(Paper)`
    padding: 16px;
    border-radius: 12px !important;
    margin-bottom: 24px;
    background: #fafafa;
`;

const SelectionContent = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
`;

const SelectButton = styled(Button)`
    border-radius: 8px !important;
`;

const SelectionChip = styled(Chip)`
    font-weight: 600 !important;
`;

const SelectionText = styled.span`
    color: #888;
    font-size: 0.9rem;
`;

const StudentCard = styled(Card)`
    cursor: pointer;
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
    border: 3px solid ${({ selected }) => selected ? '#667eea' : 'transparent'};
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        border-color: ${({ selected }) => selected ? '#764ba2' : '#667eea'};
    }
`;

const StudentHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
`;

const AvatarCircle = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${({ selected }) => selected 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : '#e0e0e0'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    transition: all 0.3s ease;
`;

const StudentInfo = styled.div`
    flex: 1;
`;

const StudentName = styled(Typography)`
    font-weight: 600;
    color: #1a1a2e;
`;

const StudentRoll = styled(Typography)`
    font-size: 0.85rem;
    color: #888;
`;

const CardPreview = styled.div`
    display: flex;
    justify-content: center;
    transform: scale(0.85);
    transform-origin: top center;
`;

export default GenerateIDCards;

