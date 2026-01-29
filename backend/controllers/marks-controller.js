const Marks = require('../models/marksSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Sclass = require('../models/sclassSchema.js');

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
        // Find all subjects in the school's classes that are taught by this teacher
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
        // This handles cases where subjects might not have teacher assigned yet
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
            // If no subjects assigned, check if teacher is directly assigned to this class
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
                continue; // Skip invalid entries
            }
            
            // Check if marks already exist for this student, subject, exam type and date
            const existingMarks = await Marks.findOne({
                student: studentID,
                subject: subjectID,
                examType: examType,
                examDate: new Date(examDate)
            });
            
            let result;
            if (existingMarks) {
                // Update existing marks
                existingMarks.marksObtained = marksObtained;
                existingMarks.maxMarks = maxMarks;
                existingMarks.comments = comments;
                await existingMarks.save();
                result = existingMarks;
            } else {
                // Create new marks
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

        // Check if marks already exist for this student, subject, exam type and date
        const existingMarks = await Marks.findOne({
            student: studentID,
            subject: subjectID,
            examType: examType,
            examDate: new Date(examDate)
        });

        if (existingMarks) {
            // Update existing marks
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
        
        // Filter by exam type if provided
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
    bulkCreateMarks
};

