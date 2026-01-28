import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Paper, Typography, Button, Box, Alert } from '@mui/material';
import TableViewTemplate from './TableViewTemplate';
import { formatNepaliDate } from '../utils/nepaliDate';
import RefreshIcon from '@mui/icons-material/Refresh';

const SeeNotice = () => {
  const dispatch = useDispatch();
  const [refreshKey, setRefreshKey] = useState(0);

  const { currentUser, currentRole } = useSelector((state) => state.user);
  const { userDetails: parentUserDetails } = useSelector((state) => state.parent);
  const { noticesList = [], loading, error, response } = useSelector((state) => state.notice);

  // ✅ Resolve schoolId safely
  const schoolId = useMemo(() => {
    console.log('🔍 Resolving schoolId:', { currentUser, currentRole, parentUserDetails });
    
    if (currentRole === 'Admin' && currentUser?._id) {
      console.log('✅ Using Admin ID as schoolId:', currentUser._id);
      return currentUser._id;
    }

    if (currentUser?.school) {
      const id = typeof currentUser.school === 'object'
        ? currentUser.school._id
        : currentUser.school;
      console.log('✅ Using currentUser.school as schoolId:', id);
      return id;
    }

    if (parentUserDetails?.school) {
      const id = typeof parentUserDetails.school === 'object'
        ? parentUserDetails.school._id
        : parentUserDetails.school;
      console.log('✅ Using parentUserDetails.school as schoolId:', id);
      return id;
    }

    if (parentUserDetails?.parent?.school) {
      const id = typeof parentUserDetails.parent.school === 'object'
        ? parentUserDetails.parent.school._id
        : parentUserDetails.parent.school;
      console.log('✅ Using parentUserDetails.parent.school as schoolId:', id);
      return id;
    }

    console.log('❌ No schoolId found');
    return null;
  }, [currentUser, currentRole, parentUserDetails]);

  // ✅ Fetch notices when schoolId exists or on refresh
  const fetchNotices = useCallback(() => {
    if (schoolId) {
      console.log('📢 Fetching notices for schoolId:', schoolId);
      dispatch(getAllNotices(schoolId, 'Notice'));
    }
  }, [dispatch, schoolId]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices, refreshKey]);

  // ✅ Manual refresh handler
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshKey(prev => prev + 1);
  };

  // ✅ Debug: Log notice data when received
  useEffect(() => {
    if (!loading && noticesList) {
      console.log('📋 Notices received:', noticesList.length, 'notices');
      console.log('Notices data:', noticesList);
    }
  }, [loading, noticesList]);

  // ✅ Error display - ensure response is a string before rendering
  const showError = error || (response && typeof response === 'string' && response !== 'No notices found');

  const noticeColumns = [
    { id: 'title', label: 'Title', minWidth: 170 },
    { id: 'details', label: 'Details', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 170 },
  ];

  const noticeRows = noticesList.map((notice) => {
    const date = new Date(notice.date);
    return {
      id: notice._id,
      title: notice.title,
      details: notice.details,
      date:
        date.toString() !== 'Invalid Date'
          ? formatNepaliDate(date, { format: 'full', showDayName: false })
          : 'Invalid Date',
    };
  });

  // 🔄 Loading
  if (loading) {
    return (
      <Box sx={{ marginTop: 2, marginRight: 2, textAlign: 'center', p: 2 }}>
        <Typography variant="h6">Loading notices...</Typography>
      </Box>
    );
  }

  // 📭 No notices - but only if there's no error
  if (!loading && noticesList.length === 0 && !showError) {
    return (
      <Box sx={{ marginTop: 2, marginRight: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            School Notices
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notices to show right now
          </Typography>
          <Button 
            variant="text" 
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Check Again
          </Button>
        </Paper>
      </Box>
    );
  }

  // ❌ Error state
  if (showError) {
    return (
      <Box sx={{ marginTop: 2, marginRight: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            School Notices
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : typeof response === 'string' ? response : 'Failed to load notices'}
        </Alert>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Unable to load notices
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  // 📢 Notices table
  return (
    <Box sx={{ marginTop: 2, marginRight: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          School Notices
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableViewTemplate columns={noticeColumns} rows={noticeRows} />
      </Paper>
    </Box>
  );
};

export default SeeNotice;

