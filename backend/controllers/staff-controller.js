const bcrypt = require('bcrypt');
const Staff = require('../models/staffSchema.js');

const staffController = {
    // Register new staff
    staffRegister: async (req, res) => {
        try {
            const { name, email, password, role, school, position, department, phone, address, photo, salary, employmentDate } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(password, salt);

            const existingStaff = await Staff.findOne({ email });

            if (existingStaff) {
                res.send({ message: 'Email already exists' });
            } else {
                const staff = new Staff({
                    name, email, password: hashedPass, role: role || 'Staff', school, position, department, phone, address, photo, salary, employmentDate
                });

                let result = await staff.save();
                result.password = undefined;
                res.send(result);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Staff login
    staffLogIn: async (req, res) => {
        try {
            let staff = await Staff.findOne({ email: req.body.email });
            if (staff) {
                const validated = await bcrypt.compare(req.body.password, staff.password);
                if (validated) {
                    staff = await staff.populate("school", "schoolName");
                    staff.password = undefined;
                    res.send(staff);
                } else {
                    res.send({ message: "Invalid password" });
                }
            } else {
                res.send({ message: "Staff not found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Forgot password
    staffForgotPassword: async (req, res) => {
        try {
            const { email, newPassword } = req.body;
            if (!email || !newPassword) {
                return res.send({ message: "Email and new password are required" });
            }

            const staff = await Staff.findOne({ email });
            if (!staff) {
                return res.send({ message: "Staff not found" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPass = await bcrypt.hash(newPassword, salt);

            await Staff.findByIdAndUpdate(staff._id, { password: hashedPass });
            staff.password = undefined;
            res.send({ message: "Password updated successfully", staff });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get all staff for a school
    getStaffs: async (req, res) => {
        try {
            let staff = await Staff.find({ school: req.params.id });
            if (staff.length > 0) {
                let modifiedStaff = staff.map((s) => {
                    return { ...s._doc, password: undefined };
                });
                res.send(modifiedStaff);
            } else {
                res.send({ message: "No staff found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Get single staff detail
    getStaffDetail: async (req, res) => {
        try {
            let staff = await Staff.findById(req.params.id)
                .populate("school", "schoolName");
            if (staff) {
                staff.password = undefined;
                res.send(staff);
            } else {
                res.send({ message: "No staff found" });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Update staff
    updateStaff: async (req, res) => {
        try {
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            
            let result = await Staff.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true }
            );

            result.password = undefined;
            res.send(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete single staff
    deleteStaff: async (req, res) => {
        try {
            const result = await Staff.findByIdAndDelete(req.params.id);
            res.send(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Delete all staff for a school
    deleteStaffs: async (req, res) => {
        try {
            const result = await Staff.deleteMany({ school: req.params.id });
            if (result.deletedCount === 0) {
                res.send({ message: "No staff found to delete" });
            } else {
                res.send(result);
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Staff attendance
    staffAttendance: async (req, res) => {
        const { status, date, inTime, outTime } = req.body;

        try {
            const staff = await Staff.findById(req.params.id);

            if (!staff) {
                return res.send({ message: 'Staff not found' });
            }

            const existingAttendance = staff.attendance.find(
                (a) => a.date.toDateString() === new Date(date).toDateString()
            );

            if (existingAttendance) {
                existingAttendance.status = status;
                existingAttendance.inTime = inTime || existingAttendance.inTime;
                existingAttendance.outTime = outTime || existingAttendance.outTime;
            } else {
                staff.attendance.push({ date, status, inTime, outTime });
            }

            const result = await staff.save();
            return res.send(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get staff attendance report
    getStaffAttendanceReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { month, year } = req.query;

            const staff = await Staff.findById(id);
            if (!staff) {
                return res.send({ message: 'Staff not found' });
            }

            const attendance = staff.attendance.filter(a => {
                const attDate = new Date(a.date);
                return month ? attDate.getMonth() + 1 === parseInt(month) : true &&
                       year ? attDate.getFullYear() === parseInt(year) : true;
            });

            const present = attendance.filter(a => a.status === 'Present').length;
            const absent = attendance.filter(a => a.status === 'Absent').length;
            const leave = attendance.filter(a => a.status === 'Leave').length;

            res.send({
                attendance,
                summary: { present, absent, leave, total: attendance.length }
            });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Update salary
    updateSalary: async (req, res) => {
        try {
            const { id } = req.params;
            const { salary } = req.body;

            const staff = await Staff.findByIdAndUpdate(
                id,
                { salary },
                { new: true }
            );

            if (staff) {
                staff.password = undefined;
                res.send(staff);
            } else {
                res.send({ message: 'Staff not found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Calculate net salary
    calculateNetSalary: async (req, res) => {
        try {
            const staff = await Staff.findById(req.params.id);
            
            if (!staff) {
                return res.send({ message: 'Staff not found' });
            }

            const totalAllowances = 
                (staff.salary.allowances.houseRent || 0) +
                (staff.salary.allowances.medical || 0) +
                (staff.salary.allowances.transport || 0) +
                (staff.salary.allowances.other || 0);
            
            const totalDeductions = 
                (staff.salary.deductions.providentFund || 0) +
                (staff.salary.deductions.tax || 0) +
                (staff.salary.deductions.insurance || 0) +
                (staff.salary.deductions.other || 0);
            
            const netSalary = staff.salary.baseSalary + totalAllowances - totalDeductions;

            res.send({
                baseSalary: staff.salary.baseSalary,
                totalAllowances,
                totalDeductions,
                netSalary
            });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get salary summary for school
    getSalarySummary: async (req, res) => {
        try {
            const { schoolId } = req.params;
            const staff = await Staff.find({ school: schoolId, status: 'Active' });
            
            let totalBaseSalary = 0;
            let totalAllowances = 0;
            let totalDeductions = 0;
            let totalNetSalary = 0;

            const staffList = staff.map(s => {
                const allowances = 
                    (s.salary.allowances.houseRent || 0) +
                    (s.salary.allowances.medical || 0) +
                    (s.salary.allowances.transport || 0) +
                    (s.salary.allowances.other || 0);
                
                const deductions = 
                    (s.salary.deductions.providentFund || 0) +
                    (s.salary.deductions.tax || 0) +
                    (s.salary.deductions.insurance || 0) +
                    (s.salary.deductions.other || 0);
                
                const netSalary = s.salary.baseSalary + allowances - deductions;

                totalBaseSalary += s.salary.baseSalary;
                totalAllowances += allowances;
                totalDeductions += deductions;
                totalNetSalary += netSalary;

                return {
                    _id: s._id,
                    name: s.name,
                    position: s.position,
                    department: s.department,
                    baseSalary: s.salary.baseSalary,
                    totalAllowances: allowances,
                    totalDeductions: deductions,
                    netSalary
                };
            });

            res.send({
                staff: staffList,
                summary: {
                    totalBaseSalary,
                    totalAllowances,
                    totalDeductions,
                    totalNetSalary,
                    staffCount: staff.length
                }
            });
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Clear all attendance for staff
    clearStaffAttendance: async (req, res) => {
        try {
            const result = await Staff.updateOne(
                { _id: req.params.id },
                { $set: { attendance: [] } }
            );
            res.send(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    // Get salary summary for all staff in school
    getStaffSalarySummary: async (req, res) => {
        try {
            const { schoolId } = req.params;
            const staff = await Staff.find({ school: schoolId, status: 'Active' });

            let totalBaseSalary = 0;
            let totalAllowances = 0;
            let totalDeductions = 0;
            let totalNetSalary = 0;

            const staffList = staff.map(s => {
                const allowances =
                    (s.salary.allowances.houseRent || 0) +
                    (s.salary.allowances.medical || 0) +
                    (s.salary.allowances.transport || 0) +
                    (s.salary.allowances.other || 0);

                const deductions =
                    (s.salary.deductions.providentFund || 0) +
                    (s.salary.deductions.tax || 0) +
                    (s.salary.deductions.insurance || 0) +
                    (s.salary.deductions.other || 0);

                const netSalary = s.salary.baseSalary + allowances - deductions;

                totalBaseSalary += s.salary.baseSalary;
                totalAllowances += allowances;
                totalDeductions += deductions;
                totalNetSalary += netSalary;

                return {
                    _id: s._id,
                    name: s.name,
                    position: s.position,
                    department: s.department,
                    baseSalary: s.salary.baseSalary,
                    totalAllowances: allowances,
                    totalDeductions: deductions,
                    netSalary
                };
            });

            res.send({
                staff: staffList,
                summary: {
                    totalBaseSalary,
                    totalAllowances,
                    totalDeductions,
                    totalNetSalary,
                    staffCount: staff.length
                }
            });
        } catch (error) {
            res.status(500).json(error);
        }
    }
};

module.exports = staffController;

