import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, TextField, Button, Paper, Typography, Box } from '@mui/material';
import Popup from '../../../components/Popup';
import NepaliDatePicker from '../../../components/NepaliDatePicker';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const adminID = currentUser._id

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = { title, details, date, adminID };
  const address = "Notice"

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices');
      dispatch(underControl())
    } else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Add Notice
        </Typography>
        <form onSubmit={submitHandler}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            required
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />

          <NepaliDatePicker
            label="Date"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loader}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Add Notice'
            )}
          </Button>
        </form>
      </Paper>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Box>
  );
};

export default AddNotice;