import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const password = "zxc"

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false)
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    let fields = {};
    if (user === "Admin") {
      if (visitor === "guest") fields = { email: "yogendra@12", password }
      else { navigate('/Adminlogin'); return; }
    }
    if (user === "Student") {
      if (visitor === "guest") fields = { rollNum: "1", studentName: "Dipesh Awasthi", password }
      else { navigate('/Studentlogin'); return; }
    }
    if (user === "Teacher") {
      if (visitor === "guest") fields = { email: "tony@12", password }
      else { navigate('/Teacherlogin'); return; }
    }
    setLoader(true);
    dispatch(loginUser(fields, user));
  }

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'error') {
      setLoader(false)
      setMessage("Network Error")
      setShowPopup(true)
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          <Grid item xs={12} sm={6} md={4} display="flex">
            <Card onClick={() => navigateHandler("Admin")}>
              <IconWrapper>
                <AccountCircle fontSize="large" />
              </IconWrapper>
              <CardTitle>Admin</CardTitle>
              <CardText>
                Login as an administrator to access the dashboard to manage app data.
              </CardText>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Card onClick={() => navigateHandler("Student")}>
              <IconWrapper>
                <School fontSize="large" />
              </IconWrapper>
              <CardTitle>Student</CardTitle>
              <CardText>
                Login as a student to explore course materials and assignments.
              </CardText>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} display="flex">
            <Card onClick={() => navigateHandler("Teacher")}>
              <IconWrapper>
                <Group fontSize="large" />
              </IconWrapper>
              <CardTitle>Teacher</CardTitle>
              <CardText>
                Login as a teacher to create courses, assignments, and track student progress.
              </CardText>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

/* ===== STYLED COMPONENTS ===== */

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledContainer = styled.div`
  min-height: 100vh;
  padding: 3rem 1rem;
  background: linear-gradient(270deg, #411d70, #19118b, #5f2a91, #2e1a6b);
  background-size: 800% 800%;
  animation: ${gradientMove} 20s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled(Paper)`
  padding: 30px 25px;
  text-align: center;
  cursor: pointer;
  border-radius: 20px;
  background: linear-gradient(135deg, #1f1f38, #2c2c6c);
  color: #fff;
  transition: all 0.4s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex: 1; /* make all cards equal height */

  &:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    background: linear-gradient(135deg, #2c2c6c, #411d70);
  }

  @media(max-width:600px){
    padding: 25px 20px;
  }
`;

const IconWrapper = styled(Box)`
  width: 60px;
  height: 60px;
  margin: 0 auto 15px auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7f56da, #9b6bff);
  color: #fff;
  font-size: 2.2rem;
  box-shadow: 0 5px 15px rgba(127,86,218,0.4);
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: #fff;
`;

const CardText = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: 0.95rem;
  line-height: 1.5;
`;
