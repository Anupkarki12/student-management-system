const mongoose = require('mongoose');
const Salary = require('../models/salarySchema');
const Teacher = require('../models/teacherSchema');
const Staff = require('../models/staffSchema');
const Subject = require('../models/subjectSchema');
const Sclass = require('../models/sclassSchema');

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
    try {
        return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    } catch (e) {
        return false;
    }
};

// Export all controller methods consistently
const salaryController = {
    // Create or update salary record
    createSalary: async (req, res) => {
        try {
            const { 
                school, 
                employeeType, 
                employeeId, 
                position, 
                baseSalary, 
                allowances, 
                deductions,
                effectiveDate 
            } = req.body;
            
            const existingSalary = await Salary.findOne({ 
                school, 
                employeeType, 
                employee: employeeId,
                status: 'active'
            });
            
            if (existingSalary) {
                existingSalary.baseSalary = baseSalary;
                existingSalary.allowances = allowances || {};
                existingSalary.deductions = deductions || {};
                existingSalary.effectiveDate = effectiveDate;
                existingSalary.position = position;
                await existingSalary.save();
                return res.status(200).json({ message: 'Salary updated successfully', salary: existingSalary });
            }
            
            const salary = new Salary({
                school,
                employeeType,
                employee: employeeId,
                position,
                baseSalary,
                allowances: allowances || {},
                deductions: deductions || {},
                effectiveDate
            });
            
            await salary.save();
            res.status(201).json({ message: 'Salary created successfully', salary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salaries by school with populated employee data
    getSalariesBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salaries = await Salary.find({ school: schoolObjectId, status: 'active' }).lean();

            // Manually populate employee data based on employeeType
            const populatedSalaries = await Promise.all(
                salaries.map(async (salary) => {
                    let employeeData = null;

                    try {
                        if (salary.employeeType === 'teacher') {
                            employeeData = await Teacher.findById(salary.employee)
                                .select('name email photo')
                                .lean();
                        } else if (salary.employeeType === 'staff') {
                            employeeData = await Staff.findById(salary.employee)
                                .select('name email photo')
                                .lean();
                        }
                    } catch (populateError) {
                        console.warn(`Failed to populate employee ${salary.employee}:`, populateError.message);
                    }

                    return {
                        ...salary,
                        employee: employeeData || {
                            name: 'Unknown',
                            email: '',
                            photo: null
                        }
                    };
                })
            );

            res.status(200).json(populatedSalaries);
        } catch (error) {
            console.error('Error in getSalariesBySchool:', error);
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salary by employee (without populate to avoid CastError)
    getSalaryByEmployee: async (req, res) => {
        try {
            const { schoolId, employeeType, employeeId } = req.params;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salary = await Salary.findOne({ 
                school: schoolObjectId, 
                employeeType, 
                employee: employeeId,
                status: 'active'
            }).lean();
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            res.status(200).json(salary);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Calculate net salary
    calculateNetSalary: async (req, res) => {
        try {
            const { salaryId } = req.params;
            const salary = await Salary.findById(salaryId);
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            const totalAllowances = 
                (salary.allowances?.houseRent || 0) +
                (salary.allowances?.medical || 0) +
                (salary.allowances?.transport || 0) +
                (salary.allowances?.other || 0);
            
            const totalDeductions = 
                (salary.deductions?.providentFund || 0) +
                (salary.deductions?.tax || 0) +
                (salary.deductions?.insurance || 0) +
                (salary.deductions?.other || 0);
            
            const netSalary = salary.baseSalary + totalAllowances - totalDeductions;
            
            res.status(200).json({
                baseSalary: salary.baseSalary,
                totalAllowances,
                totalDeductions,
                netSalary
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Record single payment
    recordPayment: async (req, res) => {
        try {
            const { salaryId } = req.params;
            const { month, year, amount, paymentMethod, paymentDate } = req.body;
            
            const salary = await Salary.findById(salaryId);
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            salary.paymentHistory.push({
                month,
                year,
                amount,
                paymentDate: paymentDate || new Date(),
                status: 'paid',
                paymentMethod
            });
            
            await salary.save();
            res.status(200).json({ message: 'Payment recorded successfully', salary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get payment history
    getPaymentHistory: async (req, res) => {
        try {
            const { salaryId } = req.params;
            const salary = await Salary.findById(salaryId);
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            res.status(200).json(salary.paymentHistory);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Delete salary record
    deleteSalary: async (req, res) => {
        try {
            const { id } = req.params;
            await Salary.findByIdAndUpdate(id, { status: 'inactive' });
            res.status(200).json({ message: 'Salary record deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salary summary for school
    getSalarySummary: async (req, res) => {
        try {
            const { schoolId } = req.params;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salaries = await Salary.find({ school: schoolObjectId, status: 'active' });
            
            const summary = {
                totalBaseSalary: 0,
                totalAllowances: 0,
                totalDeductions: 0,
                totalNetSalary: 0,
                byEmployeeType: {
                    teacher: { count: 0, total: 0 },
                    staff: { count: 0, total: 0 },
                    admin: { count: 0, total: 0 }
                }
            };
            
            salaries.forEach(salary => {
                const totalAllowances = 
                    (salary.allowances?.houseRent || 0) +
                    (salary.allowances?.medical || 0) +
                    (salary.allowances?.transport || 0) +
                    (salary.allowances?.other || 0);
                
                const totalDeductions = 
                    (salary.deductions?.providentFund || 0) +
                    (salary.deductions?.tax || 0) +
                    (salary.deductions?.insurance || 0) +
                    (salary.deductions?.other || 0);
                
                const netSalary = salary.baseSalary + totalAllowances - totalDeductions;
                
                summary.totalBaseSalary += salary.baseSalary;
                summary.totalAllowances += totalAllowances;
                summary.totalDeductions += totalDeductions;
                summary.totalNetSalary += netSalary;
                
                if (summary.byEmployeeType[salary.employeeType]) {
                    summary.byEmployeeType[salary.employeeType].count++;
                    summary.byEmployeeType[salary.employeeType].total += netSalary;
                }
            });
            
            res.status(200).json(summary);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // NEW ENDPOINTS FOR SALARY MANAGEMENT

    // Get all employees (teachers/staff) with their salary status
    getEmployeesWithSalaryStatus: async (req, res) => {
        try {
            const { schoolId, employeeType } = req.params;
            
            console.log('=== getEmployeesWithSalaryStatus called ===');
            console.log('schoolId:', schoolId);
            console.log('employeeType:', employeeType);

            // Validate schoolId
            if (!schoolId) {
                console.error('School ID is missing');
                return res.status(400).json({ error: 'School ID is required' });
            }

            // Convert to ObjectId if valid - THIS IS THE CRITICAL FIX
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            console.log('schoolObjectId:', schoolObjectId);

            let employees = [];
            let employeeSalaries = [];
            
            // Fetch employees based on type
            if (employeeType === 'teacher') {
                // Fetch teachers with minimal populate to avoid errors
                employees = await Teacher.find({ school: schoolObjectId })
                    .select('-password')
                    .lean();
                
                // Get subject and class info separately to avoid deep populate issues
                const subjectIds = [...new Set(employees.map(t => t.teachSubject).filter(Boolean))];
                const classIds = [...new Set(employees.map(t => t.teachSclass).filter(Boolean))];
                
                const subjects = subjectIds.length > 0 ? 
                    await Subject.find({ _id: { $in: subjectIds } }).select('subName').lean() : [];
                const classes = classIds.length > 0 ? 
                    await Sclass.find({ _id: { $in: classIds } }).select('sclassName').lean() : [];
                
                const subjectMap = new Map(subjects.map(s => [s._id.toString(), s]));
                const classMap = new Map(classes.map(c => [c._id.toString(), c]));
                
                // Enrich teachers with subject/class info
                employees = employees.map(emp => ({
                    ...emp,
                    teachSubject: emp.teachSubject ? (subjectMap.get(emp.teachSubject.toString()) || { subName: 'Unknown' }) : null,
                    teachSclass: emp.teachSclass ? (classMap.get(emp.teachSclass.toString()) || { sclassName: 'Not Assigned' }) : null
                }));
                
                // Fetch salaries for teachers
                employeeSalaries = await Salary.find({ 
                    school: schoolObjectId, 
                    employeeType: 'teacher', 
                    status: 'active' 
                }).lean();
                
            } else if (employeeType === 'staff') {
                // Fetch staff
                employees = await Staff.find({ school: schoolObjectId })
                    .select('-password')
                    .lean();
                
                // Fetch salaries for staff
                employeeSalaries = await Salary.find({ 
                    school: schoolObjectId, 
                    employeeType: 'staff', 
                    status: 'active' 
                }).lean();
            } else if (employeeType === 'all') {
                // Fetch both teachers and staff
                const teachers = await Teacher.find({ school: schoolObjectId })
                    .select('-password')
                    .lean();
                
                const staffs = await Staff.find({ school: schoolObjectId })
                    .select('-password')
                    .lean();
                
                const subjectIds = [...new Set(teachers.map(t => t.teachSubject).filter(Boolean))];
                const classIds = [...new Set(teachers.map(t => t.teachSclass).filter(Boolean))];
                
                const subjects = subjectIds.length > 0 ? 
                    await Subject.find({ _id: { $in: subjectIds } }).select('subName').lean() : [];
                const classes = classIds.length > 0 ? 
                    await Sclass.find({ _id: { $in: classIds } }).select('sclassName').lean() : [];
                
                const subjectMap = new Map(subjects.map(s => [s._id.toString(), s]));
                const classMap = new Map(classes.map(c => [c._id.toString(), c]));
                
                const enrichedTeachers = teachers.map(emp => ({
                    ...emp,
                    teachSubject: emp.teachSubject ? (subjectMap.get(emp.teachSubject.toString()) || { subName: 'Unknown' }) : null,
                    teachSclass: emp.teachSclass ? (classMap.get(emp.teachSclass.toString()) || { sclassName: 'Not Assigned' }) : null
                }));
                
                const teacherSalaries = await Salary.find({ 
                    school: schoolObjectId, 
                    employeeType: 'teacher', 
                    status: 'active' 
                }).lean();
                
                const staffSalaries = await Salary.find({ 
                    school: schoolObjectId, 
                    employeeType: 'staff', 
                    status: 'active' 
                }).lean();
                
                employees = [
                    ...enrichedTeachers.map(t => ({ ...t, employeeType: 'teacher' })),
                    ...staffs.map(s => ({ ...s, employeeType: 'staff' }))
                ];
                employeeSalaries = [...teacherSalaries, ...staffSalaries];
            } else {
                return res.status(400).json({ error: 'Invalid employee type. Must be teacher, staff, or all' });
            }
            
            // If no employees found, return empty array with proper message
            if (employees.length === 0) {
                console.log(`No ${employeeType}s found for school ${schoolId}`);
                return res.status(200).json([]);
            }
            
            // Create a map of salary records for faster lookup
            const salaryMap = new Map();
            employeeSalaries.forEach(salary => {
                const empId = salary.employee ? salary.employee.toString() : null;
                const type = salary.employeeType;
                if (empId) {
                    const key = `${empId}-${type}`;
                    salaryMap.set(key, salary);
                }
            });
            
            // Combine employees with their salary info
            const employeesWithSalary = employees.map(employee => {
                const employeeId = employee._id.toString();
                const type = employee.employeeType || employeeType;
                const salaryKey = `${employeeId}-${type}`;
                const salaryRecord = salaryMap.get(salaryKey);
                
                const totalAllowances = salaryRecord ? 
                    (salaryRecord.allowances?.houseRent || 0) +
                    (salaryRecord.allowances?.medical || 0) +
                    (salaryRecord.allowances?.transport || 0) +
                    (salaryRecord.allowances?.other || 0) : 0;
                
                const totalDeductions = salaryRecord ? 
                    (salaryRecord.deductions?.providentFund || 0) +
                    (salaryRecord.deductions?.tax || 0) +
                    (salaryRecord.deductions?.insurance || 0) +
                    (salaryRecord.deductions?.other || 0) : 0;
                
                const netSalary = salaryRecord ? salaryRecord.baseSalary + totalAllowances - totalDeductions : 0;
                
                // Find last payment
                let lastPaid = null;
                let lastPaymentStatus = 'pending';
                if (salaryRecord?.paymentHistory?.length > 0) {
                    const sortedHistory = [...salaryRecord.paymentHistory].sort((a, b) => 
                        new Date(b.paymentDate) - new Date(a.paymentDate)
                    );
                    lastPaid = sortedHistory[0];
                    lastPaymentStatus = sortedHistory[0].status;
                }
                
                // Get position based on type
                let position = 'Staff';
                let className = '';
                
                if (type === 'teacher') {
                    position = employee.teachSubject?.subName || 'Teacher';
                    className = employee.teachSclass?.sclassName || 'Not Assigned';
                } else {
                    position = employee.position || 'Staff';
                }
                
                return {
                    _id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    photo: employee.photo,
                    employeeType: type,
                    position: position,
                    className: className,
                    baseSalary: salaryRecord?.baseSalary || 0,
                    totalAllowances,
                    totalDeductions,
                    netSalary,
                    hasSalaryRecord: !!salaryRecord,
                    salaryId: salaryRecord?._id ? salaryRecord._id.toString() : null,
                    lastPaid,
                    lastPaymentStatus
                };
            });
            
            res.status(200).json(employeesWithSalary);
        } catch (error) {
            console.error('Error in getEmployeesWithSalaryStatus:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    },

    // Bulk salary payment
    bulkSalaryPayment: async (req, res) => {
        try {
            const { schoolId, month, year, payments, paymentMethod } = req.body;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const results = [];
            
            for (const payment of payments) {
                const { employeeId, employeeType, salaryId, amount } = payment;
                
                let salary = null;
                if (salaryId) {
                    salary = await Salary.findById(salaryId);
                } else {
                    salary = await Salary.findOne({ 
                        school: schoolObjectId, 
                        employeeType, 
                        employee: employeeId,
                        status: 'active'
                    });
                }
                
                if (salary) {
                    salary.paymentHistory.push({
                        month,
                        year,
                        amount,
                        paymentDate: new Date(),
                        status: 'paid',
                        paymentMethod
                    });
                    await salary.save();
                    results.push({ employeeId, status: 'success', salaryId: salary._id });
                } else {
                    results.push({ employeeId, status: 'failed', error: 'Salary record not found' });
                }
            }
            
            res.status(200).json({ 
                message: 'Bulk payment processed', 
                results,
                successful: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'failed').length
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get payments by month and year (without populate to avoid CastError)
    getSalaryByMonthYear: async (req, res) => {
        try {
            const { schoolId, month, year } = req.params;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salaries = await Salary.find({ 
                school: schoolObjectId, 
                status: 'active',
                'paymentHistory.month': month,
                'paymentHistory.year': parseInt(year)
            }).lean();
            
            // Flatten payment history for the specific month
            const payments = [];
            salaries.forEach(salary => {
                const monthPayments = salary.paymentHistory.filter(
                    p => p.month === month && p.year === parseInt(year)
                );
                monthPayments.forEach(payment => {
                    payments.push({
                        salaryId: salary._id,
                        employeeType: salary.employeeType,
                        position: salary.position,
                        amount: payment.amount,
                        paymentDate: payment.paymentDate,
                        status: payment.status,
                        paymentMethod: payment.paymentMethod
                    });
                });
            });
            
            res.status(200).json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update salary structure
    updateSalary: async (req, res) => {
        try {
            const { salaryId } = req.params;
            const { baseSalary, allowances, deductions, position } = req.body;
            
            const salary = await Salary.findById(salaryId);
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            if (baseSalary !== undefined) salary.baseSalary = baseSalary;
            if (allowances !== undefined) salary.allowances = { ...salary.allowances, ...allowances };
            if (deductions !== undefined) salary.deductions = { ...salary.deductions, ...deductions };
            if (position !== undefined) salary.position = position;
            
            await salary.save();
            res.status(200).json({ message: 'Salary updated successfully', salary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get payment history for specific employee (without populate to avoid CastError)
    getEmployeePaymentHistory: async (req, res) => {
        try {
            const { schoolId, employeeType, employeeId } = req.params;
            
            // Convert to ObjectId if valid
            const schoolObjectId = mongoose.Types.ObjectId.isValid(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salary = await Salary.findOne({ 
                school: schoolObjectId, 
                employeeType, 
                employee: employeeId,
                status: 'active'
            }).lean();
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            res.status(200).json({
                salaryId: salary._id,
                baseSalary: salary.baseSalary,
                position: salary.position,
                paymentHistory: salary.paymentHistory.sort((a, b) => 
                    new Date(b.paymentDate) - new Date(a.paymentDate)
                )
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = salaryController;

