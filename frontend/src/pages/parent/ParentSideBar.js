import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import {
  Home,
  Person,
  Description,
  Feedback,
  Assignment,
  CalendarToday,
  Payment,
} from '@mui/icons-material';

import { Link, useLocation } from 'react-router-dom';

const ParentSideBar = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/Parent/dashboard' },
    { text: 'My Children', icon: <Person />, path: '/Parent/children' },
    { text: 'Attendance', icon: <CalendarToday />, path: '/Parent/attendance' },
    { text: 'Homework', icon: <Assignment />, path: '/Parent/homework' },
    { text: 'Fee Details', icon: <Payment />, path: '/Parent/fees' },
    { text: 'Notices', icon: <Description />, path: '/Parent/notices' },
    { text: 'Send Complain', icon: <Feedback />, path: '/Parent/complain' },
  ];

  const isItemActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + '/');

  return (
    <List component="nav">
      {menuItems.map((item) => {
        const active = isItemActive(item.path);

        return (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}     // ✅ Link, NOT NavLink
              to={item.path}
              sx={{
                backgroundColor: active
                  ? 'rgba(127, 86, 218, 0.12)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(127, 86, 218, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? '#7f56da' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ParentSideBar;
