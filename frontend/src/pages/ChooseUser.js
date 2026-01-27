import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AccountTypeChooser from '../components/AccountTypeChooser';

const ChooseUser = () => {
  const navigate = useNavigate();

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
    if (user === "Parent") {
      navigate('/Parentlogin');
      return;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      py: 4
    }}>
      <AccountTypeChooser
        onSelect={navigateHandler}
        availableTypes={['Admin', 'Student', 'Teacher', 'Parent']}
        title="Choose Your Account Type"
        subtitle="Select the type of account you want to access"
        columns={4}
      />
    </Box>
  );
};

export default ChooseUser;
