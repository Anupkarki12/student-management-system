import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Avatar } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import HomeworkIcon from '@mui/icons-material/HomeWork';
import QuizIcon from '@mui/icons-material/Quiz';
import NotesIcon from '@mui/icons-material/Notes';
import AssessmentIcon from '@mui/icons-material/Assessment';
import styled, { keyframes } from 'styled-components';

const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const StudentSideBar = () => {
    const location = useLocation();
    
    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/" || location.pathname === "/Student/dashboard";
        }
        return location.pathname.startsWith(path);
    };

    const getIcon = (path, Icon) => {
        const active = isActive(path);
        const colors = {
            home: '#64b5f6',
            subjects: '#81c784',
            notes: '#ffb74d',
            attendance: '#ba68c8',
            homework: '#ff8a65',
            examRoutine: '#4dd0e1',
            fee: '#f06292',
            complain: '#7986cb',
            results: '#4db6ac',
            profile: '#9575cd',
            logout: '#e57373'
        };
        
        const color = colors[path] || '#666';
        
        return (
            <IconWrapper $active={active} $color={color}>
                <Icon sx={{ fontSize: 22 }} />
            </IconWrapper>
        );
    };

    return (
        <>
            <SidebarContainer>
                <SidebarHeader>
                    <HeaderAvatar>
                        🎓
                    </HeaderAvatar>
                    <HeaderTitle>Student Portal</HeaderTitle>
                </SidebarHeader>
                
                <NavSection>
                    <NavItem 
                        component={Link} 
                        to="/"
                        $active={isActive("/")}
                    >
                        {getIcon('home', HomeIcon)}
                        <NavText primary="Home" $active={isActive("/")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/subjects"
                        $active={isActive("/Student/subjects")}
                    >
                        {getIcon('subjects', ClassOutlinedIcon)}
                        <NavText primary="Subjects" $active={isActive("/Student/subjects")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/notes"
                        $active={isActive("/Student/notes")}
                    >
                        {getIcon('notes', NotesIcon)}
                        <NavText primary="Notes" $active={isActive("/Student/notes")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/attendance"
                        $active={isActive("/Student/attendance")}
                    >
                        {getIcon('attendance', AssignmentIcon)}
                        <NavText primary="Attendance" $active={isActive("/Student/attendance")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/homework"
                        $active={isActive("/Student/homework")}
                    >
                        {getIcon('homework', HomeworkIcon)}
                        <NavText primary="Homework" $active={isActive("/Student/homework")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/exam-routine"
                        $active={isActive("/Student/exam-routine")}
                    >
                        {getIcon('examRoutine', QuizIcon)}
                        <NavText primary="Exam Routine" $active={isActive("/Student/exam-routine")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/fee"
                        $active={isActive("/Student/fee")}
                    >
                        {getIcon('fee', PaymentIcon)}
                        <NavText primary="My Fee" $active={isActive("/Student/fee")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/complain"
                        $active={isActive("/Student/complain")}
                    >
                        {getIcon('complain', AnnouncementOutlinedIcon)}
                        <NavText primary="Complain" $active={isActive("/Student/complain")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/Student/results"
                        $active={isActive("/Student/results")}
                    >
                        {getIcon('results', AssessmentIcon)}
                        <NavText primary="Results" $active={isActive("/Student/results")} />
                    </NavItem>
                </NavSection>
                
                <Divider sx={{ my: 1 }} />
                
                <UserSection>
                    <ListSubheader component="div" inset sx={styles.subheader}>
                        User
                    </ListSubheader>
                    <NavItem 
                        component={Link} 
                        to="/Student/profile"
                        $active={isActive("/Student/profile")}
                    >
                        {getIcon('profile', AccountCircleOutlinedIcon)}
                        <NavText primary="Profile" $active={isActive("/Student/profile")} />
                    </NavItem>
                    <NavItem 
                        component={Link} 
                        to="/logout"
                        $active={isActive("/logout")}
                    >
                        {getIcon('logout', ExitToAppIcon)}
                        <NavText primary="Logout" $active={isActive("/logout")} />
                    </NavItem>
                </UserSection>
            </SidebarContainer>
        </>
    )
}

const styles = {
    subheader: {
        color: '#888',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    }
}

export default StudentSideBar

// Styled Components
const SidebarContainer = styled.div`
    padding: 8px 0;
`;

const SidebarHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    margin-bottom: 8px;
`;

const HeaderAvatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 8px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
`;

const HeaderTitle = styled.span`
    font-size: 0.9rem;
    font-weight: 600;
    color: #1a1a2e;
`;

const NavSection = styled.div`
    padding: 0 8px;
`;

const NavItem = styled(ListItemButton)`
    border-radius: 12px !important;
    margin-bottom: 4px;
    padding: 10px 12px !important;
    transition: all 0.3s ease !important;
    background: ${({ $active }) => $active ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 'transparent'} !important;
    
    &:hover {
        background: ${({ $active }) => $active 
            ? 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)'
            : '#f5f5f5'} !important;
        transform: ${({ $active }) => $active ? 'none' : 'translateX(4px)'};
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: ${({ $active }) => $active ? '30px' : '0'};
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 0 4px 4px 0;
        transition: all 0.3s ease;
    }
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${({ $active, $color }) => $active 
        ? `linear-gradient(135deg, ${$color}40 0%, ${$color}20 100%)`
        : '#f5f5f5'};
    color: ${({ $active, $color }) => $active ? $color : '#888'};
    margin-right: 12px;
    transition: all 0.3s ease;
    animation: ${({ $active }) => $active ? float : 'none'} 3s ease-in-out infinite;
    
    ${NavItem}:hover & {
        background: ${({ $color }) => `linear-gradient(135deg, ${$color}40 0%, ${$color}20 100%)`};
        color: ${({ $color }) => $color};
    }
`;

const NavText = styled(ListItemText)`
    .MuiTypography-root {
        font-size: 0.9rem;
        font-weight: ${({ $active }) => $active ? '600' : '500'};
        color: ${({ $active }) => $active ? '#1a1a2e' : '#666'};
    }
`;

const UserSection = styled.div`
    padding: 0 8px;
`;

