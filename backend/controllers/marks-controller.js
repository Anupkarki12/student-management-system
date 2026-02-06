const Marks = require('../models/marksSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Admin = require('../models/adminSchema.js');

// Report Card Generation Helper Functions

// Calculate grade from percentage
const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
};

// Get grade color for display
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

// Generate comprehensive report card data for a single student
const generateStudentReportCard = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { examType, year } = req.query;

        // Get student details
        const student = await Student.findById(studentId)
            .populate('sclassName', 'sclassName');
        
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Build query for marks
        let marksQuery = { student: studentId };
        
        if (examType && examType !== 'all') {
            marksQuery.examType = examType;
        }
        
        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            marksQuery.examDate = { $gte: startDate, $lte: endDate };
        }

        // Get marks
        const marks = await Marks.find(marksQuery)
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ examDate: -1 });

        // Get school details
        const school = await Admin.findById(student.school);
        const classDetails = await Sclass.findById(student.sclassName._id);

        // Calculate statistics
        const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
        const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
        const overallGrade = calculateGrade(overallPercentage);

        // Group marks by subject for subject-wise analysis
        const subjectStats = {};
        marks.forEach(mark => {
            const subName = mark.subject?.subName || 'Unknown';
            if (!subjectStats[subName]) {
                subjectStats[subName] = {
                    subject: subName,
                    exams: [],
                    totalObtained: 0,
                    totalMax: 0,
                    percentage: 0
                };
            }
            subjectStats[subName].exams.push({
                examType: mark.examType,
                examDate: mark.examDate,
                marksObtained: mark.marksObtained,
                maxMarks: mark.maxMarks,
                grade: mark.grade
            });
            subjectStats[subName].totalObtained += mark.marksObtained;
            subjectStats[subName].totalMax += mark.maxMarks;
        });

        // Calculate subject-wise percentages
        Object.values(subjectStats).forEach(stat => {
            stat.percentage = stat.totalMax > 0 
                ? ((stat.totalObtained / stat.totalMax) * 100) 
                : 0;
            stat.overallGrade = calculateGrade(stat.percentage);
        });

        // Grade distribution
        const gradeDistribution = {};
        marks.forEach(mark => {
            const grade = mark.grade || 'N/A';
            gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        });

        // Exam type breakdown
        const examTypeBreakdown = {};
        marks.forEach(mark => {
            if (!examTypeBreakdown[mark.examType]) {
                examTypeBreakdown[mark.examType] = {
                    examType: mark.examType,
                    count: 0,
                    totalObtained: 0,
                    totalMax: 0
                };
            }
            examTypeBreakdown[mark.examType].count++;
            examTypeBreakdown[mark.examType].totalObtained += mark.marksObtained;
            examTypeBreakdown[mark.examType].totalMax += mark.maxMarks;
        });

        const reportCard = {
            student: {
                id: student._id,
                name: student.name,
                rollNum: student.rollNum,
                class: student.sclassName?.sclassName,
                classId: student.sclassName?._id,
                gender: student.gender,
                address: student.address,
                phone: student.phone
            },
            school: {
                name: school?.schoolName || 'School Name',
                email: school?.email || '',
                phone: school?.phone || ''
            },
            academicInfo: {
                year: year || new Date().getFullYear().toString(),
                examType: examType || 'All Exams'
            },
            summary: {
                totalExams: marks.length,
                totalSubjects: Object.keys(subjectStats).length,
                totalMarks: {
                    obtained: totalObtained,
                    max: totalMax
                },
                overallPercentage: overallPercentage.toFixed(2),
                overallGrade: overallGrade,
                gradeDistribution,
                examTypeBreakdown: Object.values(examTypeBreakdown)
            },
            subjectResults: Object.values(subjectStats),
            detailedMarks: marks,
            attendanceStats: {
                totalDays: student.totalDays || 0,
                presentDays: student.presentDays || 0,
                attendancePercentage: student.totalDays > 0 
                    ? ((student.presentDays / student.totalDays) * 100).toFixed(2) 
                    : 0
            },
            generatedAt: new Date(),
            status: 'generated'
        };

        res.send(reportCard);
    } catch (err) {
        console.error('Error generating report card:', err);
        res.status(500).json({ message: err.message });
    }
};

// Generate report cards for all students in a class
const generateClassReportCards = async (req, res) => {
    try {
        const { classId } = req.params;
        const { examType, year } = req.query;

        // Get class details
        const classDetails = await Sclass.findById(classId);
        if (!classDetails) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Get all students in the class
        const students = await Student.find({ sclassName: classId });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found in this class" });
        }

        // Get school details from first student
        const school = students.length > 0 ? await Admin.findById(students[0].school) : null;

        // Generate report card for each student
        const reportCards = [];
        
        for (const student of students) {
            // Build query for marks
            let marksQuery = { student: student._id };
            
            if (examType && examType !== 'all') {
                marksQuery.examType = examType;
            }
            
            if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);
                marksQuery.examDate = { $gte: startDate, $lte: endDate };
            }

            // Get marks for this student
            const marks = await Marks.find(marksQuery)
                .populate('subject', 'subName')
                .sort({ examDate: -1 });

            // Calculate statistics
            const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
            const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
            const grade = calculateGrade(percentage);
            const passed = percentage >= 40;

            // Group marks by subject
            const subjectResults = {};
            marks.forEach(mark => {
                const subName = mark.subject?.subName || 'Unknown';
                if (!subjectResults[subName]) {
                    subjectResults[subName] = {
                        subject: subName,
                        totalObtained: 0,
                        totalMax: 0,
                        exams: 0,
                        percentage: 0,
                        grade: 'N/A'
                    };
                }
                subjectResults[subName].totalObtained += mark.marksObtained;
                subjectResults[subName].totalMax += mark.maxMarks;
                subjectResults[subName].exams++;
            });

            // Calculate subject percentages
            Object.values(subjectResults).forEach(stat => {
                stat.percentage = stat.totalMax > 0 
                    ? ((stat.totalObtained / stat.totalMax) * 100) 
                    : 0;
                stat.grade = calculateGrade(stat.percentage);
            });

            reportCards.push({
                student: {
                    id: student._id,
                    name: student.name,
                    rollNum: student.rollNum
                },
                marks: {
                    count: marks.length,
                    totalObtained,
                    totalMax,
                    percentage: percentage.toFixed(2),
                    grade,
                    passed,
                    subjects: Object.values(subjectResults)
                },
                attendance: {
                    totalDays: student.totalDays || 0,
                    presentDays: student.presentDays || 0,
                    percentage: student.totalDays > 0 
                        ? ((student.presentDays / student.totalDays) * 100).toFixed(2) 
                        : 0
                },
                status: marks.length > 0 ? 'generated' : 'no-marks'
            });
        }

        // Class statistics
        const classStats = {
            totalStudents: students.length,
            studentsWithMarks: reportCards.filter(r => r.status === 'generated').length,
            averagePercentage: 0,
            passRate: 0,
            gradeDistribution: {}
        };

        // Calculate class averages
        const studentsWithMarks = reportCards.filter(r => r.status === 'generated');
        if (studentsWithMarks.length > 0) {
            classStats.averagePercentage = (
                studentsWithMarks.reduce((sum, r) => sum + parseFloat(r.marks.percentage), 0) / 
                studentsWithMarks.length
            ).toFixed(2);

            const passedStudents = studentsWithMarks.filter(r => r.marks.passed).length;
            classStats.passRate = ((passedStudents / studentsWithMarks.length) * 100).toFixed(2);

            // Grade distribution
            studentsWithMarks.forEach(r => {
                classStats.gradeDistribution[r.marks.grade] = 
                    (classStats.gradeDistribution[r.marks.grade] || 0) + 1;
            });
        }

        const result = {
            classInfo: {
                id: classDetails._id,
                name: classDetails.sclassName,
                students: classDetails.students?.length || students.length
            },
            school: {
                name: school?.schoolName || 'School Name'
            },
            filters: {
                year: year || 'All Years',
                examType: examType || 'All Exams'
            },
            generatedAt: new Date(),
            classStats,
            reportCards
        };

        res.send(result);
    } catch (err) {
        console.error('Error generating class report cards:', err);
        res.status(500).json({ message: err.message });
    }
};

// Archive results for future reference
const archiveResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { examType, year, description } = req.body;

        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Build query for marks
        let marksQuery = { student: studentId };
        
        if (examType) {
            marksQuery.examType = examType;
        }
        
        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            marksQuery.examDate = { $gte: startDate, $lte: endDate };
        }

        // Get all marks
        const marks = await Marks.find(marksQuery)
            .populate('subject', 'subName')
            .sort({ examDate: -1 });

        if (marks.length === 0) {
            return res.status(400).json({ message: "No marks found to archive" });
        }

        // Calculate statistics
        const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
        const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0;
        const grade = calculateGrade(percentage);

        // Create archive record
        const archiveRecord = {
            student: {
                id: student._id,
                name: student.name,
                rollNum: student.rollNum,
                class: student.sclassName
            },
            academicInfo: {
                year: year || new Date().getFullYear().toString(),
                examType: examType || 'All Exams'
            },
            marks: marks.map(m => ({
                subject: m.subject?.subName,
                examType: m.examType,
                examDate: m.examDate,
                marksObtained: m.marksObtained,
                maxMarks: m.maxMarks,
                grade: m.grade,
                percentage: m.maxMarks > 0 
                    ? ((m.marksObtained / m.maxMarks) * 100).toFixed(2) 
                    : 0
            })),
            summary: {
                totalExams: marks.length,
                totalMarks: { obtained: totalObtained, max: totalMax },
                overallPercentage: percentage.toFixed(2),
                overallGrade: grade
            },
            archivedBy: req.body.adminId || 'system',
            description: description || `Archived ${examType || 'all'} results for year ${year || 'current'}`,
            archivedAt: new Date()
        };

        // Add archive data to student document
        if (!student.archivedResults) {
            student.archivedResults = [];
        }
        student.archivedResults.push(archiveRecord);
        await student.save();

        // Also update marks with archive flag
        await Marks.updateMany(marksQuery, { 
            $set: { 
                archivedAt: new Date(),
                archiveDescription: description || `Archived ${examType || 'all'} results`
            }
        });

        res.send({
            message: "Results archived successfully",
            archiveRecord: {
                studentId: student._id,
                studentName: student.name,
                archivedAt: archiveRecord.archivedAt,
                totalExamsArchived: marks.length,
                overallPercentage: percentage.toFixed(2),
                overallGrade: grade
            }
        });
    } catch (err) {
        console.error('Error archiving results:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get archived results for a student
const getArchivedResults = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .select('name rollNum sclassName archivedResults');

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!student.archivedResults || student.archivedResults.length === 0) {
            return res.send({ 
                message: "No archived results found",
                archives: [] 
            });
        }

        res.send({
            student: {
                id: student._id,
                name: student.name,
                rollNum: student.rollNum,
                class: student.sclassName
            },
            archives: student.archivedResults.map(archive => ({
                id: archive._id,
                academicInfo: archive.academicInfo,
                summary: archive.summary,
                archivedAt: archive.archivedAt,
                description: archive.description
            }))
        });
    } catch (err) {
        console.error('Error fetching archived results:', err);
        res.status(500).json({ message: err.message });
    }
};

// Restore archived results
const restoreArchivedResults = async (req, res) => {
    try {
        const { studentId, archiveIndex } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!student.archivedResults || student.archivedResults.length === 0) {
            return res.status(404).json({ message: "No archived results found" });
        }

        const index = parseInt(archiveIndex);
        if (index < 0 || index >= student.archivedResults.length) {
            return res.status(404).json({ message: "Invalid archive index" });
        }

        const archive = student.archivedResults[index];

        // Remove archive flag from marks
        await Marks.updateMany(
            { student: studentId },
            { $unset: { archivedAt: "", archiveDescription: "" } }
        );

        // Remove from student's archived results
        student.archivedResults.splice(index, 1);
        await student.save();

        res.send({
            message: "Results restored successfully",
            restoredArchive: {
                studentName: student.name,
                academicInfo: archive.academicInfo,
                restoredAt: new Date()
            }
        });
    } catch (err) {
        console.error('Error restoring archived results:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all classes that a teacher teaches
const getTeacherClasses = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        console.log('=== getTeacherClasses called ===');
        console.log('Teacher ID:', teacherId);
        
        // First, get the teacher's details
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            console.log('Teacher not found');
            return res.status(404).json({ message: "Teacher not found" });
        }
        
        console.log('Teacher found:', teacher.name);
        console.log('Teacher teachSclass:', teacher.teachSclass);
        console.log('Teacher school:', teacher.school);
        
        const schoolId = teacher.school;
        const classMap = new Map();
        
        // 1. Get all classes from subjects taught by this teacher
        const subjects = await Subject.find({ 
            teacher: teacherId,
            school: schoolId
        }).populate('sclassName', 'sclassName school');
        
        console.log('Subjects found:', subjects.length);
        subjects.forEach(subject => {
            console.log('  Subject:', subject.subName, 'Class:', subject.sclassName);
        });
        
        subjects.forEach(subject => {
            if (subject.sclassName && subject.sclassName._id) {
                const classKey = subject.sclassName._id.toString();
                if (!classMap.has(classKey)) {
                    classMap.set(classKey, {
                        _id: subject.sclassName._id,
                        sclassName: subject.sclassName.sclassName
                    });
                }
            }
        });
        
        // 2. Get the teacher's main class (teachSclass)
        if (teacher.teachSclass) {
            console.log('Checking main class:', teacher.teachSclass);
            const mainClass = await Sclass.findById(teacher.teachSclass);
            if (mainClass) {
                console.log('Main class found:', mainClass.sclassName);
                const classKey = mainClass._id.toString();
                if (!classMap.has(classKey)) {
                    classMap.set(classKey, {
                        _id: mainClass._id,
                        sclassName: mainClass.sclassName
                    });
                }
            }
        }
        
        // 3. If no classes found yet, get all classes in the school
        if (classMap.size === 0) {
            console.log('No classes from subjects/main class, fetching all school classes');
            const allClasses = await Sclass.find({ school: schoolId }).select('sclassName');
            console.log('All school classes:', allClasses.length);
            allClasses.forEach(cls => {
                if (cls._id) {
                    const classKey = cls._id.toString();
                    if (!classMap.has(classKey)) {
                        classMap.set(classKey, {
                            _id: cls._id,
                            sclassName: cls.sclassName
                        });
                    }
                }
            });
        }
        
        const classes = Array.from(classMap.values());
        console.log('Total classes to return:', classes.length);
        console.log('Classes:', classes);
        
        if (classes.length === 0) {
            return res.send({ message: "No classes found for this teacher" });
        }
        
        res.send(classes);
    } catch (err) {
        console.error('Error fetching teacher classes:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all subjects taught by a teacher in a specific class
const getTeacherSubjectsByClass = async (req, res) => {
    try {
        const { teacherId, classId } = req.params;
        
        // Find subjects taught by this teacher in this class
        const subjects = await Subject.find({ 
            teacher: teacherId, 
            sclassName: classId 
        });
        
        if (subjects.length === 0) {
            const teacher = await Teacher.findOne({ 
                _id: teacherId, 
                teachSclass: classId 
            }).populate('teachSubject', 'subName sessions');
            
            if (teacher && teacher.teachSubject) {
                return res.send([teacher.teachSubject]);
            }
            
            return res.send({ message: "No subjects found for this class" });
        }
        
        res.send(subjects);
    } catch (err) {
        console.error('Error fetching teacher subjects:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all marks for a school (for admin)
const getAllMarksForSchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { sclassId, subjectId, examType, examDate } = req.query;
        
        let query = { school: schoolId };
        
        if (sclassId && sclassId !== 'all') {
            query.sclass = sclassId;
        }
        if (subjectId && subjectId !== 'all') {
            query.subject = subjectId;
        }
        if (examType && examType !== 'all') {
            query.examType = examType;
        }
        if (examDate) {
            const startDate = new Date(examDate);
            const endDate = new Date(examDate);
            endDate.setDate(endDate.getDate() + 1);
            query.examDate = { $gte: startDate, $lt: endDate };
        }
        
        const marks = await Marks.find(query)
            .populate('student', 'name rollNum')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .populate('sclass', 'sclassName')
            .sort({ createdAt: -1 });
        
        if (marks.length > 0) {
            res.send(marks);
        } else {
            res.send({ message: "No marks found" });
        }
    } catch (err) {
        console.error('Error fetching all marks:', err);
        res.status(500).json({ message: err.message });
    }
};

// Bulk create marks for multiple students
const bulkCreateMarks = async (req, res) => {
    try {
        const { marksData } = req.body;
        
        if (!marksData || !Array.isArray(marksData) || marksData.length === 0) {
            return res.status(400).json({ message: "No marks data provided" });
        }
        
        const results = [];
        
        for (const markData of marksData) {
            const { 
                studentID, teacherID, schoolID, sclassID, subjectID, 
                examType, examDate, marksObtained, maxMarks, comments 
            } = markData;
            
            if (!studentID || !teacherID || !schoolID || !sclassID || !subjectID || 
                !examType || !examDate || marksObtained === undefined || !maxMarks) {
                continue;
            }
            
            const existingMarks = await Marks.findOne({
                student: studentID,
                subject: subjectID,
                examType: examType,
                examDate: new Date(examDate)
            });
            
            let result;
            if (existingMarks) {
                existingMarks.marksObtained = marksObtained;
                existingMarks.maxMarks = maxMarks;
                existingMarks.comments = comments;
                await existingMarks.save();
                result = existingMarks;
            } else {
                const newMarks = new Marks({
                    student: studentID,
                    teacher: teacherID,
                    school: schoolID,
                    sclass: sclassID,
                    subject: subjectID,
                    examType,
                    examDate,
                    marksObtained,
                    maxMarks,
                    comments
                });
                result = await newMarks.save();
            }
            
            results.push(result);
        }
        
        res.send({ 
            message: `${results.length} marks saved successfully`, 
            data: results 
        });
    } catch (err) {
        console.error('Error bulk creating marks:', err);
        res.status(500).json({ message: err.message });
    }
};

const createMarks = async (req, res) => {
    try {
        console.log('=== CREATE MARKS REQUEST ===');
        console.log('Body:', req.body);

        const { studentID, teacherID, schoolID, sclassID, subjectID, examType, examDate, marksObtained, maxMarks, comments } = req.body;

        if (!studentID || !teacherID || !schoolID || !sclassID || !subjectID || !examType || !examDate || marksObtained === undefined || !maxMarks) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingMarks = await Marks.findOne({
            student: studentID,
            subject: subjectID,
            examType: examType,
            examDate: new Date(examDate)
        });

        if (existingMarks) {
            existingMarks.marksObtained = marksObtained;
            existingMarks.maxMarks = maxMarks;
            existingMarks.comments = comments;
            await existingMarks.save();
            return res.send(existingMarks);
        }

        const marks = new Marks({
            student: studentID,
            teacher: teacherID,
            school: schoolID,
            sclass: sclassID,
            subject: subjectID,
            examType,
            examDate,
            marksObtained,
            maxMarks,
            comments
        });

        const result = await marks.save();
        console.log('Marks created:', result._id);
        res.send(result);
    } catch (err) {
        console.error('Error creating marks:', err);
        res.status(500).json({ message: err.message });
    }
};

const getMarks = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const marks = await Marks.find({ teacher: teacherId })
            .populate('student', 'name rollNum')
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .sort({ createdAt: -1 });

        if (marks.length > 0) {
            res.send(marks);
        } else {
            res.send({ message: "No marks found" });
        }
    } catch (err) {
        console.error('Error fetching marks:', err);
        res.status(500).json({ message: err.message });
    }
};

const getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { examType } = req.query;
        
        let query = { student: studentId };
        
        if (examType && examType !== 'all') {
            query.examType = examType;
        }
        
        const marks = await Marks.find(query)
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ examDate: -1 });

        if (marks.length > 0) {
            res.send(marks);
        } else {
            res.send({ message: "No marks found for this student" });
        }
    } catch (err) {
        console.error('Error fetching student marks:', err);
        res.status(500).json({ message: err.message });
    }
};

const getClassMarks = async (req, res) => {
    try {
        const { sclassId, subjectId, examType } = req.params;
        
        let query = { sclass: sclassId };
        if (subjectId && subjectId !== 'all') {
            query.subject = subjectId;
        }
        if (examType && examType !== 'all') {
            query.examType = examType;
        }

        const marks = await Marks.find(query)
            .populate('student', 'name rollNum')
            .populate('subject', 'subName')
            .sort({ 'student.rollNum': 1 });

        if (marks.length > 0) {
            res.send(marks);
        } else {
            res.send({ message: "No marks found for this class" });
        }
    } catch (err) {
        console.error('Error fetching class marks:', err);
        res.status(500).json({ message: err.message });
    }
};

const deleteMarks = async (req, res) => {
    try {
        const marks = await Marks.findById(req.params.id);
        if (!marks) {
            return res.status(404).json({ message: "Marks not found" });
        }

        const result = await Marks.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        console.error('Error deleting marks:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { 
    createMarks, 
    getMarks, 
    getStudentMarks, 
    getClassMarks, 
    deleteMarks,
    getTeacherClasses,
    getTeacherSubjectsByClass,
    getAllMarksForSchool,
    bulkCreateMarks,
    generateStudentReportCard,
    generateClassReportCards,
    archiveResults,
    getArchivedResults,
    restoreArchivedResults,
    calculateGrade,
    getGradeColor
};

