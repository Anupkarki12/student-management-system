import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import SeeNotice from "../../components/SeeNotice";
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import styled from "styled-components";
import CountUp from "react-countup";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";
import { getAllStudents } from "../../redux/studentRelated/studentHandle";
import { getAllTeachers } from "../../redux/teacherRelated/teacherHandle";
import { getSalarySummary } from "../../redux/salaryRelated/salaryHandle";

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { salaryRecords } = useSelector((state) => state.salary);

    const { currentUser } = useSelector((state) => state.user);

    const adminID = currentUser._id;

    useEffect(() => {
        if (adminID) {
            dispatch(getAllStudents(adminID));
            dispatch(getAllSclasses(adminID, "Sclass"));
            dispatch(getAllTeachers(adminID));
            dispatch(getSalarySummary(adminID));
        }
    }, [adminID, dispatch]);

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;

    // Calculate total salary records from salaryRecords
    const salaryData = salaryRecords || {};
    const totalSalaryRecords = 
        (salaryData.byEmployeeType?.teacher?.count || 0) +
        (salaryData.byEmployeeType?.staff?.count || 0) +
        (salaryData.byEmployeeType?.admin?.count || 0);

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Existing Cards */}
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Students} alt="Students" />
                            <Title>Total Students</Title>
                            <Data start={0} end={numberOfStudents} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Classes} alt="Classes" />
                            <Title>Total Classes</Title>
                            <Data start={0} end={numberOfClasses} duration={5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Teachers} alt="Teachers" />
                            <Title>Total Teachers</Title>
                            <Data start={0} end={numberOfTeachers} duration={2.5} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper $salary>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Salary Records
                                </Typography>
                                <Data start={0} end={totalSalaryRecords} duration={2} $salaryData />
                            </Box>
                            <Title $salary>Total Records</Title>
                        </StyledPaper>
                    </Grid>

                    {/* Notice Section */}
                    <Grid item xs={12} md={12} lg={12}>
                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                            <SeeNotice />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

const StyledPaper = styled(Paper)`
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 200px;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    
    ${({ $salary }) => $salary && `
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        border: 2px solid #4caf50;
    `}
`;

const Title = styled.p`
    font-size: 1.25rem;
    ${({ $salary }) => $salary && `
        margin: 0;
        color: #333;
    `}
`;

const Data = styled(CountUp)`
    font-size: calc(1.3rem + 0.6vw);
    ${({ $salaryData }) => $salaryData && `
        color: #2e7d32;
        font-size: calc(1.5rem + 0.8vw);
    `}
`;

export default AdminHomePage;

