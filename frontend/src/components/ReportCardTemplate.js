import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Divider, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ReportCardTemplate = ({ reportCard, onClose, showButtons = true }) => {
    if (!reportCard) return null;

    const { student, school, academicInfo, summary, subjectResults, attendanceStats } = reportCard;

    // Grade color mapping
    const getGradeColor = (grade) => {
        const colors = {
            'A+': '#2e7d32',
            'A': '#1976d2',
            'B+': '#0288d1',
            'B': '#00796b',
            'C+': '#f57c00',
            'C': '#ffa000',
            'F': '#d32f2f'
        };
        return colors[grade] || '#757575';
    };

    const getGradeBgColor = (grade) => {
        const colors = {
            'A+': '#e8f5e9',
            'A': '#e3f2fd',
            'B+': '#e1f5fe',
            'B': '#e0f2f1',
            'C+': '#fff3e0',
            'C': '#fff8e1',
            'F': '#ffebee'
        };
        return colors[grade] || '#f5f5f5';
    };

    const isPass = (percentage) => parseFloat(percentage) >= 40;

    return (
        <Box className="report-card-container" sx={{ p: 3 }}>
            {/* Print Styles */}
            <style>{`
                @media print {
                    .report-card-container {
                        padding: 0 !important;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .report-card-paper {
                        box-shadow: none !important;
                        border: 1px solid #ddd;
                    }
                }
            `}</style>

            <Paper 
                className="report-card-paper"
                elevation={3}
                sx={{ 
                    maxWidth: 900, 
                    mx: 'auto', 
                    overflow: 'hidden',
                    borderRadius: 2
                }}
            >
                {/* School Header */}
                <Box sx={{ 
                    bgcolor: '#1a237e', 
                    color: 'white', 
                    p: 3,
                    textAlign: 'center'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                        {school?.name || 'SCHOOL NAME'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Academic Performance Report Card
                    </Typography>
                </Box>

                {/* Student Information */}
                <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: '#667eea' }}>
                            <PersonIcon sx={{ fontSize: 50 }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                                {student?.name || 'Student Name'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Roll No:</strong> {student?.rollNum || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Class:</strong> {student?.class || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Academic Year:</strong> {academicInfo?.year || new Date().getFullYear()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Exam:</strong> {academicInfo?.examType || 'All Exams'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider />

                {/* Summary Statistics */}
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                        Academic Summary
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <Chip 
                            label={`Total Exams: ${summary?.totalExams || 0}`}
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }}
                        />
                        <Chip 
                            label={`Total Subjects: ${summary?.totalSubjects || 0}`}
                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}
                        />
                        <Chip 
                            label={`Total Marks: ${summary?.totalMarks?.obtained || 0}/${summary?.totalMarks?.max || 0}`}
                            sx={{ bgcolor: '#fff3e0', color: '#f57c00', fontWeight: 'bold' }}
                        />
                        <Chip 
                            label={`Percentage: ${summary?.overallPercentage || 0}%`}
                            sx={{ 
                                bgcolor: getGradeBgColor(summary?.overallGrade),
                                color: getGradeColor(summary?.overallGrade),
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}
                        />
                        <Chip 
                            icon={isPass(summary?.overallPercentage) ? <CheckCircleIcon /> : <CancelIcon />}
                            label={`Grade: ${summary?.overallGrade || 'N/A'} (${isPass(summary?.overallPercentage) ? 'PASS' : 'FAIL'})`}
                            sx={{ 
                                bgcolor: isPass(summary?.overallPercentage) ? '#e8f5e9' : '#ffebee',
                                color: isPass(summary?.overallPercentage) ? '#2e7d32' : '#d32f2f',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                            }}
                        />
                    </Box>

                    {/* Attendance */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
                            Attendance Record
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip 
                                label={`Total Days: ${attendanceStats?.totalDays || 0}`}
                                variant="outlined"
                            />
                            <Chip 
                                label={`Present: ${attendanceStats?.presentDays || 0}`}
                                color="success"
                                variant="outlined"
                            />
                            <Chip 
                                label={`Attendance: ${attendanceStats?.attendancePercentage || 0}%`}
                                sx={{ 
                                    bgcolor: parseFloat(attendanceStats?.attendancePercentage) >= 75 ? '#e8f5e9' : '#fff3e0',
                                    color: parseFloat(attendanceStats?.attendancePercentage) >= 75 ? '#2e7d32' : '#f57c00',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Divider />

                {/* Subject-wise Results */}
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                        Subject-wise Performance
                    </Typography>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} border={1} borderColor="#e0e0e0">
                            <TableHead sx={{ bgcolor: '#1a237e' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Subject</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }} align="right">Total Marks</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }} align="right">Percentage</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }} align="center">Grade</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }} align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjectResults && subjectResults.length > 0 ? (
                                    subjectResults.map((subject, index) => {
                                        const subjectPass = parseFloat(subject.percentage) >= 40;
                                        return (
                                            <TableRow 
                                                key={index}
                                                sx={{ 
                                                    '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                                                    '&:hover': { bgcolor: '#f5f5f5' }
                                                }}
                                            >
                                                <TableCell sx={{ py: 2, fontWeight: 'bold' }}>
                                                    {subject.subject}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }} align="right">
                                                    {subject.totalObtained}/{subject.totalMax}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }} align="right">
                                                    {parseFloat(subject.percentage).toFixed(1)}%
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }} align="center">
                                                    <Chip 
                                                        label={subject.overallGrade || 'N/A'}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: getGradeBgColor(subject.overallGrade),
                                                            color: getGradeColor(subject.overallGrade),
                                                            fontWeight: 'bold',
                                                            minWidth: 40
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }} align="center">
                                                    <Chip 
                                                        label={subjectPass ? 'PASS' : 'FAIL'}
                                                        size="small"
                                                        color={subjectPass ? 'success' : 'error'}
                                                        sx={{ fontWeight: 'bold', minWidth: 60 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'textSecondary' }}>
                                            No subject results found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Divider />

                {/* Grade Distribution */}
                {summary?.gradeDistribution && Object.keys(summary.gradeDistribution).length > 0 && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                            Grade Distribution
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.entries(summary.gradeDistribution).map(([grade, count]) => (
                                <Chip
                                    key={grade}
                                    label={`${grade}: ${count}`}
                                    sx={{
                                        bgcolor: getGradeBgColor(grade),
                                        color: getGradeColor(grade),
                                        fontWeight: 'bold'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Divider />

                {/* Signature Section */}
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Box sx={{ textAlign: 'center', width: '30%' }}>
                            <Box sx={{ 
                                height: 60, 
                                borderBottom: '2px solid #1a237e', 
                                mb: 1,
                                mx: 'auto',
                                maxWidth: 200
                            }} />
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                Class Teacher
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Signature & Date
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', width: '30%' }}>
                            <Box sx={{ 
                                height: 60, 
                                borderBottom: '2px solid #1a237e', 
                                mb: 1,
                                mx: 'auto',
                                maxWidth: 200
                            }} />
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                Parent/Guardian
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Signature
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', width: '30%' }}>
                            <Box sx={{ 
                                height: 60, 
                                borderBottom: '2px solid #1a237e', 
                                mb: 1,
                                mx: 'auto',
                                maxWidth: 200
                            }} />
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                Principal
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Signature & Seal
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 2, 
                    textAlign: 'center',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <Typography variant="caption" color="textSecondary">
                        Report Card Generated on: {new Date(reportCard.generatedAt).toLocaleDateString()} | 
                        Status: {reportCard.status === 'generated' ? 'Final' : 'Draft'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default ReportCardTemplate;

