const bcrypt = require('bcrypt');
const Parent = require('../models/parentSchema.js');
const Student = require('../models/studentSchema.js');

const parentController = {
    // Register new parent/guardian
    parentRegister: async (req, res) => {
        try {
            const { 
                fatherName, fatherOccupation, fatherPhone, fatherEmail,
                motherName, motherOccupation, motherPhone, motherEmail,
                guardianName, guardianRelation, guardianPhone, guardianEmail, guardianAddress,
                school, address, phone, email, photo, students, password 
            } = req.body;
            
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);

            // Check if parent already exists by email
            const existingParent = email ? await Parent.findOne({ email, school }) : null;

            if (existingParent) {
                res.send({ message: 'Parent with this email already exists' });
            } else {
                const parent = new Parent({
                    fatherName, fatherOccupation, fatherPhone, fatherEmail,
                    motherName, motherOccupation, motherPhone, motherEmail,
                    guardianName, guardianRelation, guardianPhone, guardianEmail, guardianAddress,
                    school, address, phone, email, photo, students,
                    password: hashedPass,
                    role: 'Parent'
                });

                let result = await parent.save();
                
                // If students are provided, link them to this parent
                if (students && students.length > 0) {
                    await Student.updateMany(
                        { _id: { $in: students } },
                        { $push: { parent: result._id } }
                    );
                }

                result.password = undefined;
                res.send(result);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Parent login
    parentLogIn: async (req, res) => {
        try {
            const { email, phone, password } = req.body;
            let parent;
            
            if (email) {
                parent = await Parent.findOne({ email });
            } else if (phone) {
                parent = await Parent.findOne({ phone });
            }
            
            if (parent) {
                const validated = await bcrypt.compare(password, parent.password);
                if (validated) {
                    parent = await parent.populate("school", "schoolName");
                    parent = await parent.populate({
                        path: "students",
                        populate: { path: "sclassName", select: "sclassName" }
                    });
                    parent.password = undefined;
                    res.send(parent);
                } else {
                    res.send({ message: "Invalid password" });
                }
            } else {
                res.send({ message: "Parent not found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Forgot password
    parentForgotPassword: async (req, res) => {
        try {
            const { email, phone, newPassword } = req.body;
            if (!newPassword) {
                return res.send({ message: "New password is required" });
            }

            let parent;
            if (email) {
                parent = await Parent.findOne({ email });
            } else if (phone) {
                parent = await Parent.findOne({ phone });
            }

            if (!parent) {
                return res.send({ message: "Parent not found" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(newPassword, salt);

            await Parent.findByIdAndUpdate(parent._id, { password: hashedPass });
            parent.password = undefined;
            res.send({ message: "Password updated successfully", parent });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get all parents for a school
    getParents: async (req, res) => {
        try {
            let parents = await Parent.find({ school: req.params.id })
                .populate("students", "name rollNum sclassName");
            
            if (parents.length > 0) {
                let modifiedParents = parents.map((p) => {
                    return { ...p._doc, password: undefined };
                });
                res.send(modifiedParents);
            } else {
                res.send({ message: "No parents found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get single parent detail
    getParentDetail: async (req, res) => {
        try {
            let parent = await Parent.findById(req.params.id)
                .populate("school", "schoolName")
                .populate("students", "name rollNum sclassName photo");
            
            if (parent) {
                parent.password = undefined;
                res.send(parent);
            } else {
                res.send({ message: "No parent found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get parent by student ID
    getParentByStudent: async (req, res) => {
        try {
            const { studentId } = req.params;
            const parent = await Parent.findOne({ students: studentId })
                .populate("school", "schoolName")
                .populate("students", "name rollNum sclassName");
            
            if (parent) {
                parent.password = undefined;
                res.send(parent);
            } else {
                res.send({ message: "No parent found for this student" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Update parent
    updateParent: async (req, res) => {
        try {
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            
            let result = await Parent.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            ).populate("students", "name rollNum sclassName");

            result.password = undefined;
            res.send(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Link student to parent
    linkStudentToParent: async (req, res) => {
        try {
            const { parentId, studentId } = req.params;

            const parent = await Parent.findById(parentId);
            const student = await Student.findById(studentId);

            if (!parent || !student) {
                return res.send({ message: "Parent or Student not found" });
            }

            // Check if already linked
            if (parent.students.includes(studentId)) {
                return res.send({ message: "Student already linked to this parent" });
            }

            // Add student to parent's list
            parent.students.push(studentId);
            await parent.save();

            // Add parent reference to student
            student.parent = parentId;
            await student.save();

            parent.password = undefined;
            res.send(parent);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Unlink student from parent
    unlinkStudentFromParent: async (req, res) => {
        try {
            const { parentId, studentId } = req.params;

            const parent = await Parent.findById(parentId);
            const student = await Student.findById(studentId);

            if (!parent || !student) {
                return res.send({ message: "Parent or Student not found" });
            }

            // Remove student from parent's list
            parent.students = parent.students.filter(s => s.toString() !== studentId);
            await parent.save();

            // Remove parent reference from student
            student.parent = null;
            await student.save();

            parent.password = undefined;
            res.send(parent);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete single parent
    deleteParent: async (req, res) => {
        try {
            const parent = await Parent.findById(req.params.id);
            
            if (parent) {
                // Remove parent reference from all linked students
                await Student.updateMany(
                    { _id: { $in: parent.students } },
                    { $unset: { parent: 1 } }
                );
                
                const result = await Parent.findByIdAndDelete(req.params.id);
                res.send(result);
            } else {
                res.send({ message: "Parent not found" });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete all parents for a school
    deleteParents: async (req, res) => {
        try {
            const parents = await Parent.find({ school: req.params.id });
            
            // Remove parent reference from all linked students
            const studentIds = parents.flatMap(p => p.students);
            await Student.updateMany(
                { _id: { $in: studentIds } },
                { $unset: { parent: 1 } }
            );

            const result = await Parent.deleteMany({ school: req.params.id });
            
            if (result.deletedCount === 0) {
                res.send({ message: "No parents found to delete" });
            } else {
                res.send(result);
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get students by parent
    getStudentsByParent: async (req, res) => {
        try {
            const parent = await Parent.findById(req.params.id)
                .populate({
                    path: "students",
                    populate: { path: "sclassName", select: "sclassName" }
                });
            
            if (parent) {
                parent.password = undefined;
                res.send(parent.students);
            } else {
                res.send({ message: "Parent not found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

// Get parent dashboard data (view child's attendance, results, fees)
    getParentDashboard: async (req, res) => {
        try {
            const parent = await Parent.findById(req.params.id)
                .populate({
                    path: "students",
                    populate: [
                        { path: "sclassName", select: "sclassName" },
                        { path: "examResult.subName", select: "subName" },
                        { path: "attendance.subName", select: "subName sessions" }
                    ]
                })
                .populate("school", "schoolName");

            if (parent) {
                parent.password = undefined;
                
                // Import Fee model inside the function to avoid circular dependency
                const Fee = require('../models/feeSchema.js');
                
                // Calculate summary for each student
                const studentSummaries = await Promise.all(parent.students.map(async (student) => {
                    const totalAttendance = student.attendance?.length || 0;
                    const presentAttendance = student.attendance?.filter(a => a.status === 'Present').length || 0;
                    const attendancePercentage = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
                    
                    const totalMarks = student.examResult?.reduce((sum, r) => sum + (r.marksObtained || 0), 0) || 0;
                    const subjectCount = student.examResult?.length || 0;
                    const averageMarks = subjectCount > 0 ? totalMarks / subjectCount : 0;

                    // Get fee information for this student
                    let feeStatus = {
                        totalFee: 0,
                        paidAmount: 0,
                        dueAmount: 0,
                        status: 'No Record'
                    };
                    
                    try {
                        const feeRecord = await Fee.findOne({ student: student._id });
                        if (feeRecord && feeRecord.feeDetails) {
                            let total = 0, paid = 0, unpaid = 0;
                            
                            feeRecord.feeDetails.forEach(fee => {
                                total += fee.amount || 0;
                                if (fee.status === 'Paid') {
                                    paid += fee.amount || 0;
                                } else if (fee.status === 'Partial') {
                                    paid += fee.paidAmount || 0;
                                    unpaid += (fee.amount || 0) - (fee.paidAmount || 0);
                                } else {
                                    unpaid += fee.amount || 0;
                                }
                            });
                            
                            feeStatus = {
                                totalFee: total,
                                paidAmount: paid,
                                dueAmount: unpaid,
                                status: unpaid > 0 ? (unpaid === total ? 'Unpaid' : 'Partial') : 'Paid'
                            };
                        }
                    } catch (feeErr) {
                        console.error('Error fetching fee:', feeErr);
                    }

                    return {
                        studentId: student._id,
                        name: student.name,
                        rollNum: student.rollNum,
                        class: student.sclassName?.sclassName,
                        photo: student.photo,
                        attendancePercentage: attendancePercentage.toFixed(2),
                        attendanceCount: `${presentAttendance}/${totalAttendance}`,
                        averageMarks: averageMarks.toFixed(2),
                        subjectsCount: subjectCount,
                        examResult: student.examResult?.map(result => ({
                            subject: result.subName?.subName,
                            marksObtained: result.marksObtained
                        })) || [],
                        feeStatus: feeStatus
                    };
                }));

                res.send({
                    parent: {
                        _id: parent._id,
                        fatherName: parent.fatherName,
                        motherName: parent.motherName,
                        school: parent.school
                    },
                    students: studentSummaries,
                    linkedStudentsCount: parent.students.length
                });
            } else {
                res.send({ message: "Parent not found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
};

module.exports = parentController;

