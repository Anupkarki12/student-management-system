const Routine = require('../models/routineSchema');
const Subject = require('../models/subjectSchema');
const Teacher = require('../models/teacherSchema');
const Sclass = require('../models/sclassSchema');
const TeacherClassAssignment = require('../models/teacherClassAssignmentSchema');
const fs = require('fs');
const path = require('path');

const routineController = {
    // Create new routine
    createRoutine: async (req, res) => {
        try {
            const { school, classId, type, name, day, periods, examDate, examStartTime, examEndTime } = req.body;

            const existingRoutine = await Routine.findOne({ school, class: classId, type, day });
            if (existingRoutine) {
                // Update existing routine
                existingRoutine.periods = periods;
                existingRoutine.examDate = examDate;
                existingRoutine.examStartTime = examStartTime;
                existingRoutine.examEndTime = examEndTime;
                existingRoutine.name = name;
                await existingRoutine.save();
                return res.status(200).json({ message: 'Routine updated successfully', routine: existingRoutine });
            }

            const routine = new Routine({
                school,
                class: classId,
                type,
                name,
                day,
                periods,
                examDate,
                examStartTime,
                examEndTime
            });

            await routine.save();
            res.status(201).json({ message: 'Routine created successfully', routine });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Create exam routine with PDF file
    createExamRoutine: async (req, res) => {
        try {
            const { school, classId, examType, examDate, title } = req.body;

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Store relative path instead of absolute path
            const filePath = req.file.path.split('backend\\').pop() || req.file.path.split('backend/').pop();
            
            // If the split doesn't work, use the uploads relative path
            const relativePath = filePath.startsWith('uploads/') ? filePath : `uploads/${path.basename(req.file.path)}`;

            const routine = new Routine({
                school,
                class: classId,
                type: 'exam',
                name: `${examType.charAt(0).toUpperCase() + examType.slice(1)} Exam Routine`,
                examType,
                examDate: examDate ? new Date(examDate) : null,
                filePath: relativePath,
                title
            });

            await routine.save();
            res.status(201).json({ message: 'Exam routine uploaded successfully', routine });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get all exam routines for admin
    getExamRoutinesBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            
            // Validate ObjectId
            if (!schoolId || schoolId.length !== 24) {
                return res.status(400).json({ error: 'Invalid school ID format' });
            }
            
            console.log(`Fetching exam routines for school: ${schoolId}`);
            
            const routines = await Routine.find({ school: schoolId, type: 'exam' })
                .populate({ path: 'class', select: 'sclassName', model: Sclass })
                .sort({ createdAt: -1 });
            
            console.log(`Found ${routines.length} exam routines`);
            res.status(200).json(routines);
        } catch (error) {
            console.error('Error in getExamRoutinesBySchool:', error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    },

    // Get exam routines for teacher's classes
    getTeacherExamRoutines: async (req, res) => {
        try {
            const { teacherId } = req.params;

            // Validate teacherId format
            if (!teacherId || teacherId.length !== 24) {
                return res.status(400).json({ error: 'Invalid teacher ID format' });
            }

            // Get teacher's school from the teacher document
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ error: 'Teacher not found' });
            }

            // Get classes assigned to this teacher
            const assignments = await TeacherClassAssignment.find({ teacher: teacherId }).populate({ path: 'sclass', model: Sclass });
            const classIds = assignments.map(a => a.sclass?._id?.toString()).filter(Boolean);

            console.log(`Teacher ${teacherId} has assignments for classes:`, classIds);

            let routines;
            try {
                if (classIds.length > 0) {
                    // Get exam routines for teacher's assigned classes
                    routines = await Routine.find({
                        class: { $in: classIds },
                        type: 'exam'
                    })
                        .populate({ path: 'class', select: 'sclassName', model: Sclass })
                        .sort({ examDate: 1, createdAt: -1 });
                } else {
                    // If teacher has no class assignments, show all exam routines for the school
                    // This ensures teachers can see exam routines even without specific class assignments
                    console.log('Teacher has no class assignments, fetching all school exam routines');
                    routines = await Routine.find({
                        school: teacher.school,
                        type: 'exam'
                    })
                        .populate({ path: 'class', select: 'sclassName', model: Sclass })
                        .sort({ examDate: 1, createdAt: -1 });
                }
            } catch (populateError) {
                // If populate fails, fetch routines without population and log the issue
                console.error('Populate error, fetching without population:', populateError);
                
                if (classIds.length > 0) {
                    routines = await Routine.find({
                        class: { $in: classIds },
                        type: 'exam'
                    }).sort({ examDate: 1, createdAt: -1 });
                } else {
                    routines = await Routine.find({
                        school: teacher.school,
                        type: 'exam'
                    }).sort({ examDate: 1, createdAt: -1 });
                }
            }

            console.log(`Found ${routines.length} exam routines for teacher ${teacherId}`);
            res.status(200).json(routines);
        } catch (error) {
            console.error('Error in getTeacherExamRoutines:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get exam routines for a specific class (for students)
    getStudentExamRoutines: async (req, res) => {
        try {
            const { schoolId, classId } = req.params;

            // Validate input parameters
            if (!schoolId || !classId) {
                console.error('Missing schoolId or classId:', { schoolId, classId });
                return res.status(400).json({ error: 'Missing school ID or class ID' });
            }

            if (schoolId.length !== 24 || classId.length !== 24) {
                console.error('Invalid ID format:', { schoolId, classId });
                return res.status(400).json({ error: 'Invalid school or class ID format' });
            }

            console.log(`Fetching exam routines for school: ${schoolId}, class: ${classId}`);

            let routines;
            try {
                routines = await Routine.find({
                    school: schoolId,
                    class: classId,
                    type: 'exam'
                })
                    .populate({ path: 'class', select: 'sclassName', model: Sclass })
                    .sort({ examDate: -1, createdAt: -1 });
            } catch (populateError) {
                // If populate fails, fetch without population
                console.error('Populate error in getStudentExamRoutines:', populateError);
                routines = await Routine.find({
                    school: schoolId,
                    class: classId,
                    type: 'exam'
                }).sort({ examDate: -1, createdAt: -1 });
            }

            console.log(`Found ${routines.length} exam routines for student class ${classId}`);
            res.status(200).json(routines);
        } catch (error) {
            console.error('Error in getStudentExamRoutines:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Delete exam routine
    deleteExamRoutine: async (req, res) => {
        try {
            const { id } = req.params;
            const routine = await Routine.findById(id);

            if (!routine) {
                return res.status(404).json({ error: 'Exam routine not found' });
            }

            // Delete the file if it exists
            if (routine.filePath && fs.existsSync(routine.filePath)) {
                fs.unlinkSync(routine.filePath);
            }

            await Routine.findByIdAndDelete(id);
            res.status(200).json({ message: 'Exam routine deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get routines by school
    getRoutinesBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            const routines = await Routine.find({ school: schoolId })
                .populate({ path: 'class', select: 'sclassName', model: Sclass })
                .populate('periods.subject')
                .populate('periods.teacher');
            res.status(200).json(routines);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get routine by class
    getRoutineByClass: async (req, res) => {
        try {
            const { schoolId, classId } = req.params;
            const routines = await Routine.find({ school: schoolId, class: classId })
                .populate({ path: 'class', select: 'sclassName', model: Sclass })
                .populate('periods.subject', 'subName')
                .populate('periods.teacher', 'name');
            res.status(200).json(routines);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get routine by ID
    getRoutineById: async (req, res) => {
        try {
            const { id } = req.params;
            const routine = await Routine.findById(id)
                .populate({ path: 'class', select: 'sclassName', model: Sclass })
                .populate('periods.subject')
                .populate('periods.teacher');

            if (!routine) {
                return res.status(404).json({ error: 'Routine not found' });
            }

            res.status(200).json(routine);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete routine
    deleteRoutine: async (req, res) => {
        try {
            const { id } = req.params;
            await Routine.findByIdAndDelete(id);
            res.status(200).json({ message: 'Routine deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get class routine (all days)
    getClassRoutine: async (req, res) => {
        try {
            const { schoolId, classId } = req.params;
            const routines = await Routine.find({ school: schoolId, class: classId })
                .populate('periods.subject', 'subName')
                .populate('periods.teacher', 'name')
                .sort({ day: 1 });
            res.status(200).json(routines);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get exam routine
    getExamRoutine: async (req, res) => {
        try {
            const { schoolId, classId } = req.params;
            const routines = await Routine.find({
                school: schoolId,
                class: classId,
                type: 'exam'
            })
                .populate({ path: 'class', select: 'sclassName', model: Sclass })
                .populate('periods.subject', 'subName');
            res.status(200).json(routines);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Utility endpoint to fix existing file paths (convert absolute to relative)
    fixExamRoutinePaths: async (req, res) => {
        try {
            const routines = await Routine.find({ type: 'exam' });
            let fixedCount = 0;

            for (const routine of routines) {
                if (routine.filePath && routine.filePath.includes('backend\\uploads')) {
                    // Convert Windows absolute path to relative path
                    const relativePath = routine.filePath.split('backend\\uploads\\').pop() || 
                                        routine.filePath.split('backend/uploads/').pop();
                    if (relativePath) {
                        routine.filePath = `uploads/${relativePath}`;
                        await routine.save();
                        fixedCount++;
                        console.log(`Fixed path for routine ${routine._id}: ${routine.filePath}`);
                    }
                }
            }

            res.status(200).json({ 
                message: `Fixed ${fixedCount} exam routine paths`,
                fixedCount 
            });
        } catch (error) {
            console.error('Error fixing exam routine paths:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = routineController;

