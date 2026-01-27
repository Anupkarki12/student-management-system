import React from 'react';
import {
    Grid,
    Paper,
    Box,
    Typography,
} from '@mui/material';
import {
    AccountCircle,
    School,
    Group,
    People,
    Person,
} from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';

// Account type configurations
const ACCOUNT_TYPES = {
    Admin: {
        icon: AccountCircle,
        title: 'Admin',
        description: 'Login as an administrator to access the dashboard to manage app data.',
        color: '#7f56da',
        bgGradient: 'linear-gradient(135deg, #411d70, #19118b)',
    },
    Student: {
        icon: School,
        title: 'Student',
        description: 'Login as a student to explore course materials and assignments.',
        color: '#2e7d32',
        bgGradient: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
    },
    Teacher: {
        icon: Group,
        title: 'Teacher',
        description: 'Login as a teacher to create courses, assignments, and track student progress.',
        color: '#1565c0',
        bgGradient: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    },
    Account: {
        icon: People,
        title: 'Account',
        description: 'Login to access your account and manage your profile settings.',
        color: '#e65100',
        bgGradient: 'linear-gradient(135deg, #bf360c, #e65100)',
    },
    Parent: {
        icon: Person,
        title: 'Parent',
        description: 'Login as a parent/guardian to view your child\'s progress, attendance, and school updates.',
        color: '#c62828',
        bgGradient: 'linear-gradient(135deg, #b71c1c, #c62828)',
    },
};

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledCard = styled(Paper)`
  padding: 25px 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 16px;
  background: ${props => props.$bgGradient || 'linear-gradient(135deg, #1f1f38, #2c2c6c)'};
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    border-color: ${props => props.$color || '#7f56da'};
  }

  @media(max-width:600px){
    padding: 20px 15px;
  }
`;

const IconWrapper = styled(Box)`
  width: 55px;
  height: 55px;
  margin: 0 auto 12px auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `linear-gradient(135deg, ${props.$color}, ${props.$lightColor})`};
  color: #fff;
  font-size: 1.8rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const CardTitle = styled(Typography)`
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: #fff;
  font-weight: 600;
`;

const CardText = styled(Typography)`
  color: rgba(255,255,255,0.85);
  font-size: 0.85rem;
  line-height: 1.5;
`;

const AccountTypeChooser = ({
    onSelect,
    selectedType = null,
    availableTypes = ['Admin', 'Student', 'Teacher', 'Account', 'Parent'],
    title = "Choose Account Type",
    subtitle = "Select the type of account you want to access",
    columns = 3,
    sx = {}
}) => {
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

    return (
        <Box sx={{ width: '100%', ...sx }}>
            {/* Title Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {/* Account Cards */}
            <Grid container spacing={3} justifyContent="center">
                {availableTypes.map((type) => {
                    const config = ACCOUNT_TYPES[type];
                    if (!config) return null;

                    const isSelected = selectedType === type;
                    const IconComponent = config.icon;

                    return (
                        <Grid item {...gridColumns} key={type} display="flex">
                            <StyledCard
                                onClick={() => onSelect && onSelect(type)}
                                $color={config.color}
                                $bgGradient={config.bgGradient}
                                sx={{
                                    border: isSelected ? '2px solid' : '2px solid transparent',
                                    borderColor: isSelected ? config.color : 'transparent',
                                    bgcolor: isSelected ? `${config.color}15` : undefined,
                                    position: 'relative',
                                    '&::before': isSelected ? {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                        borderRadius: '16px 16px 0 0',
                                        bgcolor: config.color,
                                    } : {},
                                }}
                            >
                                <IconWrapper $color={config.color} $lightColor={config.color + '99'}>
                                    <IconComponent fontSize="large" />
                                </IconWrapper>
                                <CardTitle variant="h6">
                                    {config.title}
                                </CardTitle>
                                <CardText variant="body2">
                                    {config.description}
                                </CardText>
                            </StyledCard>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// Export individual configurations for custom usage
export { ACCOUNT_TYPES };
export default AccountTypeChooser;

