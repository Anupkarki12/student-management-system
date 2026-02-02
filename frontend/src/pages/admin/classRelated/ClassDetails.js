import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList, getClassTeachers } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Container, Typography, Tab, IconButton, Paper, Card, CardContent, Grid
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import { BlueButton, GreenButton, PurpleButton } from "../../../components/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, sclassTeachers, loading, error, response, getresponse } = useSelector((state) => state.sclass);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
        dispatch(getClassTeachers(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        console.log(deleteID);
        console.log(address);
        setMessage("Sorry the delete function has been disabled for now.")
        setShowPopup(true)
        // dispatch(deleteUser(deleteID, address))
        //     .then(() => {
        //         dispatch(getClassStudents(classID));
        //         dispatch(resetSubjects())
        //         dispatch(getSubjectList(classID, "ClassSubjects"))
        //     })
    }

    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ]

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            code: subject.subCode,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")}>
                    <DeleteIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => {
                        navigate(`/Admin/class/subject/${classID}/${row.id}`)
                    }}
                >
                    View
                </BlueButton >
            </>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(classID, "SubjectsClass")
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <>
                {response ?
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <GreenButton
                            variant="contained"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Subjects
                        </GreenButton>
                    </Box>
                    :
                    <>
                        <Typography variant="h5" gutterBottom>
                            Subjects List:
                        </Typography>

                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        <SpeedDialTemplate actions={subjectActions} />
                    </>
                }
            </>
        )
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        return (
            <>
                <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                    <PersonRemoveIcon color="error" />
                </IconButton>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </BlueButton>
                <PurpleButton
                    variant="contained"
                    onClick={() =>
                        navigate("/Admin/students/student/attendance/" + row.id)
                    }
                >
                    Attendance
                </PurpleButton>
            </>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(classID, "StudentsClass")
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <>
                {getresponse ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            >
                                Add Students
                            </GreenButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Students List:
                        </Typography>

                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        <SpeedDialTemplate actions={studentActions} />
                    </>
                )}
            </>
        )
    }

    const ClassTeachersSection = () => {
        const teacherColumns = [
            { id: 'name', label: 'Teacher Name', minWidth: 170 },
            { id: 'email', label: 'Email', minWidth: 200 },
            { id: 'subject', label: 'Subject', minWidth: 150 },
        ]

        const teacherRows = sclassTeachers.map((teacher) => {
            return {
                name: teacher.teacherName,
                email: teacher.teacherEmail,
                subject: teacher.subjectName,
                id: teacher._id,
            };
        })

        const TeachersButtonHaver = ({ row }) => {
            return (
                <>
                    <BlueButton
                        variant="contained"
                        onClick={() => {
                            // Could navigate to teacher details if needed
                        }}
                    >
                        View
                    </BlueButton>
                </>
            );
        };

        const teacherActions = [
            {
                icon: <GroupIcon color="primary" />, name: 'Assign Teacher',
                action: () => navigate("/Admin/class/assignteacher/" + classID)
            },
        ];

        return (
            <>
                {getresponse ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton
                                variant="contained"
                                onClick={() => navigate("/Admin/class/assignteacher/" + classID)}
                            >
                                Assign Teacher
                            </GreenButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Teachers List:
                        </Typography>
                        {sclassTeachers && sclassTeachers.length > 0 ? (
                            <TableTemplate buttonHaver={TeachersButtonHaver} columns={teacherColumns} rows={teacherRows} />
                        ) : (
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                No teachers assigned to this class yet.
                            </Typography>
                        )}
                        <SpeedDialTemplate actions={teacherActions} />
                    </>
                )}
            </>
        )
    }

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList.length;
        const numberOfStudents = sclassStudents.length;
        const numberOfTeachers = sclassTeachers.length;

        return (
            <Box sx={{ mt: 2 }}>
                <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        <SchoolIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
                        Class {sclassDetails && sclassDetails.sclassName} Details
                    </Typography>
                </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                                <MenuBookIcon sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h5">Subjects</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{numberOfSubjects}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                                <PeopleIcon sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h5">Students</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{numberOfStudents}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
                                <PersonIcon sx={{ fontSize: 50, mb: 1 }} />
                                <Typography variant="h5">Teachers</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{numberOfTeachers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {getresponse &&
                        <GreenButton
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                            startIcon={<PersonAddAlt1Icon />}
                        >
                            Add Students
                        </GreenButton>
                    }
                    {response &&
                        <GreenButton
                            variant="contained"
                            size="large"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                            startIcon={<PostAddIcon />}
                        >
                            Add Subjects
                        </GreenButton>
                    }
                </Box>
            </Box>
        );
    }

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Typography variant="h4">Loading...</Typography>
                </Box>
            ) : (
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        {/* Sticky Tab Bar */}
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                position: 'sticky', 
                                top: 0, 
                                zIndex: 1000,
                                borderRadius: 0,
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <TabList 
                                onChange={handleChange} 
                                variant="fullWidth"
                                sx={{ 
                                    '& .MuiTab-root': {
                                        py: 2,
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        textTransform: 'none'
                                    },
                                    '& .Mui-selected': {
                                        fontWeight: 'bold'
                                    }
                                }}
                            >
                                <Tab icon={<SchoolIcon />} iconPosition="start" label="Details" value="1" />
                                <Tab icon={<MenuBookIcon />} iconPosition="start" label="Subjects" value="2" />
                                <Tab icon={<PeopleIcon />} iconPosition="start" label="Students" value="3" />
                                <Tab icon={<PersonIcon />} iconPosition="start" label="Teachers" value="4" />
                            </TabList>
                        </Paper>
                        
                        <Container sx={{ mt: 3, mb: 4, minHeight: '80vh' }}>
                            <TabPanel value="1">
                                <ClassDetailsSection />
                            </TabPanel>
                            <TabPanel value="2">
                                <ClassSubjectsSection />
                            </TabPanel>
                            <TabPanel value="3">
                                <ClassStudentsSection />
                            </TabPanel>
                            <TabPanel value="4">
                                <ClassTeachersSection />
                            </TabPanel>
                        </Container>
                    </TabContext>
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ClassDetails;