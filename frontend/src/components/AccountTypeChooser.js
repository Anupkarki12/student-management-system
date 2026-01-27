import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Box,
    Typography,
    Fade,
    Zoom,
} from '@mui/material';
import {
    School,
    Group,
    Person,
    AdminPanelSettings,
    ArrowForward,
    CheckCircle,
} from '@mui/icons-material';
import styled, { keyframes, css } from 'styled-components';

// Animations
const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const gradientMove = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(60px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

// Stunning account type configurations
const accountTypesConfig = {
    Admin: {
        icon: AdminPanelSettings,
        title: 'Administrator',
        description: 'Complete control over the entire system',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        cardBg: '#ffffff',
        textColor: '#1e1b4b',
        textSecondary: '#4b5563',
    },
    Student: {
        icon: School,
        title: 'Student',
        description: 'Access your courses and academic resources',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        cardBg: '#ffffff',
        textColor: '#14532d',
        textSecondary: '#4b5563',
    },
    Teacher: {
        icon: Group,
        title: 'Teacher',
        description: 'Manage classes and track student progress',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        cardBg: '#ffffff',
        textColor: '#1e3a8a',
        textSecondary: '#4b5563',
    },
    Parent: {
        icon: Person,
        title: 'Parent',
        description: "Monitor your child's academic journey",
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        cardBg: '#ffffff',
        textColor: '#78350f',
        textSecondary: '#4b5563',
    },
};

// Background particles
const Particle = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: 50%;
    background: ${props => props.$color};
    animation: ${float} ${props => props.$duration}s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
    opacity: ${props => props.$opacity};
`;

// Main container with stunning gradient
const Container = styled(Box)`
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a2e);
    background-size: 400% 400%;
    animation: ${gradientMove} 15s ease infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
        pointer-events: none;
    }
`;

const ContentWrapper = styled(Box)`
    width: 100%;
    max-width: 1200px;
    position: relative;
    z-index: 1;
`;

// Stunning header
const HeaderSection = styled(Box)`
    text-align: center;
    margin-bottom: 60px;
`;

const LogoBadge = styled(Box)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 28px;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 32px;
`;

const LogoIcon = styled(Box)`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
`;

const LogoText = styled(Typography)`
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.5px;
`;

const MainTitle = styled(Typography)`
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    letter-spacing: -1px;
`;

const SubTitle = styled(Typography)`
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 450px;
    margin: 0 auto;
    line-height: 1.7;
`;

// Eye-catching card with solid white background
const AccountCard = styled(Paper)`
    padding: 36px 28px;
    text-align: center;
    cursor: pointer;
    border-radius: 24px;
    background: #ffffff;
    border: 2px solid #e5e7eb;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    animation: ${slideUp} 0.6s ease-out backwards;

    ${props => props.$delay && css`
        animation-delay: ${props.$delay};
    `}

    &:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        border-color: ${props => props.$color}50;
    }

    ${props => props.$isSelected && css`
        transform: translateY(-12px) scale(1.03);
        box-shadow: 0 20px 50px ${props.$glowColor}, 0 8px 32px rgba(0, 0, 0, 0.15);
        border: 2px solid ${props.$color};
    `}
`;

// Gradient top border
const CardAccent = styled(Box)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.$gradient};
`;

// Stunning icon wrapper
const IconWrapper = styled(Box)`
    width: 80px;
    height: 80px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$gradient};
    color: white;
    font-size: 2.5rem;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px ${props => props.$glowColor};
    transition: all 0.4s ease;

    &:hover {
        transform: scale(1.15) rotate(5deg);
        box-shadow: 0 12px 32px ${props => props.$glowColor};
    }

    ${props => props.$isSelected && css`
        transform: scale(1.2) rotate(5deg);
        box-shadow: 0 15px 40px ${props.$glowColor};
    `}
`;

const CardTitle = styled(Typography)`
    font-size: 1.35rem;
    font-weight: 700;
    color: ${props => props.$textColor || '#1a1a2e'};
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const CardText = styled(Typography)`
    color: ${props => props.$textColor || '#4b5563'};
    font-size: 0.9rem;
    line-height: 1.6;
    position: relative;
    z-index: 1;
`;

// Selection indicator
const SelectedBadge = styled(Box)`
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px ${props => props.$glowColor};
`;

const ArrowIndicator = styled(Box)`
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;

    &:hover {
        opacity: 1;
        transform: translateX(0);
    }
`;

const AccountTypeChooser = ({
    onSelect,
    selectedType = null,
    availableTypes = ['Admin', 'Student', 'Teacher', 'Parent'],
    title = "Welcome Back",
    subtitle = "Choose your account type to continue",
    columns = 4,
    sx = {},
    schoolName = "Student Management System",
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getGridColumns = () => {
        switch (columns) {
            case 2: return { xs: 12, sm: 6 };
            case 4: return { xs: 12, sm: 6, md: 3 };
            case 5: return { xs: 12, sm: 6, md: 2.4 };
            case 1: return { xs: 12 };
            default: return { xs: 12, sm: 6, md: 4 };
        }
    };

    const gridColumns = getGridColumns();

    // Generate background particles
    const particles = [
        { size: 8, left: 10, delay: 0, opacity: 0.4, color: 'rgba(139, 92, 246, 0.6)' },
        { size: 12, left: 20, delay: 1, opacity: 0.3, color: 'rgba(16, 185, 129, 0.6)' },
        { size: 6, left: 30, delay: 2, opacity: 0.5, color: 'rgba(59, 130, 246, 0.6)' },
        { size: 10, left: 40, delay: 0.5, opacity: 0.3, color: 'rgba(245, 158, 11, 0.6)' },
        { size: 14, left: 50, delay: 1.5, opacity: 0.4, color: 'rgba(139, 92, 246, 0.5)' },
        { size: 8, left: 60, delay: 2.5, opacity: 0.3, color: 'rgba(16, 185, 129, 0.6)' },
        { size: 10, left: 70, delay: 0.8, opacity: 0.5, color: 'rgba(59, 130, 246, 0.5)' },
        { size: 6, left: 80, delay: 1.8, opacity: 0.4, color: 'rgba(245, 158, 11, 0.6)' },
        { size: 12, left: 90, delay: 3, opacity: 0.3, color: 'rgba(139, 92, 246, 0.4)' },
        { size: 8, left: 15, delay: 2.2, opacity: 0.4, color: 'rgba(16, 185, 129, 0.5)' },
        { size: 10, left: 85, delay: 1.2, opacity: 0.3, color: 'rgba(59, 130, 246, 0.6)' },
        { size: 6, left: 75, delay: 0.3, opacity: 0.5, color: 'rgba(245, 158, 11, 0.5)' },
    ];

    return (
        <Container sx={sx}>
            {/* Background particles */}
            {particles.map((particle, index) => (
                <Particle
                    key={index}
                    $size={particle.size}
                    $left={particle.left}
                    $color={particle.color}
                    $opacity={particle.opacity}
                    $delay={particle.delay}
                    $duration={6 + Math.random() * 4}
                    style={{
                        top: `${Math.random() * 100}%`,
                    }}
                />
            ))}

            <ContentWrapper>
                {/* Header */}
                <HeaderSection>
                    <Fade in={mounted} timeout={800}>
                        <Box>
                            <Zoom in={mounted} timeout={600}>
                                <LogoBadge>
                                    <LogoIcon>
                                        <School sx={{ fontSize: 24 }} />
                                    </LogoIcon>
                                    <LogoText>{schoolName}</LogoText>
                                </LogoBadge>
                            </Zoom>
                            
                            <Fade in={mounted} timeout={1000}>
                                <Box>
                                    <MainTitle variant="h3">
                                        {title}
                                    </MainTitle>
                                    {subtitle && (
                                        <SubTitle variant="body1">
                                            {subtitle}
                                        </SubTitle>
                                    )}
                                </Box>
                            </Fade>
                        </Box>
                    </Fade>
                </HeaderSection>

                {/* Account Cards */}
                <Grid container spacing={3} justifyContent="center">
                    {availableTypes.map((type, index) => {
                        const config = accountTypesConfig[type];
                        if (!config) return null;

                        const isSelected = selectedType === type;
                        const IconComponent = config.icon;

                        return (
                            <Grid item {...gridColumns} key={type} display="flex">
                                <AccountCard
                                    onClick={() => onSelect && onSelect(type)}
                                    $gradient={config.gradient}
                                    $color={config.color}
                                    $glowColor={config.glowColor}
                                    $isSelected={isSelected}
                                    $delay={`${index * 0.12}s`}
                                >
                                    <CardAccent $gradient={config.gradient} />
                                    
                                    {isSelected && (
                                        <SelectedBadge $gradient={config.gradient} $glowColor={config.glowColor}>
                                            <CheckCircle sx={{ fontSize: 20, color: 'white' }} />
                                        </SelectedBadge>
                                    )}

                                    <IconWrapper
                                        $gradient={config.gradient}
                                        $glowColor={config.glowColor}
                                        $isSelected={isSelected}
                                    >
                                        <IconComponent sx={{ fontSize: 'inherit' }} />
                                    </IconWrapper>

                                    <CardTitle variant="h5" $textColor={config.textColor}>
                                        {config.title}
                                    </CardTitle>

                                    <CardText variant="body2" $textColor={config.textSecondary}>
                                        {config.description}
                                    </CardText>

                                    <ArrowIndicator $gradient={config.gradient}>
                                        <ArrowForward sx={{ fontSize: 20 }} />
                                    </ArrowIndicator>
                                </AccountCard>
                            </Grid>
                        );
                    })}
                </Grid>
            </ContentWrapper>
        </Container>
    );
};

// Export configurations
export { accountTypesConfig as ACCOUNT_TYPES };
export default AccountTypeChooser;

