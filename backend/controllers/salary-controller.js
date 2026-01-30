const mongoose = require('mongoose');
const Salary = require('../models/salarySchema');
const Teacher = require('../models/teacherSchema');
const Staff = require('../models/staffSchema');
const Subject = require('../models/subjectSchema');
const Sclass = require('../models/sclassSchema');

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
    try {
        if (!id || typeof id !== 'string') return false;
        return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    } catch (e) {
        return false;
    }
};

// Helper function to safely convert string to ObjectId
const toObjectId = (id) => {
    try {
        if (isValidObjectId(id)) {
            return new mongoose.Types.ObjectId(id);
        }
        return id; // Return as-is if not a valid ObjectId (for testing or edge cases)
    } catch (e) {
        return id;
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

            // ✅ FIX: Validate employeeId is a valid ObjectId
            if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json({ error: "Invalid employee ID. Must be a valid ObjectId." });
            }

            // ✅ FIX: Validate employeeType
            if (!employeeType || !['teacher', 'staff', 'admin'].includes(employeeType)) {
                return res.status(400).json({ error: "Invalid employee type. Must be teacher, staff, or admin." });
            }
            
            const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
            
            const existingSalary = await Salary.findOne({ 
                school, 
                employeeType, 
                employee: employeeObjectId,
                status: 'active'
            });
            
            // Calculate total allowances and deductions
            const totalAllowances = 
                (allowances?.houseRent || 0) +
                (allowances?.medical || 0) +
                (allowances?.transport || 0) +
                (allowances?.other || 0);
            
            const totalDeductions = 
                (deductions?.providentFund || 0) +
                (deductions?.tax || 0) +
                (deductions?.insurance || 0) +
                (deductions?.other || 0);
            
            const netSalary = baseSalary + totalAllowances - totalDeductions;
            
            if (existingSalary) {
                existingSalary.baseSalary = baseSalary;
                existingSalary.allowances = allowances || {};
                existingSalary.deductions = deductions || {};
                existingSalary.effectiveDate = effectiveDate;
                existingSalary.position = position;
                await existingSalary.save();
                
                // Also update the employee's salary field in their schema
                const salaryData = {
                    baseSalary,
                    allowances: allowances || {},
                    deductions: deductions || {},
                    netSalary
                };
                
                if (employeeType === 'teacher') {
                    await Teacher.findByIdAndUpdate(employeeId, { salary: salaryData });
                } else if (employeeType === 'staff') {
                    await Staff.findByIdAndUpdate(employeeId, { salary: salaryData });
                }
                
                return res.status(200).json({ message: 'Salary updated successfully', salary: existingSalary });
            }
            
            const salary = new Salary({
                school,
                employeeType,
                employee: employeeObjectId, // ✅ Must be ObjectId
                position,
                baseSalary,
                allowances: allowances || {},
                deductions: deductions || {},
                effectiveDate
            });
            
            await salary.save();
            
            // Also update the employee's salary field in their schema
            const salaryData = {
                baseSalary,
                allowances: allowances || {},
                deductions: deductions || {},
                netSalary
            };
            
            if (employeeType === 'teacher') {
                await Teacher.findByIdAndUpdate(employeeId, { salary: salaryData });
            } else if (employeeType === 'staff') {
                await Staff.findByIdAndUpdate(employeeId, { salary: salaryData });
            }
            
            res.status(201).json({ message: 'Salary created successfully', salary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Utility endpoint to clean up corrupted salary records
    cleanupCorruptedSalaries: async (req, res) => {
        try {
            // Find and delete records where employee is a string instead of ObjectId
            const corruptedRecords = await Salary.find({
                employee: { $type: "string" }
            });

            const deletedCount = await Salary.deleteMany({
                employee: { $type: "string" }
            });

            console.log(`Found ${corruptedRecords.length} corrupted salary records`);
            console.log(`Deleted ${deletedCount.deletedCount} corrupted records`);

            return res.status(200).json({ 
                message: 'Cleanup completed',
                found: corruptedRecords.length,
                deleted: deletedCount.deletedCount
            });
        } catch (error) {
            console.error("Cleanup error:", error);
            return res.status(500).json({ error: error.message });
        }
    },
    
    // Helper function to check if a string is a valid MongoDB ObjectId
    isValidObjectId: function(id) {
        try {
            if (!id || typeof id !== 'string') return false;
            return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
        } catch (e) {
            return false;
        }
    },

    // Get salaries by school with populated employee data
    getSalariesBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            
            // Convert to ObjectId if valid (use module-level function, not this.isValidObjectId)
            const schoolObjectId = isValidObjectId(schoolId)
                ? new mongoose.Types.ObjectId(schoolId)
                : schoolId;
            
            const salaries = await Salary.find({ school: schoolObjectId, status: 'active' }).lean();

            // Filter out corrupted records where employee is not a valid ObjectId (use module-level function)
            const validSalaries = salaries.filter(salary => {
                const employeeId = salary.employee;
                const isValid = isValidObjectId(employeeId);
                if (!isValid) {
                    console.warn(`⚠️ Skipping corrupted salary record ${salary._id}: employee field is "${employeeId}" (expected ObjectId)`);
                }
                return isValid;
            });

            const corruptedCount = salaries.length - validSalaries.length;
            if (corruptedCount > 0) {
                console.warn(`⚠️ Found ${corruptedCount} corrupted salary records in school ${schoolId}. Consider running cleanup.`);
            }

            // Manually populate employee data based on employeeType
            const populatedSalaries = await Promise.all(
                validSalaries.map(async (salary) => {
                    let employeeData = null;

                    try {
                        const employeeId = salary.employee;

                        if (salary.employeeType === 'teacher') {
                            employeeData = await Teacher.findById(employeeId)
                                .select('name email photo')
                                .lean();
                        } else if (salary.employeeType === 'staff') {
                            employeeData = await Staff.findById(employeeId)
                                .select('name email photo')
                                .lean();
                        }
                    } catch (populateError) {
                        console.warn(`Failed to populate employee ${salary.employee}:`, populateError.message);
                    }

                    return {
                        ...salary,
                        employee: employeeData || {
                            _id: salary.employee,
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
            // Check if it's a CastError
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    error: 'Invalid data format in salary records. Please check the data.',
                    details: error.message,
                    hint: 'Run cleanup: POST /Salary/Cleanup'
                });
            }
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salary by employee (without populate to avoid CastError)
    getSalaryByEmployee: async (req, res) => {
        try {
            const { schoolId, employeeType, employeeId } = req.params;
            
            // Validate employeeId is a valid ObjectId
            if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId) || employeeId.length !== 24) {
                return res.status(400).json({ error: "Invalid employee ID format" });
            }
            
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
            console.error('Error in getSalaryByEmployee:', error);
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
            const { month, year } = req.query; // Accept month/year as query params

            if (!employeeType) {
                return res.status(400).json({ error: "Employee type is required" });
            }

            const type = employeeType.toLowerCase();

            if (!mongoose.Types.ObjectId.isValid(schoolId)) {
                return res.status(400).json({ error: "Invalid school ID" });
            }

            const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

            let employees = [];
            let employeeSalaries = [];

            if (type === "teacher") {
                employees = await Teacher.find({ school: schoolObjectId })
                    .select("-password")
                    .lean();

            // Build query for salary records - filter by month/year if provided
                const salaryQuery = {
                    school: schoolObjectId,
                    employeeType: "teacher",
                    status: "active"
                };
                
                // If month and year are provided, we need to show all employees with their salary status
                // For employees who have salary records but no payment for this month, they should still appear
                // So we don't filter by payment history in the salary query - we fetch all active salaries
                
                employeeSalaries = await Salary.find(salaryQuery).lean();

            } else if (type === "staff") {
                employees = await Staff.find({ school: schoolObjectId })
                    .select("-password")
                    .lean();

                // Build query for salary records - filter by month/year if provided
                const salaryQuery = {
                    school: schoolObjectId,
                    employeeType: "staff",
                    status: "active"
                };
                
                // If month and year are provided, we need to show all employees with their salary status
                // For employees who have salary records but no payment for this month, they should still appear
                // So we don't filter by payment history in the salary query - we fetch all active salaries
                
                employeeSalaries = await Salary.find(salaryQuery).lean();
            } else {
                return res.status(400).json({ error: "Invalid employee type" });
            }

            // 🛡️ Filter out corrupted salary records (where employee is not a valid ObjectId)
            const validSalaries = employeeSalaries.filter(salary => {
                const employeeId = salary.employee;
                const isValid = mongoose.Types.ObjectId.isValid(employeeId) && 
                               (typeof employeeId === 'string' ? employeeId.length === 24 : true);
                if (!isValid) {
                    console.warn(`⚠️ Skipping corrupted salary record for employee: "${employeeId}"`);
                }
                return isValid;
            });

            const corruptedCount = employeeSalaries.length - validSalaries.length;
            if (corruptedCount > 0) {
                console.warn(`⚠️ Found ${corruptedCount} corrupted salary records in ${type} salaries`);
            }

            const salaryMap = new Map();
            validSalaries.forEach(s => {
                if (s.employee) {
                    try {
                        salaryMap.set(s.employee.toString(), s);
                    } catch (e) {
                        console.warn(`⚠️ Could not process salary record:`, s._id);
                    }
                }
            });

            // Helper function to calculate total allowances from salary
            const calculateTotalAllowances = (salary) => {
                if (!salary) return 0;
                return (salary.allowances?.houseRent || 0) +
                       (salary.allowances?.medical || 0) +
                       (salary.allowances?.transport || 0) +
                       (salary.allowances?.other || 0);
            };

            // Helper function to calculate total deductions from salary
            const calculateTotalDeductions = (salary) => {
                if (!salary) return 0;
                return (salary.deductions?.providentFund || 0) +
                       (salary.deductions?.tax || 0) +
                       (salary.deductions?.insurance || 0) +
                       (salary.deductions?.other || 0);
            };

            // Helper function to get payment status for specific month/year
            const getPaymentStatusForMonth = (salary, queryMonth, queryYear) => {
                if (!salary || !salary.paymentHistory || salary.paymentHistory.length === 0) {
                    return { isPaid: false, lastPaid: null, currentMonthPaid: false };
                }
                
                // If query month/year provided, check if paid for that specific month
                if (queryMonth && queryYear) {
                    const payment = salary.paymentHistory.find(
                        p => p.month === queryMonth && p.year === parseInt(queryYear)
                    );
                    if (payment) {
                        return { 
                            isPaid: true, 
                            lastPaid: { month: payment.month, year: payment.year, status: payment.status },
                            currentMonthPaid: true,
                            paymentAmount: payment.amount
                        };
                    }
                    // If no payment found for this month, return null to indicate not paid
                    return { 
                        isPaid: false, 
                        lastPaid: null,
                        currentMonthPaid: false 
                    };
                }
                
                // Get the most recent payment regardless of month
                const sortedPayments = [...salary.paymentHistory].sort(
                    (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
                );
                const lastPayment = sortedPayments[0];
                return { 
                    isPaid: true, 
                    lastPaid: { month: lastPayment.month, year: lastPayment.year, status: lastPayment.status },
                    currentMonthPaid: true,
                    paymentAmount: lastPayment.amount
                };
            };

            // Build employee salary data
            const employeeSalaryData = employees.map(emp => {
                const salary = salaryMap.get(emp._id.toString());
                const totalAllowances = calculateTotalAllowances(salary);
                const totalDeductions = calculateTotalDeductions(salary);
                const netSalary = salary ? salary.baseSalary + totalAllowances - totalDeductions : 0;
                
                // Get payment status for the selected month/year
                const paymentStatus = getPaymentStatusForMonth(salary, month, year);
                
                return {
                    _id: emp._id,
                    name: emp.name,
                    email: emp.email,
                    employeeType: type,
                    position: salary?.position || emp.position || type,
                    baseSalary: salary?.baseSalary || 0,
                    hasSalaryRecord: !!salary,
                    salaryId: salary?._id || null,
                    totalAllowances,
                    totalDeductions,
                    netSalary,
                    lastPaid: paymentStatus.lastPaid,
                    lastPaymentStatus: paymentStatus.currentMonthPaid ? 'paid' : (paymentStatus.lastPaid?.status || null),
                    isPaidForSelectedMonth: paymentStatus.currentMonthPaid,
                    paymentAmount: paymentStatus.paymentAmount || 0
                };
            });

            // Show ALL employees regardless of payment status
            // Just indicate whether they've been paid for the selected month
            const result = employeeSalaryData;

            console.log(`Returning ${result.length} employees for ${type}s, month: ${month}, year: ${year}`);
            return res.status(200).json(result);

        } catch (error) {
            console.error("Salary error:", error);
            return res.status(500).json({ error: error.message });
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
            
            // Validate employeeId is a valid ObjectId
            if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId) || employeeId.length !== 24) {
                return res.status(400).json({ error: "Invalid employee ID format" });
            }
            
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
            console.error('Error in getEmployeePaymentHistory:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = salaryController;

