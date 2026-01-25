const TeacherClassAssignment = require('../models/teacherClassAssignmentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const assignTeacherToClass = async (req, res) => {
    try {
        const { teacherID, sclassID, subjectID, schoolID } = req.body;

        const existingAssignment = await TeacherClassAssignment.findOne({
            teacher: teacherID,
            sclass: sclassID,
            subject: subjectID
        });

        if (existingAssignment) {
            return res.status(400).json({ message: "This teacher is already assigned to this class and subject" });
        }

        const assignment = new TeacherClassAssignment({
            teacher: teacherID,
            sclass: sclassID,
            subject: subjectID,
            school: schoolID
        });

        await assignment.save();
        res.send(assignment);
    } catch (err) {
        console.error('Error assigning teacher:', err);
        res.status(500).json({ message: err.message });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const assignments = await TeacherClassAssignment.find({ teacher: teacherId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .sort({ createdAt: -1 });

        res.send(assignments);
    } catch (err) {
        console.error('Error fetching teacher assignments:', err);
        res.status(500).json({ message: err.message });
    }
};

const getClassAssignments = async (req, res) => {
    try {
        const { classId } = req.params;
        const assignments = await TeacherClassAssignment.find({ sclass: classId })
            .populate('teacher', 'name email')
            .populate('subject', 'subName subCode')
            .populate('sclass', 'sclassName')
            .sort({ createdAt: -1 });

        res.send(assignments);
    } catch (err) {
        console.error('Error fetching class assignments:', err);
        res.status(500).json({ message: err.message });
    }
};

const getAvailableTeachersForClass = async (req, res) => {
    try {
        const { classId, schoolId } = req.params;

        const allTeachers = await Teacher.find({ school: schoolId });
        const assignedAssignments = await TeacherClassAssignment.find({ sclass: classId });
        const assignedTeacherIds = assignedAssignments.map(a => a.teacher.toString());

        const availableTeachers = allTeachers.filter(
            teacher => !assignedTeacherIds.includes(teacher._id.toString())
        );

        // Note: subjectSchema uses sclassName field to reference class
        const subjects = await Subject.find({ sclassName: classId });

        res.send({
            availableTeachers: availableTeachers,
            subjects: subjects,
            alreadyAssigned: assignedAssignments
        });
    } catch (err) {
        console.error('Error fetching available teachers:', err);
        res.status(500).json({ message: err.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await TeacherClassAssignment.findByIdAndDelete(id);
        res.send(result);
    } catch (err) {
        console.error('Error deleting assignment:', err);
        res.status(500).json({ message: err.message });
    }
};

const getTeacherClasses = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const assignments = await TeacherClassAssignment.find({ teacher: teacherId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName');

        const classMap = new Map();
        assignments.forEach(assignment => {
            const classId = assignment.sclass._id.toString();
            if (!classMap.has(classId)) {
                classMap.set(classId, {
                    _id: assignment.sclass._id,
                    sclassName: assignment.sclass.sclassName,
                    subjects: []
                });
            }
            classMap.get(classId).subjects.push({
                _id: assignment.subject._id,
                subName: assignment.subject.subName
            });
        });

        res.send(Array.from(classMap.values()));
    } catch (err) {
        console.error('Error fetching teacher classes:', err);
        res.status(500).json({ message: err.message });
    }
};

const getTeacherSubjectsByClass = async (req, res) => {
    try {
        const { teacherId, classId } = req.params;
        const assignments = await TeacherClassAssignment.find({
            teacher: teacherId,
            sclass: classId
        }).populate('subject', 'subName subCode sessions');

        res.send(assignments.map(a => a.subject));
    } catch (err) {
        console.error('Error fetching teacher subjects:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get full teacher details with all assignments
const getTeacherDetailsWithAssignments = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const assignments = await TeacherClassAssignment.find({ teacher: teacherId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName subCode sessions');

        res.send({
            teacher: teacher,
            assignments: assignments
        });
    } catch (err) {
        console.error('Error fetching teacher details:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    assignTeacherToClass,
    getTeacherAssignments,
    getClassAssignments,
    getAvailableTeachersForClass,
    deleteAssignment,
    getTeacherClasses,
    getTeacherSubjectsByClass,
    getTeacherDetailsWithAssignments
};

