const TeacherNote = require('../models/teacherNoteSchema.js');
const fs = require('fs');
const path = require('path');

const createTeacherNote = async (req, res) => {
    try {
        console.log('=== TEACHER NOTE CREATE REQUEST ===');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { title, description, teacherID, schoolID, sclassID, subjectID } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!title || !description || !teacherID || !schoolID || !sclassID) {
            // Clean up uploaded file
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: "Missing required fields" });
        }

        const filePath = req.file.path;
        const fileName = path.basename(filePath);
        const relativeFilePath = path.relative(path.join(__dirname, '..'), filePath);

        const note = new TeacherNote({
            title,
            description,
            teacher: teacherID,
            school: schoolID,
            sclass: sclassID,
            subject: subjectID || null,
            fileName: fileName,
            filePath: relativeFilePath,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        const result = await note.save();
        console.log('Teacher note created:', result._id);
        res.send(result);
    } catch (err) {
        console.error('Error creating teacher note:', err);
        res.status(500).json({ message: err.message });
    }
};

const getTeacherNotes = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const notes = await TeacherNote.find({ teacher: teacherId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .sort({ createdAt: -1 });

        if (notes.length > 0) {
            res.send(notes);
        } else {
            res.send({ message: "No notes found" });
        }
    } catch (err) {
        console.error('Error fetching teacher notes:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get all notes for a school (for admin)
const getSchoolNotes = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const notes = await TeacherNote.find({ school: schoolId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        if (notes.length > 0) {
            res.send(notes);
        } else {
            res.send({ message: "No notes found for this school" });
        }
    } catch (err) {
        console.error('Error fetching school notes:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get notes by class (for students)
const getNotesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const notes = await TeacherNote.find({ sclass: classId })
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        if (notes.length > 0) {
            res.send(notes);
        } else {
            res.send({ message: "No notes found for this class" });
        }
    } catch (err) {
        console.error('Error fetching notes by class:', err);
        res.status(500).json({ message: err.message });
    }
};

const deleteTeacherNote = async (req, res) => {
    try {
        const note = await TeacherNote.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Delete file
        const fullPath = path.join(__dirname, '..', note.filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        const result = await TeacherNote.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (err) {
        console.error('Error deleting teacher note:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createTeacherNote, getTeacherNotes, getSchoolNotes, getNotesByClass, deleteTeacherNote };

