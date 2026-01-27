import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const PasswordStrength = ({ password }) => {
    const getStrength = () => {
        let strength = 0;
        let label = '';
        let color = '';

        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

        switch (strength) {
            case 0:
            case 1:
                label = 'Very Weak';
                color = '#f44336';
                break;
            case 2:
                label = 'Weak';
                color = '#ff9800';
                break;
            case 3:
                label = 'Medium';
                color = '#ffeb3b';
                break;
            case 4:
                label = 'Strong';
                color = '#4caf50';
                break;
            case 5:
                label = 'Very Strong';
                color = '#2e7d32';
                break;
            default:
                label = 'Very Weak';
                color = '#f44336';
        }

        return { strength, label, color };
    };

    const { strength, label, color } = getStrength();

    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
        { label: 'One number (0-9)', met: /[0-9]/.test(password) },
        { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    if (!password) {
        return null;
    }

    return (
        <Box sx={{ mt: 2, mb: 2 }} component="div">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} component="div">
                <LinearProgress
                    variant="determinate"
                    value={(strength / 5) * 100}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color,
                            borderRadius: 4,
                        }
                    }}
                />
                <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 2, minWidth: 80, fontWeight: 'bold', color: color, display: 'inline-block' }}
                >
                    {label}
                </Typography>
            </Box>

            <Box sx={{ mt: 1 }} component="div">
                {requirements.map((req, index) => (
                    <Typography
                        key={index}
                        variant="body2"
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: req.met ? '#4caf50' : '#999',
                            mb: 0.5,
                            mr: 1
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: req.met ? '#4caf50' : '#999',
                                mr: 1,
                                display: 'inline-block',
                                flexShrink: 0
                            }}
                            component="span"
                        />
                        {req.label}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
};

export default PasswordStrength;

