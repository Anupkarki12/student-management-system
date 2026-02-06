const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const teacher = new Teacher({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });

        const existingTeacherByEmail = await Teacher.findOne({ email });

        if (existingTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else {
            let result = await teacher.save();
            await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherLogIn = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher) {
            const validated = await bcrypt.compare(req.body.password, teacher.password);
            if (validated) {
                teacher = await teacher.populate("teachSubject", "subName sessions")
                teacher = await teacher.populate("school", "schoolName")
                teacher = await teacher.populate("teachSclass", "sclassName")
                teacher.password = undefined;
                res.send(teacher);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Teacher not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const teacherForgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.send({ message: "Email and new password are required" });
        }

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.send({ message: "Teacher not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(newPassword, salt);

        await Teacher.findByIdAndUpdate(teacher._id, { password: hashedPass });
        teacher.password = undefined;
        res.send({ message: "Password updated successfully", teacher });
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeachers = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Convert to ObjectId if valid
        const schoolObjectId = mongoose.Types.ObjectId.isValid(id)
            ? new mongoose.Types.ObjectId(id)
            : id;
        
        let teachers = await Teacher.find({ school: schoolObjectId })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");
        if (teachers.length > 0) {
            let modifiedTeachers = teachers.map((teacher) => {
                return { ...teacher._doc, password: undefined };
            });
            res.send(modifiedTeachers);
        } else {
            res.send({ message: "No teachers found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id)
            .populate("teachSubject", "subName sessions")
            .populate("school", "schoolName")
            .populate("teachSclass", "sclassName")
        if (teacher) {
            teacher.password = undefined;
            res.send(teacher);
        }
        else {
            res.send({ message: "No teacher found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const updateTeacherSubject = async (req, res) => {
    const { teacherId, teachSubject } = req.body;
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { teachSubject },
            { new: true }
        );

        await Subject.findByIdAndUpdate(teachSubject, { teacher: updatedTeacher._id });

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

        await Subject.updateOne(
            { teacher: deletedTeacher._id, teacher: { $exists: true } },
            { $unset: { teacher: 1 } }
        );

        res.send(deletedTeacher);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Convert to ObjectId if valid
        const schoolObjectId = mongoose.Types.ObjectId.isValid(id)
            ? new mongoose.Types.ObjectId(id)
            : id;
        
        const deletionResult = await Teacher.deleteMany({ school: schoolObjectId });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ school: schoolObjectId });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const deletionResult = await Teacher.deleteMany({ sclassName: req.params.id });

        const deletedCount = deletionResult.deletedCount || 0;

        if (deletedCount === 0) {
            res.send({ message: "No teachers found to delete" });
            return;
        }

        const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

        await Subject.updateMany(
            { teacher: { $in: deletedTeachers.map(teacher => teacher._id) }, teacher: { $exists: true } },
            { $unset: { teacher: "" }, $unset: { teacher: null } }
        );

        res.send(deletionResult);
    } catch (error) {
        res.status(500).json(error);
    }
};

const teacherAttendance = async (req, res) => {
    const { status, date, presentCount, absentCount } = req.body;

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        // Calculate presentCount and absentCount based on status
        const present = status === 'Present' ? 1 : 0;
        const absent = status === 'Absent' ? 1 : 0;

        const existingAttendance = teacher.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString()
        );

        if (existingAttendance) {
            existingAttendance.status = status;
            existingAttendance.presentCount = present;
            existingAttendance.absentCount = absent;
        } else {
            teacher.attendance.push({ 
                date, 
                status, 
                presentCount: present,
                absentCount: absent
            });
        }

        const result = await teacher.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error)
    }
};

// Get teacher attendance report with month/year filtering
const getTeacherAttendanceReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.send({ message: 'Teacher not found' });
        }

        let attendance = teacher.attendance || [];

        // Filter by month and year if provided
        if (month || year) {
            attendance = attendance.filter(a => {
                const attDate = new Date(a.date);
                const monthMatch = month ? attDate.getMonth() + 1 === parseInt(month) : true;
                const yearMatch = year ? attDate.getFullYear() === parseInt(year) : true;
                return monthMatch && yearMatch;
            });
        }

        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const leave = attendance.filter(a => a.status === 'Leave').length;

        res.send({
            attendance,
            summary: { 
                present, 
                absent, 
                leave, 
                total: attendance.length,
                workingDays: attendance.length,
                presentDays: present,
                absentDays: absent,
                leaveDays: leave
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

// Export all teachers' attendance for a school
const exportTeachersAttendance = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { month, year } = req.query;

        // Convert to ObjectId if valid
        const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
            ? new mongoose.Types.ObjectId(schoolId)
            : schoolId;

        // Get all teachers for the school
        const teachers = await Teacher.find({ school: schoolObjectId })
            .populate("teachSubject", "subName")
            .populate("teachSclass", "sclassName");

        if (!teachers || teachers.length === 0) {
            return res.send({ message: 'No teachers found', data: [] });
        }

        // Build export data
        const exportData = [];

        for (const teacher of teachers) {
            let attendance = teacher.attendance || [];

            // Filter by month and year if provided
            if (month || year) {
                attendance = attendance.filter(a => {
                    const attDate = new Date(a.date);
                    const monthMatch = month ? attDate.getMonth() + 1 === parseInt(month) : true;
                    const yearMatch = year ? attDate.getFullYear() === parseInt(year) : true;
                    return monthMatch && yearMatch;
                });
            }

            // If no specific month/year, limit to last 30 days for performance
            if (!month && !year && attendance.length > 30) {
                attendance = attendance.slice(-30);
            }

            for (const att of attendance) {
                // Calculate present/absent counts based on status if not stored
                const presentCount = att.presentCount || (att.status === 'Present' ? '1' : '0');
                const absentCount = att.absentCount || (att.status === 'Absent' ? '1' : '0');
                
                exportData.push({
                    'Teacher Name': teacher.name,
                    'Email': teacher.email,
                    'Subject': teacher.teachSubject?.subName || 'N/A',
                    'Class': teacher.teachSclass?.sclassName || 'N/A',
                    'Date': new Date(att.date).toLocaleDateString('en-GB'),
                    'Status': att.status,
                    'Present Count': presentCount,
                    'Absent Count': absentCount
                });
            }
        }

        // Calculate summary
        const present = exportData.filter(d => d.Status === 'Present').length;
        const absent = exportData.filter(d => d.Status === 'Absent').length;
        const leave = exportData.filter(d => d.Status === 'Leave').length;

        res.send({
            data: exportData,
            summary: {
                totalRecords: exportData.length,
                present,
                absent,
                leave
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    teacherRegister,
    teacherLogIn,
    teacherForgotPassword,
    getTeachers,
    getTeacherDetail,
    updateTeacherSubject,
    deleteTeacher,
    deleteTeachers,
    deleteTeachersByClass,
    teacherAttendance,
    getTeacherAttendanceReport,
    exportTeachersAttendance
};
