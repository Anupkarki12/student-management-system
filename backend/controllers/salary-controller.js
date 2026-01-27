const Salary = require('../models/salarySchema');
const Teacher = require('../models/teacherSchema');
const Admin = require('../models/adminSchema');

const salaryController = {
    // Create salary record
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
                existingSalary.allowances = allowances;
                existingSalary.deductions = deductions;
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
                allowances,
                deductions,
                effectiveDate
            });
            
            await salary.save();
            res.status(201).json({ message: 'Salary created successfully', salary });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salaries by school
    getSalariesBySchool: async (req, res) => {
        try {
            const { schoolId } = req.params;
            const salaries = await Salary.find({ school: schoolId, status: 'active' })
                .populate('employee', 'name email');
            res.status(200).json(salaries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Get salary by employee
    getSalaryByEmployee: async (req, res) => {
        try {
            const { schoolId, employeeType, employeeId } = req.params;
            const salary = await Salary.findOne({ 
                school: schoolId, 
                employeeType, 
                employee: employeeId,
                status: 'active'
            }).populate('employee', 'name email');
            
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
                (salary.allowances.houseRent || 0) +
                (salary.allowances.medical || 0) +
                (salary.allowances.transport || 0) +
                (salary.allowances.other || 0);
            
            const totalDeductions = 
                (salary.deductions.providentFund || 0) +
                (salary.deductions.tax || 0) +
                (salary.deductions.insurance || 0) +
                (salary.deductions.other || 0);
            
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
    
    // Record payment
    recordPayment: async (req, res) => {
        try {
            const { salaryId } = req.params;
            const { month, year, amount, paymentMethod } = req.body;
            
            const salary = await Salary.findById(salaryId);
            
            if (!salary) {
                return res.status(404).json({ error: 'Salary record not found' });
            }
            
            salary.paymentHistory.push({
                month,
                year,
                amount,
                paymentDate: new Date(),
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
            const salaries = await Salary.find({ school: schoolId, status: 'active' });
            
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
                    (salary.allowances.houseRent || 0) +
                    (salary.allowances.medical || 0) +
                    (salary.allowances.transport || 0) +
                    (salary.allowances.other || 0);
                
                const totalDeductions = 
                    (salary.deductions.providentFund || 0) +
                    (salary.deductions.tax || 0) +
                    (salary.deductions.insurance || 0) +
                    (salary.deductions.other || 0);
                
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
    }
};

module.exports = salaryController;

