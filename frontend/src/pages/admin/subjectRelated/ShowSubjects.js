import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllSclasses, getSubjectList, getClassStudents } from '../../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Grid, Card, CardContent, CardActions,
    Typography, Button, Chip, Breadcrumbs, Link, CircularProgress
} from '@mui/material';
import styled, { keyframes } from 'styled-components';
import DeleteIcon from "@mui/icons-material/Delete";
import TableTemplate from '../../../components/TableTemplate';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import BookIcon from '@mui/icons-material/Book';
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

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { subjectsList, loading, error, response, sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [viewMode, setViewMode] = useState('classes'); // 'classes', 'subjects', 'details'
    const [selectedClass, setSelectedClass] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (viewMode === 'classes') {
            dispatch(getAllSclasses(currentUser._id, "Sclass"));
        }
    }, [currentUser._id, dispatch, viewMode]);

    if (error) {
        console.log(error);
    }

    const handleClassClick = (classData) => {
        setSelectedClass(classData);
        setViewMode('subjects');
        dispatch(getSubjectList(classData._id, "ClassSubjects"));
    };

    const handleBack = () => {
        if (viewMode === 'subjects') {
            setViewMode('classes');
            setSelectedClass(null);
        } else if (viewMode === 'details') {
            setViewMode('subjects');
        }
    };

    const handleSubjectClick = (subject, classId) => {
        navigate(`/Admin/subjects/subject/${classId}/${subject._id}`);
    };

    const deleteHandler = (deleteID, address) => {
        dispatch({ type: 'sclass/getFailed', payload: null });
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch({ type: 'sclass/getSubjectsSuccess', payload: [] });
                if (selectedClass) {
                    dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
                } else {
                    dispatch(getAllSclasses(currentUser._id, "Sclass"));
                }
            });
    };

    const deleteSubjectHandler = (deleteID, address) => {
        dispatch({ type: 'sclass/getFailed', payload: null });
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch({ type: 'sclass/getSubjectsSuccess', payload: [] });
                dispatch(getSubjectList(selectedClass._id, "ClassSubjects"));
            });
    };

    // Subject columns
    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: 170 },
        { id: 'subCode', label: 'Subject Code', minWidth: 100 },
        { id: 'sessions', label: 'Sessions', minWidth: 100 },
        { id: 'teacher', label: 'Teacher', minWidth: 170 },
    ];

    const subjectRows = subjectsList && subjectsList.map((subject) => ({
        subName: subject.subName,
        subCode: subject.subCode || 'N/A',
        sessions: subject.sessions,
        teacher: subject.teacher?.name || 'Not Assigned',
        id: subject._id,
    }));

    const SubjectsButtonHaver = ({ row }) => (
        <>
            <IconButton onClick={() => deleteSubjectHandler(row.id, "Subject")}>
                <DeleteIcon color="error" />
            </IconButton>
            <BlueButton variant="contained" onClick={() => handleSubjectClick(row, selectedClass._id)}>
                View
            </BlueButton>
        </>
    );

    const actions = [
        {
            icon: <PostAddIcon color="primary" />,
            name: 'Add New Subject',
            action: () => navigate(`/Admin/addsubject/${selectedClass._id}`)
        },
        {
            icon: <DeleteIcon color="error" />,
            name: 'Delete All Subjects',
            action: () => deleteHandler(selectedClass._id, "SubjectsClass")
        }
    ];

    // Render classes as cards
    const renderClassesView = () => (
        <ViewContainer>
            <HeaderSection>
                <HeaderLeft>
                    <HeaderTitle>📚 Select a Class to View Subjects</HeaderTitle>
                    <HeaderSubtitle>Choose a class to manage its subjects</HeaderSubtitle>
                </HeaderLeft>
                <AddButton variant="contained" onClick={() => navigate("/Admin/subjects/chooseclass")}>
                    <AddCircleIcon sx={{ mr: 1 }} />
                    Add Subjects
                </AddButton>
            </HeaderSection>

            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                    <LoadingText>Loading classes...</LoadingText>
                </LoadingContainer>
            ) : response ? (
                <EmptyStateContainer>
                    <EmptyStateIcon>📋</EmptyStateIcon>
                    <EmptyStateTitle>No Classes Found</EmptyStateTitle>
                    <EmptyStateText>Get started by adding your first class</EmptyStateText>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/Admin/addclass")}>
                        Add Class
                    </GreenButton>
                </EmptyStateContainer>
            ) : (
                <Grid container spacing={3}>
                    {Array.isArray(sclassesList) && sclassesList.map((cls) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={cls._id}>
                            <ClassCard onClick={() => handleClassClick(cls)}>
                                <CardIconWrapper>
                                    <BookIcon sx={{ fontSize: 40 }} />
                                </CardIconWrapper>
                                <CardTitle>Class {cls.sclassName}</CardTitle>
                                <CardSubtitle>View all subjects</CardSubtitle>
                                <ViewChip label="View Subjects" icon={<ArrowForwardIcon />} />
                                <ArrowHint>→</ArrowHint>
                            </ClassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </ViewContainer>
    );

    // Render subjects for selected class
    const renderSubjectsView = () => (
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
                <BreadcrumbCurrent>Subjects</BreadcrumbCurrent>
            </BreadcrumbsStyled>

            <HeaderSection>
                <HeaderLeft>
                    <HeaderTitle>📖 Subjects - Class {selectedClass?.sclassName}</HeaderTitle>
                    <HeaderSubtitle>Manage subjects for this class</HeaderSubtitle>
                </HeaderLeft>
                <AddButton variant="contained" onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}>
                    <AddCircleIcon sx={{ mr: 1 }} />
                    Add Subject
                </AddButton>
            </HeaderSection>

            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                    <LoadingText>Loading subjects...</LoadingText>
                </LoadingContainer>
            ) : response ? (
                <EmptyStateContainer>
                    <EmptyStateIcon>📖</EmptyStateIcon>
                    <EmptyStateTitle>No Subjects Found</EmptyStateTitle>
                    <EmptyStateText>Add subjects to this class to get started</EmptyStateText>
                    <GreenButton variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/Admin/addsubject/${selectedClass._id}`)}>
                        Add Subject
                    </GreenButton>
                </EmptyStateContainer>
            ) : (
                <TablePaper>
                    {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                    )}
                    <SpeedDialTemplate actions={actions} />
                </TablePaper>
            )}
        </ViewContainer>
    );

    return (
        <PageContainer>
            <MainContainer maxWidth="xl">
                {viewMode === 'classes' && renderClassesView()}
                {viewMode === 'subjects' && renderSubjectsView()}
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
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

const BreadcrumbsStyled = styled(Breadcrumbs)`
    margin-bottom: 24px;
`;

const BreadcrumbLink = styled(Link)`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #667eea !important;
    font-weight: 500;
    
    &:hover {
        text-decoration: underline;
    }
`;

const BreadcrumbCurrent = styled(Typography)`
    color: #1a1a2e !important;
    font-weight: 500;
`;

const TablePaper = styled(Paper)`
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
`;

export default ShowSubjects;

