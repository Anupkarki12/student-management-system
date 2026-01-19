import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import { LightPurpleButton } from '../components/buttonStyles';
import AryanSchool from "../assets/aryan.jpg"; // school image as background

const Homepage = () => {
    return (
        <StyledContainer>
            <StyledPaper>
                <StyledTitle>
                    Welcome to
                    <br />
                    Student Management
                    <br />
                    System
                </StyledTitle>

                <StyledText>
                    Manage students, classes, attendance, and academic records efficiently.
                    Track performance, assignments, and progress digitally in one platform.
                    Designed for students, teachers, and administrators.
                </StyledText>

                <StyledBox>
                    <StyledLink to="/choose">
                        <LightPurpleButton variant="contained" fullWidth>
                            Login
                        </LightPurpleButton>
                    </StyledLink>

                    <StyledLinkExternal
                        href="https://thearyanschool.edu.np/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GuestButton
                            variant="outlined"
                            fullWidth
                        >
                            Login as Guest
                        </GuestButton>
                    </StyledLinkExternal>

                    <StyledText>
                        Don&apos;t have an account?{' '}
                        <Link to="/Adminregister" style={{ color: "#550080", fontWeight: "500" }}>
                            Sign up
                        </Link>
                    </StyledText>
                </StyledBox>
            </StyledPaper>
        </StyledContainer>
    );
};

export default Homepage;

/* ===== STYLED COMPONENTS ===== */

const glowPulse = keyframes`
  0% { text-shadow: 0 0 5px #7f56da, 0 0 10px #9b6bff; }
  50% { text-shadow: 0 0 15px #9b6bff, 0 0 25px #7f56da; }
  100% { text-shadow: 0 0 5px #7f56da, 0 0 10px #9b6bff; }
`;

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  /* school image background */
  background-image: url(${AryanSchool});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;

  /* dark overlay to make text readable */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1;
  }
`;

const StyledPaper = styled.div`
  position: relative; /* above overlay */
  z-index: 2;
  padding: 50px 40px;
  background: rgba(255,255,255,0.95);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-5px);
  }

  @media(max-width: 450px){
    width: 90%;
    padding: 30px;
  }
`;

const StyledTitle = styled.h1`
  font-size: 2.8rem;
  color: #252525;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 25px;
  text-align: center;
  animation: ${glowPulse} 2s infinite;
`;

const StyledText = styled.p`
  margin-top: 15px;
  margin-bottom: 20px;
  letter-spacing: normal;
  line-height: 1.6;
  color: #555;
  text-align: center;
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 20px;
  width: 100%;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
`;

const StyledLinkExternal = styled.a`
  text-decoration: none;
  width: 100%;
`;

const GuestButton = styled(Button)`
  border-color: #7f56da !important;
  color: #7f56da !important;
  transition: all 0.3s !important;
  &:hover {
    background: rgba(127, 86, 218, 0.1) !important;
    box-shadow: 0 5px 15px rgba(127,86,218,0.2) !important;
  }
`;
