import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const TeacherComplain = () => {
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [complaint, setComplaint] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulating complaint submission (Replace with API call)
    console.log('Complaint Submitted:', { studentName, subject, complaint });
    
    setSuccess(true);

    // Clear input fields after submission
    setStudentName('');
    setSubject('');
    setComplaint('');

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', padding: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Teacher Complaint Form
      </Typography>

      {success && <Alert severity="success">Complaint submitted successfully!</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Student Name"
          variant="outlined"
          margin="normal"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
        />
        
        <TextField
          fullWidth
          label="Subject"
          variant="outlined"
          margin="normal"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Complaint Details"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        />

        <Button type="submit" variant="contained" sx={{ mt: 2, backgroundColor: '#02250b' }} fullWidth>
          Submit Complaint
        </Button>
      </form>
    </Box>
  );
};

export default TeacherComplain;
