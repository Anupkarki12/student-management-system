const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Controllers
const { adminRegister, adminLogIn, getAdminDetail, adminForgotPassword} = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister, studentLogIn, studentForgotPassword, getStudents, getStudentDetail,
    deleteStudents, deleteStudent, updateStudent, studentAttendance, deleteStudentsByClass,
    updateExamResult, clearAllStudentsAttendanceBySubject, clearAllStudentsAttendance,
    removeStudentAttendanceBySubject, removeStudentAttendance
} = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, teacherForgotPassword, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');
const { createFee, getStudentFees, getAllStudentFees, updateFee, deleteFee } = require('../controllers/fee-controller.js');
const { documentCreate, documentList, getTeacherDocuments, getSchoolDocuments, getStudentDocuments, deleteDocument, deleteDocuments } = require('../controllers/document-controller.js');
const { createHomework, getHomework, getHomeworkByClass, getHomeworkForClass, deleteHomework } = require('../controllers/homework-controller.js');
const { createTeacherNote, getTeacherNotes, deleteTeacherNote } = require('../controllers/teacherNote-controller.js');
const { createMarks, getMarks, getStudentMarks, getClassMarks, deleteMarks, getTeacherClasses, getTeacherSubjectsByClass, getAllMarksForSchool, bulkCreateMarks } = require('../controllers/marks-controller.js');
const { assignTeacherToClass, getTeacherAssignments, getClassAssignments, getAvailableTeachersForClass, deleteAssignment, getTeacherClasses: getTeacherClassesNew, getTeacherSubjectsByClass: getTeacherSubjectsByClassNew, getTeacherDetailsWithAssignments } = require('../controllers/teacherClassAssignment-controller.js');

// Admin
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.post('/AdminForgotPassword', adminForgotPassword);
router.get("/Admin/:id", getAdminDetail)

// Student
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)
router.post('/StudentForgotPassword', studentForgotPassword)
router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)
router.put("/Student/:id", updateStudent)
router.put('/UpdateExamResult/:id', updateExamResult)
router.put('/StudentAttendance/:id', studentAttendance)
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)
router.post('/TeacherForgotPassword', teacherForgotPassword)
router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)
router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)
router.put("/TeacherSubject", updateTeacherSubject)
router.post('/TeacherAttendance/:id', teacherAttendance)

// Notice
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)
router.put("/Notice/:id", updateNotice)

// Complain
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// Sclass
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)
router.get("/Sclass/Students/:id", getSclassStudents)
router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)
router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Fee
router.post('/FeeCreate', createFee);
router.get('/Fees/:id', getStudentFees);
router.get('/AllFees/:id', getAllStudentFees);
router.put('/Fee/:feeId', updateFee);
router.delete('/Fee/:studentId/:feeDetailId?', deleteFee);

// Document - Use disk storage configured in main index.js
// The main index.js sets up multer with diskStorage, so we reuse the upload middleware
// But we need a separate upload for this route since it's configured differently
const documentUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadsDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        const extname = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif'];
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF files are allowed.'), false);
        }
    }
});

// Profile photo upload middleware (separate configuration)
const profilePhotoUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const profilePhotosDir = path.join(__dirname, '../uploads/profile-photos');
            if (!fs.existsSync(profilePhotosDir)) {
                fs.mkdirSync(profilePhotosDir, { recursive: true });
            }
            cb(null, profilePhotosDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for profile photos
    },
    fileFilter: function (req, file, cb) {
        // Accept only image types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const extname = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(extname)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, GIF files are allowed for profile photos.'), false);
        }
    }
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err.code, err.field);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: "File too large. Maximum size is 10MB." });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: "Too many files. Only one file allowed." });
        }
        return res.status(400).json({ message: "File upload error: " + err.message });
    }
    if (err) {
        console.error('File filter error:', err.message);
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Profile photo upload route
router.post('/ProfilePhotoUpload', profilePhotoUpload.single('photo'), handleMulterError, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const photoPath = `uploads/profile-photos/${req.file.filename}`;
        res.send({ photo: photoPath, message: "Photo uploaded successfully" });
    } catch (err) {
        console.error('Profile photo upload error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Pass the upload middleware and the actual file processing to the controller
router.post('/DocumentCreate', documentUpload.single('file'), handleMulterError, documentCreate);

router.get('/TeacherDocuments/:id', getTeacherDocuments);
router.get('/SchoolDocuments/:id', getSchoolDocuments);
router.get('/StudentDocuments/:schoolId/:classId', getStudentDocuments);
router.delete("/Documents/:id", deleteDocument)
router.delete("/DocumentsSchool/:id", deleteDocuments)

// Homework Routes
router.post('/HomeworkCreate', createHomework);
router.get('/Homework/:teacherId', getHomework);
router.get('/Homework/Class/:sclassId/:teacherId', getHomeworkByClass);
router.get('/Homework/Student/:classId', getHomeworkForClass);
router.delete('/Homework/:id', deleteHomework);

// Teacher Notes Routes
const noteUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const notesDir = path.join(__dirname, '../uploads/notes');
            if (!fs.existsSync(notesDir)) {
                fs.mkdirSync(notesDir, { recursive: true });
            }
            cb(null, notesDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

router.post('/TeacherNoteCreate', noteUpload.single('file'), handleMulterError, createTeacherNote);
router.get('/TeacherNotes/:teacherId', getTeacherNotes);
router.delete('/TeacherNote/:id', deleteTeacherNote);

// Marks Routes
router.post('/MarksCreate', createMarks);
router.get('/Marks/:teacherId', getMarks);
router.get('/Marks/Student/:studentId', getStudentMarks);
router.get('/Marks/Class/:sclassId/:subjectId/:examType', getClassMarks);
router.delete('/Marks/:id', deleteMarks);

// Teacher Classes and Subjects Routes
router.get('/Teacher/Classes/:teacherId', getTeacherClasses);
router.get('/Teacher/Subjects/:teacherId/:classId', getTeacherSubjectsByClass);

// Admin Routes for viewing all marks
router.get('/Marks/All/:schoolId', getAllMarksForSchool);

// Bulk marks creation
router.post('/Marks/BulkCreate', bulkCreateMarks);

// Teacher Class Assignment Routes
router.post('/Teacher/Assign', assignTeacherToClass);
router.get('/Teacher/Assignments/:teacherId', getTeacherAssignments);
router.get('/Class/Assignments/:classId', getClassAssignments);
router.get('/Class/AvailableTeachers/:classId/:schoolId', getAvailableTeachersForClass);
router.delete('/Assignment/:id', deleteAssignment);
router.get('/Teacher/Details/:teacherId', getTeacherDetailsWithAssignments);

module.exports = router;
