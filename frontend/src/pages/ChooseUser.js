import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
} from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';

const ChooseUser = () => {
  const navigate = useNavigate()

  const navigateHandler = (user) => {
    if (user === "Admin") {
      navigate('/Adminlogin');
      return;
    }
    if (user === "Student") {
      navigate('/Studentlogin');
      return;
    }
    if (user === "Teacher") {
      navigate('/Teacherlogin');
      return;
    }
  }

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
