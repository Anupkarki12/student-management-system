import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Person, Description, Feedback, Assignment, CalendarToday, Payment } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const ListItemLink = styled(ListItem)(({ theme }) => ({
    '&.active': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        '& .MuiListItemIcon-root': {
            color: '#7f56da',
        },
    },
}));

const ParentSideBar = () => {
    const menuItems = [
        { text: 'Home', icon: <Person />, path: '/Parent/dashboard' },
        { text: 'My Children', icon: <Person />, path: '/Parent/children' },
        { text: 'Attendance', icon: <CalendarToday />, path: '/Parent/attendance' },
        { text: 'Homework', icon: <Assignment />, path: '/Parent/homework' },
        { text: 'Fee Details', icon: <Payment />, path: '/Parent/fees' },
        { text: 'Notices', icon: <Description />, path: '/Parent/notices' },
        { text: 'Send Complain', icon: <Feedback />, path: '/Parent/complain' },
    ];

    return (
        <List component="nav">
            {menuItems.map((item, index) => (
                <ListItemLink
                    button
                    key={index}
                    component={NavLink}
                    to={item.path}
                    activeClassName="active"
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItemLink>
            ))}
        </List>
    );
};

export default ParentSideBar;

