import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { Box, Button, Tab, Container } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Popup from '../../../components/Popup';
import CustomPieChart from '../../../components/CustomPieChart';

function ViewStudent() {
    const [value, setValue] = useState('1');
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();

    const studentID = params.id;
    const address = "Student";

    // Redux state
    const { userDetails, loading, error } = useSelector((state) => state.user);

    // Local states for student details
    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Fetch student details
    useEffect(() => {
        if (studentID) {
            dispatch(getUserDetails(studentID, address));
        }
    }, [dispatch, studentID]);

    useEffect(() => {
        if (userDetails) {
            setName(userDetails.name || '');
            setRollNum(userDetails.rollNum || '');
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>Error fetching student details.</div>
            ) : (
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange}>
                                <Tab label="Details" value="1" />
                                <Tab label="Attendance" value="2" />
                                <Tab label="Marks" value="3" />
                            </TabList>
                        </Box>
                        <Container sx={{ marginTop: "2rem" }}>
                            <TabPanel value="1">
                                <h3>Student Details:</h3>
                                <p><strong>Name:</strong> {name}</p>
                                <p><strong>Roll Number:</strong> {rollNum}</p>
                                <p><strong>Class:</strong> {sclassName.sclassName || 'N/A'}</p>
                                <p><strong>School:</strong> {studentSchool.schoolName || 'N/A'}</p>

                                {subjectAttendance.length > 0 && (
                                    <CustomPieChart data={[
                                        { name: 'Present', value: 80 },
                                        { name: 'Absent', value: 20 },
                                    ]} />
                                )}

                                <Button
                                    variant="contained"
                                    sx={{ margin: "20px", backgroundColor: "#02250b" }}
                                    onClick={() => navigate(-1)}
                                >
                                    Go Back
                                </Button>
                            </TabPanel>
                            <TabPanel value="2">
                                <h3>Attendance Section</h3>
                                <p>Attendance data will go here.</p>
                            </TabPanel>
                            <TabPanel value="3">
                                <h3>Marks Section</h3>
                                <p>Marks data will go here.</p>
                            </TabPanel>
                        </Container>
                    </TabContext>
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
}

export { ViewStudent };
