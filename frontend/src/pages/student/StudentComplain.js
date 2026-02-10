import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography, Paper, Container, Button, Avatar } from '@mui/material';
import Popup from '../../components/Popup';
import { BlueButton } from '../../components/buttonStyles';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
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

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");

    const dispatch = useDispatch()
    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser?._id
    const school = currentUser?.school?._id
    const address = "Complain"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Complaint submitted successfully!")
        }
        else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Network Error")
        }
    }, [status, error])

    return (
        <PageContainer>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Header */}
                <HeaderSection>
                    <HeaderIcon>📢</HeaderIcon>
                    <HeaderContent>
                        <HeaderTitle>Submit Complaint</HeaderTitle>
                        <HeaderSubtitle>Share your concerns with the administration</HeaderSubtitle>
                    </HeaderContent>
                </HeaderSection>

                {/* Form Card */}
                <FormCard>
                    <FormTitle>Complaint Form</FormTitle>
                    <FormSubtitle>Please fill in the details below to submit your complaint</FormSubtitle>
                    
                    <form onSubmit={submitHandler}>
                        <FormStack spacing={3}>
                            <FormField
                                fullWidth
                                label="Select Date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <FormField
                                fullWidth
                                label="Write your complaint"
                                variant="outlined"
                                value={complaint}
                                onChange={(event) => {
                                    setComplaint(event.target.value);
                                }}
                                required
                                multiline
                                rows={6}
                                placeholder="Please describe your complaint in detail..."
                            />
                            <SubmitButton
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Submit Complaint"}
                            </SubmitButton>
                        </FormStack>
                    </form>
                </FormCard>

                {/* Info Card */}
                <InfoCard>
                    <InfoTitle>📌 Guidelines for Filing Complaints</InfoTitle>
                    <InfoList>
                        <InfoItem>Provide accurate and complete information</InfoItem>
                        <InfoItem>Be specific about the details of your complaint</InfoItem>
                        <InfoItem>Include relevant dates and times if applicable</InfoItem>
                        <InfoItem>Maintain a respectful tone in your description</InfoItem>
                    </InfoList>
                </InfoCard>
            </Container>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageContainer>
    );
};

const PageContainer = styled.div`
    min-height: 100vh;
    background: #f0f2f5;
    padding: 24px 0;
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

const FormCard = styled(Paper)`
    padding: 32px;
    border-radius: 16px !important;
    background: white !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
    
    @media (max-width: 600px) {
        padding: 24px;
    }
`;

const FormTitle = styled(Typography)`
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #1a1a2e !important;
    margin-bottom: 8px !important;
`;

const FormSubtitle = styled(Typography)`
    font-size: 0.95rem !important;
    color: #888 !important;
    margin-bottom: 24px !important;
`;

const FormStack = styled(Stack)`
    margin-top: 16px;
`;

const FormField = styled(TextField)`
    & .MuiOutlinedInput-root {
        border-radius: 12px;
        
        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: #667eea;
        }
        
        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: #667eea;
            border-width: 2px;
        }
    }
`;

const SubmitButton = styled(BlueButton)`
    border-radius: 12px !important;
    font-size: 1rem !important;
    padding: 14px 24px !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
    
    &:hover {
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
    }
    
    &:disabled {
        background: #ccc !important;
        box-shadow: none !important;
    }
`;

const InfoCard = styled(Paper)`
    padding: 24px;
    border-radius: 16px !important;
    background: #e3f2fd !important;
    margin-top: 24px;
    animation: ${fadeIn} 0.5s ease-out 0.3s both;
`;

const InfoTitle = styled(Typography)`
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    color: #1976d2 !important;
    margin-bottom: 12px !important;
`;

const InfoList = styled.ul`
    margin: 0;
    padding-left: 20px;
`;

const InfoItem = styled.li`
    color: #666;
    margin-bottom: 8px;
    font-size: 0.9rem;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

export default StudentComplain;

