import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button, Grid, Box, Typography, Paper, TextField,
    CssBaseline, IconButton, InputAdornment, CircularProgress, Alert
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import bgpic from "../assets/designlogin.jpg";
import { LightPurpleButton } from '../components/buttonStyles';
import styled from 'styled-components';
import axios from 'axios';
import Popup from '../components/Popup';
import PasswordStrength from '../components/PasswordStrength';

const defaultTheme = createTheme();

const ForgotPassword = ({ role }) => {
    const navigate = useNavigate();

    // State for Admin/Teacher
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);

    // State for Student
    const [rollNum, setRollNum] = useState("");
    const [studentName, setStudentName] = useState("");
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    // Password fields
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);

    // UI states
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const getEndpoint = (action) => {
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
        // Backend routes are: /AdminForgotPassword, /StudentForgotPassword, /TeacherForgotPassword
        return `${baseUrl}/${role}${action}`;
    };

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return errors;
    };

    const handleResetPassword = async () => {
        setPasswordErrors([]);
        let isValid = true;

        // Validate identity fields based on role
        if (role === "Student") {
            if (!rollNum) {
                setRollNumberError(true);
                isValid = false;
            }
            if (!studentName) {
                setStudentNameError(true);
                isValid = false;
            }
        } else {
            if (!email) {
                setEmailError(true);
                isValid = false;
            }
        }

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            setShowPopup(true);
            return;
        }

        // Validate password strength
        const errors = validatePassword(newPassword);
        if (errors.length > 0) {
            setPasswordErrors(errors);
            setMessage("Password does not meet requirements");
            setShowPopup(true);
            return;
        }

        if (!isValid) return;

        setLoader(true);

        try {
            let fields;
            if (role === "Student") {
                fields = { rollNum, name: studentName, newPassword, role };
            } else {
                fields = { email, newPassword, role };
            }

            const result = await axios.post(getEndpoint('ForgotPassword'), fields, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (result.data.message) {
                setMessage(result.data.message);
                setShowPopup(true);
                if (result.data.message.includes('successfully')) {
                    setTimeout(() => {
                        navigate(`/${role}login`);
                    }, 2000);
                }
            }
        } catch (error) {
            setMessage(error.response?.data?.message || "Network Error");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
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
            setPasswordErrors([]);
        }
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
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
                        
                        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                            Enter your details and new password to reset your password.
                        </Typography>

                        <Box component="form" noValidate sx={{ mt: 2, width: '100%' }}>
                            {/* Identity Fields */}
                            {role === "Student" ? (
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
                                    value={email}
                                    error={emailError}
                                    helperText={emailError && 'Email is required'}
                                    onChange={handleInputChange}
                                />
                            )}

                            {/* Password Fields */}
                            {passwordErrors.length > 0 && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {passwordErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="newPassword"
                                label="New Password"
                                name="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
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
                            
                            <PasswordStrength password={newPassword} />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="confirmPassword"
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                error={confirmPassword !== "" && newPassword !== "" && newPassword !== confirmPassword}
                                helperText={confirmPassword !== "" && newPassword !== "" && newPassword !== confirmPassword ? "Passwords do not match" : ""}
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

                            <LightPurpleButton 
                                fullWidth 
                                variant="contained" 
                                sx={{ mt: 3 }}
                                onClick={handleResetPassword}
                                disabled={loader || !email && role !== "Student" || !rollNum && role === "Student" || !newPassword || !confirmPassword}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                            </LightPurpleButton>

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
                    sx={{ 
                        backgroundImage: `url(${bgpic})`, 
                        backgroundRepeat: 'no-repeat', 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    }}
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

