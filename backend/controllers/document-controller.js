const Document = require('../models/documentSchema.js');
const fs = require('fs');
const path = require('path');

const documentCreate = async (req, res) => {
    try {
        console.log('=== DOCUMENT UPLOAD REQUEST STARTED ===');
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Has file:', !!req.file);
        console.log('Has body:', Object.keys(req.body).length > 0);
        
        // If file exists, log file info
        if (req.file) {
            console.log('File info:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                encoding: req.file.encoding,
                mimetype: req.file.mimetype,
                size: req.file.size,
                destination: req.file.destination,
                filename: req.file.filename,
                path: req.file.path
            });
        } else {
            console.log('No file in request - checking if this is a multer error');
        }
        
        // Log all body fields
        console.log('Body fields:', Object.keys(req.body));
        console.log('Body values:', {
            title: req.body.title,
            teacherID: req.body.teacherID,
            schoolID: req.body.schoolID,
            sclassID: req.body.sclassID,
            subjectID: req.body.subjectID
        });
        
        if (!req.file) {
            console.log('Returning 400 - No file uploaded');
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title, description, teacherID, schoolID, sclassID, subjectID, expirationDate } = req.body;

        // Validate required fields
        if (!teacherID || !schoolID) {
            console.log('Missing required fields:', { teacherID, schoolID });
            // Clean up uploaded file if validation fails
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: "Teacher ID and School ID are required" });
        }

        // Verify ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(teacherID)) {
            console.log('Invalid teacherID format:', teacherID);
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: "Invalid Teacher ID format" });
        }
        if (!mongoose.Types.ObjectId.isValid(schoolID)) {
            console.log('Invalid schoolID format:', schoolID);
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: "Invalid School ID format" });
        }

        // Handle file path - multer diskStorage should have saved the file
        let filePath, fileName, fileType, fileSize;
        
        console.log('Checking file storage method...');
        console.log('req.file.path:', req.file.path);
        console.log('req.file.destination:', req.file.destination);
        console.log('req.file.filename:', req.file.filename);
        
        if (req.file.path) {
            // File was saved by multer diskStorage
            filePath = req.file.path;
            // Convert absolute path to relative path for storage
            fileName = path.basename(filePath);
            const relativeFilePath = path.relative(path.join(__dirname, '..'), filePath);
            filePath = relativeFilePath;
            fileType = req.file.mimetype;
            fileSize = req.file.size;
            console.log('File saved by multer. Relative path:', filePath);
            
            // Verify file exists
            const fullPath = path.join(__dirname, '..', filePath);
            console.log('Checking if file exists at:', fullPath, fs.existsSync(fullPath));
        } else {
            console.log('ERROR: No file path available');
            return res.status(400).json({ message: "File data is invalid" });
        }

        console.log('Creating document with:', {
            title,
            fileName,
            filePath,
            fileType,
            fileSize,
            teacher: teacherID,
            school: schoolID
        });

        const document = new Document({
            title,
            description,
            fileName: fileName,
            filePath: filePath,
            fileType: fileType || 'application/octet-stream',
            fileSize: fileSize || 0,
            teacher: teacherID,
            school: schoolID,
            sclass: sclassID || null,
            subject: subjectID || null,
            expirationDate: expirationDate || null
        });

        console.log('Attempting to save document to MongoDB...');
        const result = await document.save();
        console.log('Document saved successfully:', result._id);
        res.send(result);
    } catch (err) {
        console.error('=== ERROR CREATING DOCUMENT ===');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        if (err.errors) {
            console.error('Validation errors:', err.errors);
        }
        console.error('Full error:', err);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Cleaned up uploaded file');
            } catch (cleanupErr) {
                console.error('Error cleaning up file:', cleanupErr);
            }
        }
        
        // Send more informative error
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ message: "Validation Error: " + errorMessages });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format: " + err.message });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "Duplicate key error. Please check your data." });
        }
        res.status(500).json({ message: err.message });
    }
};

const documentList = async (req, res) => {
    try {
        let documents;
        
        if (req.params.role === 'Admin') {
            documents = await Document.find({ school: req.params.id });
        } else if (req.params.role === 'Teacher') {
            documents = await Document.find({ 
                $or: [
                    { teacher: req.params.id },  // Teacher's own documents
                    { teacher: null }             // Admin-uploaded documents
                ],
                school: req.params.schoolId || req.params.id
            });
        } else if (req.params.role === 'Student') {
            documents = await Document.find({ 
                school: req.params.schoolId,
                $or: [
                    { sclass: req.params.classId },
                    { sclass: null }
                ]
            });
        }

        if (documents.length > 0) {
            res.send(documents);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDocuments = async (req, res) => {
    try {
        // Fetch both teacher's own documents AND admin-uploaded documents (teacher: null)
        const documents = await Document.find({
            $or: [
                { teacher: req.params.id },  // Teacher's own documents
                { teacher: null }             // Admin-uploaded documents
            ]
        })
        .populate('teacher', 'name')
        .populate('sclass', 'sclassName')
        .populate('subject', 'subName')
        .sort({ uploadDate: -1 });
        
        console.log(`Found ${documents.length} documents for teacher ${req.params.id}`);
        
        if (documents.length > 0) {
            res.send(documents);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        console.error('Error fetching teacher documents:', err);
        res.status(500).json(err);
    }
};

const getSchoolDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ school: req.params.id })
            .populate('teacher', 'name')
            .populate('sclass', 'sclassName')
            .populate('subject', 'subName');
        
        if (documents.length > 0) {
            res.send(documents);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDocuments = async (req, res) => {
    try {
        const { schoolId, classId } = req.params;
        console.log('=== getStudentDocuments called ===');
        console.log('schoolId from params:', schoolId);
        console.log('classId from params:', classId);
        console.log('req.params:', req.params);
        
        // Validate the IDs
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            console.log('Invalid schoolId:', schoolId);
            return res.status(400).json({ message: "Invalid School ID format" });
        }
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            console.log('Invalid classId:', classId);
            return res.status(400).json({ message: "Invalid Class ID format" });
        }
        
        // Build query - documents that belong to the school AND
        // either match the student's class OR are for all classes (null)
        // AND either don't expire or haven't expired yet
        const query = {
            school: schoolId,
            $or: [
                { sclass: classId },
                { sclass: null },
                { sclass: { $exists: false } }
            ]
        };

        // Add expiration filter only if we want to exclude expired documents
        // For now, show all non-expired documents
        const now = new Date();
        query.$and = [
            {
                $or: [
                    { expirationDate: null },
                    { expirationDate: { $exists: false } },
                    { expirationDate: { $gt: now } }
                ]
            }
        ];

        console.log('Document query:', JSON.stringify(query, null, 2));

        const documents = await Document.find(query)
            .populate('teacher', 'name')
            .populate('subject', 'subName')
            .sort({ uploadDate: -1 }); // Most recent first
        
        console.log('Found documents:', documents.length);
        if (documents.length > 0) {
            console.log('First document:', documents[0].title);
            console.log('First document sclass:', documents[0].sclass);
        }
        
        if (documents.length > 0) {
            res.send(documents);
        } else {
            res.send({ message: "No documents found" });
        }
    } catch (err) {
        console.error('Error fetching student documents:', err);
        res.status(500).json({ message: err.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const fullPath = path.join(__dirname, '..', document.filePath);
        console.log('Deleting file:', fullPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        const result = await Document.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json(error);
    }
};

const deleteDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ school: req.params.id });
        
        documents.forEach(doc => {
            const fullPath = path.join(__dirname, '..', doc.filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });

        const result = await Document.deleteMany({ school: req.params.id });
        if (result.deletedCount === 0) {
            res.send({ message: "No documents found to delete" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { 
    documentCreate, 
    documentList, 
    getTeacherDocuments,
    getSchoolDocuments,
    getStudentDocuments,
    deleteDocument, 
    deleteDocuments 
};
