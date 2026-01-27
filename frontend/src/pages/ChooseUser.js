import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <AccountTypeChooser
      onSelect={navigateHandler}
      availableTypes={['Admin', 'Student', 'Teacher', 'Parent']}
      title="Welcome Back"
      subtitle="Choose your account type to continue"
      columns={4}
      schoolName="Student Management System"
    />
  );
};

export default ChooseUser;

