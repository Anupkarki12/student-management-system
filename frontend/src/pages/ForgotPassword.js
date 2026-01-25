import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button, Grid, Box, Typography, Paper, TextField,
    CssBaseline, IconButton, InputAdornment, CircularProgress
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../assets/designlogin.jpg";
import { LightPurpleButton } from '../components/buttonStyles';
import styled from 'styled-components';
import axios from 'axios';
import Popup from '../components/Popup';

const defaultTheme = createTheme();

const ForgotPassword = ({ role }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [studentName, setStudentName] = useState("");
    const [rollNum, setRollNum] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [step, setStep] = useState(1); // Step 1: Email/Verification, Step 2: New Password

    const [emailError, setEmailError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    const getForgotPasswordEndpoint = () => {
        switch (role) {
            case "Admin":
                return `${process.env.REACT_APP_BASE_URL}/AdminForgotPassword`;
            case "Student":
                return `${process.env.REACT_APP_BASE_URL}/StudentForgotPassword`;
            case "Teacher":
                return `${process.env.REACT_APP_BASE_URL}/TeacherForgotPassword`;
            default:
                return `${process.env.REACT_APP_BASE_URL}/AdminForgotPassword`;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (step === 1) {
            // Verification step
            if (role === "Student") {
                if (!rollNum || !studentName) {
                    if (!rollNum) setRollNumberError(true);
                    if (!studentName) setStudentNameError(true);
                    return;
                }
            } else {
                if (!email) {
                    setEmailError(true);
                    return;
                }
            }
            setStep(2);
        } else {
            // Password reset step
            if (!newPassword || !confirmPassword) {
                if (!newPassword) setNewPasswordError(true);
                if (!confirmPassword) setConfirmPasswordError(true);
                return;
            }

            if (newPassword !== confirmPassword) {
                setMessage("Passwords do not match");
                setShowPopup(true);
                return;
            }

            setLoader(true);

            try {
                let fields;
                if (role === "Student") {
                    fields = {
                        rollNum: rollNum,
                        name: studentName,
                        newPassword: newPassword
                    };
                } else {
                    fields = {
                        email: email,
                        newPassword: newPassword
                    };
                }

                const result = await axios.post(getForgotPasswordEndpoint(), fields, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (result.data.message) {
                    setMessage(result.data.message);
                    setShowPopup(true);
                    if (result.data.message === "Password updated successfully") {
                        setTimeout(() => {
                            navigate(`/${role}login`);
                        }, 2000);
                    }
                }
            } catch (error) {
                setMessage("Network Error");
                setShowPopup(true);
            } finally {
                setLoader(false);
            }
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value);
            setEmailError(false);
        }
        if (name === 'studentName') {
            setStudentName(value);
            setStudentNameError(false);
        }
        if (name === 'rollNumber') {
            setRollNum(value);
            setRollNumberError(false);
        }
        if (name === 'newPassword') {
            setNewPassword(value);
            setNewPasswordError(false);
        }
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
            setConfirmPasswordError(false);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ mb: 2, color: "#2c2143" }}>
                            {role} - Reset Password
                        </Typography>
                        <Typography variant="body1">
                            {step === 1 ? "Enter your details to verify" : "Enter your new password"}
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            {step === 1 ? (
                                role === "Student" ? (
                                    <>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="rollNumber"
                                            label="Enter your Roll Number"
                                            name="rollNumber"
                                            autoComplete="off"
                                            type="number"
                                            autoFocus
                                            value={rollNum}
                                            error={rollNumberError}
                                            helperText={rollNumberError && 'Roll Number is required'}
                                            onChange={handleInputChange}
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="studentName"
                                            label="Enter your name"
                                            name="studentName"
                                            autoComplete="name"
                                            value={studentName}
                                            error={studentNameError}
                                            helperText={studentNameError && 'Name is required'}
                                            onChange={handleInputChange}
                                        />
                                    </>
                                ) : (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Enter your email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        value={email}
                                        error={emailError}
                                        helperText={emailError && 'Email is required'}
                                        onChange={handleInputChange}
                                    />
                                )
                            ) : (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="newPassword"
                                        label="New Password"
                                        name="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        error={newPasswordError}
                                        helperText={newPasswordError && 'New password is required'}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="confirmPassword"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        error={confirmPasswordError}
                                        helperText={confirmPasswordError && 'Confirm password is required'}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                        {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </>
                            )}

                            {step === 1 ? (
                                <LightPurpleButton type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                                    Next
                                </LightPurpleButton>
                            ) : (
                                <>
                                    <LightPurpleButton type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
                                        {loader ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                                    </LightPurpleButton>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleBack}
                                        sx={{ mt: 2, mb: 3, color: "#7f56da", borderColor: "#7f56da" }}
                                    >
                                        Back
                                    </Button>
                                </>
                            )}

                            <Grid container sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                <Grid>
                                    <StyledLink to={`/${role}login`}>Back to Login</StyledLink>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{ backgroundImage: `url(${bgpic})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </ThemeProvider>
    );
};

export default ForgotPassword;

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;

