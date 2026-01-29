const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { loginLimiter } = require('../middleware/rateLimit.js');

// Error handling wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Controllers
const { adminRegister, adminLogIn, getAdminDetail, adminForgotPassword} = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents, updateSclass } = require('../controllers/class-controller.js');
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
const { createHomework, getHomework, getHomeworkByClass, getHomeworkForClass, getHomeworkForStudent, deleteHomework } = require('../controllers/homework-controller.js');
const { createTeacherNote, getTeacherNotes, getSchoolNotes, getNotesByClass, deleteTeacherNote } = require('../controllers/teacherNote-controller.js');
const { createMarks, getMarks, getStudentMarks, getClassMarks, deleteMarks, getAllMarksForSchool, bulkCreateMarks } = require('../controllers/marks-controller.js');
const { assignTeacherToClass, getTeacherAssignments, getClassAssignments, getAvailableTeachersForClass, deleteAssignment, getTeacherClasses, getTeacherSubjectsByClass, getTeacherDetailsWithAssignments } = require('../controllers/teacherClassAssignment-controller.js');
const { createRoutine, getRoutinesBySchool, getRoutineByClass, getRoutineById, deleteRoutine, getClassRoutine, getExamRoutine, createExamRoutine, getExamRoutinesBySchool, getTeacherExamRoutines, getStudentExamRoutines, deleteExamRoutine, fixExamRoutinePaths } = require('../controllers/routine-controller.js');
const salaryController = require('../controllers/salary-controller.js');
const staffController = require('../controllers/staff-controller.js');
const parentController = require('../controllers/parent-controller.js');

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
router.put("/Sclass/:id", updateSclass)

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
router.get('/Homework/StudentById/:studentId', getHomeworkForStudent);
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
router.get('/Notes/School/:schoolId', getSchoolNotes);
router.get('/Notes/Student/:classId', getNotesByClass);
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

// Routine Routes
router.post('/Routine/Create', createRoutine);
router.get('/Routines/:schoolId', getRoutinesBySchool);
router.get('/Routines/Class/:schoolId/:classId', getRoutineByClass);
router.get('/Routine/:id', getRoutineById);
router.delete('/Routine/:id', deleteRoutine);
router.get('/Routine/Class/All/:schoolId/:classId', getClassRoutine);
router.get('/Routine/Exam/:schoolId/:classId', getExamRoutine);

// Exam Routine Routes (with file upload)
const examRoutineUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const examRoutinesDir = path.join(__dirname, '../uploads/exam-routines');
            if (!fs.existsSync(examRoutinesDir)) {
                fs.mkdirSync(examRoutinesDir, { recursive: true });
            }
            cb(null, examRoutinesDir);
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
        // Accept only PDF files
        const extname = path.extname(file.originalname).toLowerCase();
        if (extname === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for exam routines.'), false);
        }
    }
});

router.post('/ExamRoutine/Create', examRoutineUpload.single('file'), handleMulterError, createExamRoutine);
router.get('/ExamRoutine/Admin/:schoolId', getExamRoutinesBySchool);
router.get('/ExamRoutine/Teacher/:teacherId', getTeacherExamRoutines);
router.get('/ExamRoutine/Student/:schoolId/:classId', getStudentExamRoutines);
router.delete('/ExamRoutine/:id', deleteExamRoutine);

// Utility route to fix existing exam routine file paths
router.post('/ExamRoutine/FixPaths', fixExamRoutinePaths);

// Salary Routes - Using salaryController for all methods
router.post('/Salary/Create', salaryController.createSalary);
router.post('/Salary/Cleanup', salaryController.cleanupCorruptedSalaries);
router.get('/Salaries/:schoolId', salaryController.getSalariesBySchool);

// IMPORTANT: Define more specific routes BEFORE less specific routes
// The /Salary/Employees/:schoolId/:employeeType route MUST come before
// /Salary/:schoolId/:employeeType/:employeeId to avoid route matching conflicts

// New Salary Management Routes - Enhanced with better error handling
router.get('/Salary/Employees/:schoolId/:employeeType', asyncHandler(async (req, res) => {
    const { schoolId, employeeType } = req.params;
    
    console.log(`[Salary] GET /Salary/Employees/${schoolId}/${employeeType}`);
    
    // Validate parameters before calling controller
    if (!schoolId) {
        console.error('[Salary] Missing schoolId parameter');
        return res.status(400).json({ error: 'School ID is required' });
    }
    
    if (!employeeType || !['teacher', 'staff', 'all'].includes(employeeType)) {
        console.error(`[Salary] Invalid employeeType: ${employeeType}`);
        return res.status(400).json({ error: 'Invalid employee type. Must be teacher, staff, or all' });
    }
    
    // Call the controller directly - it handles its own response
    await salaryController.getEmployeesWithSalaryStatus(req, res);
}));

// Generic salary routes - these MUST come AFTER the specific /Salary/Employees route
router.get('/Salary/:schoolId/:employeeType/:employeeId', salaryController.getSalaryByEmployee);
router.get('/Salary/Calculate/:salaryId', salaryController.calculateNetSalary);
router.post('/Salary/Payment/:salaryId', salaryController.recordPayment);
router.get('/Salary/PaymentHistory/:salaryId', salaryController.getPaymentHistory);
router.delete('/Salary/:id', salaryController.deleteSalary);
router.get('/Salary/Summary/:schoolId', salaryController.getSalarySummary);

router.post('/Salary/BulkPayment', salaryController.bulkSalaryPayment);
router.get('/Salary/ByMonth/:schoolId/:month/:year', salaryController.getSalaryByMonthYear);
router.put('/Salary/Update/:salaryId', salaryController.updateSalary);
router.get('/Salary/EmployeeHistory/:schoolId/:employeeType/:employeeId', salaryController.getEmployeePaymentHistory);

// Staff Routes
router.post('/StaffReg', staffController.staffRegister);
router.post('/StaffLogin', staffController.staffLogIn);
router.post('/StaffForgotPassword', staffController.staffForgotPassword);
router.get('/Staffs/:id', staffController.getStaffs);
router.get('/Staff/:id', staffController.getStaffDetail);
router.delete('/Staffs/:id', staffController.deleteStaffs);
router.delete('/Staff/:id', staffController.deleteStaff);
router.put('/Staff/:id', staffController.updateStaff);
router.post('/StaffAttendance/:id', staffController.staffAttendance);
router.get('/Staff/Attendance/:id', staffController.getStaffAttendanceReport);
router.put('/Staff/Salary/:id', staffController.updateSalary);
router.get('/Staff/Salary/Calculate/:id', staffController.calculateNetSalary);
router.get('/Staff/Salary/Summary/:schoolId', staffController.getStaffSalarySummary);
router.put('/Staff/ClearAttendance/:id', staffController.clearStaffAttendance);

// Simple Staff Routes (without login/authentication)
const simpleStaffController = require('../controllers/simple-staff-controller.js');
router.post('/SimpleStaff/add', simpleStaffController.addStaff);
router.get('/SimpleStaffs/:schoolId', simpleStaffController.getAllStaffs);
router.get('/SimpleStaff/Health', simpleStaffController.healthCheck);
router.get('/SimpleStaff/:id', simpleStaffController.getStaffDetail);
router.delete('/SimpleStaff/:id', simpleStaffController.deleteStaff);
router.delete('/SimpleStaffs/:schoolId', simpleStaffController.deleteAllStaffs);

// Parent Routes
router.post('/ParentReg', parentController.parentRegister);
router.post('/ParentLogin', parentController.parentLogIn);
router.post('/ParentForgotPassword', parentController.parentForgotPassword);
router.get('/Parents/:id', parentController.getParents);
router.get('/Parent/:id', parentController.getParentDetail);
router.get('/Parent/ByStudent/:studentId', parentController.getParentByStudent);
router.delete('/Parents/:id', parentController.deleteParents);
router.delete('/Parent/:id', parentController.deleteParent);
router.put('/Parent/:id', parentController.updateParent);
router.put('/Parent/Link/:parentId/:studentId', parentController.linkStudentToParent);
router.put('/Parent/Unlink/:parentId/:studentId', parentController.unlinkStudentFromParent);
router.get('/Parent/Students/:id', parentController.getStudentsByParent);
router.get('/Parent/Dashboard/:id', parentController.getParentDashboard);

module.exports = router;

