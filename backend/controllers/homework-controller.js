const Homework = require('../models/homeworkSchema.js');
const fs = require('fs');
const path = require('path');

const createHomework = async (req, res) => {
    try {
        console.log('=== HOMEWORK CREATE REQUEST ===');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { title, description, dueDate, teacherID, schoolID, sclassID, subjectID } = req.body;

        if (!title || !description || !dueDate || !teacherID || !schoolID || !sclassID) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const homework = new Homework({
            title,
            description,
            dueDate,
            teacher: teacherID,
            school: schoolID,
            sclass: sclassID,
            subject: subjectID || null
        });

        const result = await homework.save();
        console.log('Homework created:', result._id);
        res.send(result);
    } catch (err) {
        console.error('Error creating homework:', err);
        res.status(500).json({ message: err.message });
    }
};

const getHomework = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const homework = await Homework.find({ teacher: teacherId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .sort({ createdAt: -1 });

        if (homework.length > 0) {
            res.send(homework);
        } else {
            res.send({ message: "No homework found" });
        }
    } catch (err) {
        console.error('Error fetching homework:', err);
        res.status(500).json({ message: err.message });
    }
};

const getHomeworkByClass = async (req, res) => {
    try {
        const { sclassId, teacherId } = req.params;
        const homework = await Homework.find({ 
            sclass: sclassId,
            teacher: teacherId
        })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ dueDate: 1 });

        if (homework.length > 0) {
            res.send(homework);
        } else {
            res.send({ message: "No homework found for this class" });
        }
    } catch (err) {
        console.error('Error fetching homework by class:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get homework for a specific class (for students)
const getHomeworkForClass = async (req, res) => {
    try {
        const { classId } = req.params;
        
        console.log('=== GET HOMEWORK FOR CLASS ===');
        console.log('classId:', classId);
        
        // Validate classId
        if (!classId) {
            console.log('No classId provided');
            return res.status(400).json({ message: "Class ID is required" });
        }
        
        // Check if classId is a valid MongoDB ObjectId
        if (classId.length !== 24) {
            console.log('Invalid classId format:', classId);
            return res.status(400).json({ message: "Invalid class ID format" });
        }

        const homework = await Homework.find({ sclass: classId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ dueDate: -1 }); // Most recent first

        console.log('Homework found:', homework.length, 'items');
        
        if (homework.length > 0) {
            res.send(homework);
        } else {
            res.send({ message: "No homework found for this class" });
        }
    } catch (err) {
        console.error('Error fetching homework for class:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};

// Get homework for a specific student (for parents)
const getHomeworkForStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('=== GET HOMEWORK FOR STUDENT ===');
        console.log('studentId:', studentId);
        
        // Validate studentId
        if (!studentId) {
            console.log('No studentId provided');
            return res.status(400).json({ message: "Student ID is required" });
        }
        
        // Check if studentId is a valid MongoDB ObjectId
        if (studentId.length !== 24) {
            console.log('Invalid studentId format:', studentId);
            return res.status(400).json({ message: "Invalid student ID format" });
        }

        // Import Student model to get class ID
        const Student = require('../models/studentSchema.js');
        const student = await Student.findById(studentId).populate('sclassName', 'sclassName');
        
        if (!student) {
            console.log('Student not found');
            return res.status(404).json({ message: "Student not found" });
        }

        console.log('Student class:', student.sclassName);

        // Find homework for the student's class
        const homework = await Homework.find({ sclass: student.sclassName._id })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ dueDate: -1 }); // Most recent first

        console.log('Homework found:', homework.length, 'items');
        
        if (homework.length > 0) {
            res.send(homework);
        } else {
            res.send({ message: "No homework found for this student" });
        }
    } catch (err) {
        console.error('Error fetching homework for student:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};

const deleteHomework = async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id);
        if (!homework) {
            return res.status(404).json({ message: "Homework not found" });
        }

        const result = await Homework.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        console.error('Error deleting homework:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createHomework, getHomework, getHomeworkByClass, getHomeworkForClass, getHomeworkForStudent, deleteHomework };

