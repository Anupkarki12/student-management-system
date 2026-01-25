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
        const homework = await Homework.find({ sclass: classId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ dueDate: -1 }); // Most recent first

        if (homework.length > 0) {
            res.send(homework);
        } else {
            res.send({ message: "No homework found for this class" });
        }
    } catch (err) {
        console.error('Error fetching homework for class:', err);
        res.status(500).json({ message: err.message });
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

module.exports = { createHomework, getHomework, getHomeworkByClass, getHomeworkForClass, deleteHomework };

