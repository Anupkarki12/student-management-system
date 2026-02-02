/**
 * Salary Records Debug and Fix Script
 * 
 * This script diagnoses and fixes salary records that show 0.
 * Common issues:
 * 1. Corrupted employee field (string instead of ObjectId)
 * 2. Missing salary records
 * 3. Mismatch between Salary collection and employee schemas
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolManagement';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// Schemas
const SalarySchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    employeeType: { type: String, enum: ['teacher', 'staff', 'admin'] },
    employee: { type: mongoose.Schema.Types.ObjectId },
    position: String,
    baseSalary: Number,
    allowances: {
        houseRent: Number,
        medical: Number,
        transport: Number,
        other: Number
    },
    deductions: {
        providentFund: Number,
        tax: Number,
        insurance: Number,
        other: Number
    },
    paymentHistory: [{
        month: String,
        year: Number,
        amount: Number,
        paymentDate: Date,
        status: String,
        paymentMethod: String
    }],
    status: { type: String, default: 'active' }
}, { timestamps: true });

const TeacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    salary: {
        baseSalary: Number,
        allowances: Object,
        deductions: Object,
        netSalary: Number
    }
}, { timestamps: true });

const StaffSchema = new mongoose.Schema({
    name: String,
    email: String,
    salary: {
        baseSalary: Number,
        allowances: Object,
        deductions: Object,
        netSalary: Number
    }
}, { timestamps: true });

const Salary = mongoose.model('Salary', SalarySchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);
const Staff = mongoose.model('Staff', StaffSchema);

// Helper to check if string is valid ObjectId
function isValidObjectId(id) {
    if (!id || typeof id !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
}

// Main diagnostic function
async function diagnoseSalaryRecords(schoolId) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SALARY RECORDS DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    
    // 1. Count all salary records
    const allSalaries = await Salary.find({ school: schoolObjectId, status: 'active' });
    console.log(`\n📊 Total salary records in database: ${allSalaries.length}`);
    
    // 2. Separate valid and corrupted records
    const validSalaries = [];
    const corruptedSalaries = [];
    
    for (const salary of allSalaries) {
        const employeeId = salary.employee?.toString();
        if (isValidObjectId(employeeId)) {
            validSalaries.push(salary);
        } else {
            corruptedSalaries.push(salary);
        }
    }
    
    console.log(`✅ Valid salary records: ${validSalaries.length}`);
    console.log(`❌ Corrupted salary records: ${corruptedSalaries.length}`);
    
    if (corruptedSalaries.length > 0) {
        console.log('\n⚠️  CORRUPTED RECORDS DETAILS:');
        corruptedSalaries.forEach((s, i) => {
            console.log(`   ${i + 1}. ID: ${s._id}`);
            console.log(`      Employee Type: ${s.employeeType}`);
            console.log(`      Employee ID: "${s.employee}"`);
            console.log(`      Position: ${s.position}`);
            console.log(`      Base Salary: ${s.baseSalary}`);
        });
    }
    
    // 3. Check teachers and staff with salary configured
    const teachersWithSalary = await Teacher.find({
        school: schoolObjectId,
        salary: { $exists: true, $ne: null },
        'salary.baseSalary': { $gt: 0 }
    });
    
    const staffWithSalary = await Staff.find({
        school: schoolObjectId,
        salary: { $exists: true, $ne: null },
        'salary.baseSalary': { $gt: 0 }
    });
    
    console.log(`\n👨‍🏫 Teachers with salary in schema: ${teachersWithSalary.length}`);
    console.log(`👷 Staff with salary in schema: ${staffWithSalary.length}`);
    
    if (teachersWithSalary.length > 0) {
        console.log('\n   Sample teachers with salary:');
        teachersWithSalary.slice(0, 3).forEach(t => {
            console.log(`   - ${t.name}: NPR ${t.salary?.baseSalary || 0}`);
        });
    }
    
    // 4. Check if valid salaries match teachers/staff
    const teacherIds = new Set(teachersWithSalary.map(t => t._id.toString()));
    const staffIds = new Set(staffWithSalary.map(s => s._id.toString()));
    
    const validTeacherSalaries = validSalaries.filter(s => 
        s.employeeType === 'teacher' && teacherIds.has(s.employee?.toString())
    );
    const validStaffSalaries = validSalaries.filter(s => 
        s.employeeType === 'staff' && staffIds.has(s.employee?.toString())
    );
    
    console.log(`\n🔗 VALID SALARY RECORDS MATCHING EMPLOYEES:`);
    console.log(`   Teacher salary records: ${validTeacherSalaries.length}`);
    console.log(`   Staff salary records: ${validStaffSalaries.length}`);
    
    // 5. Calculate total from valid records
    let totalSalaryPaid = 0;
    validSalaries.forEach(salary => {
        if (salary.paymentHistory && Array.isArray(salary.paymentHistory)) {
            const paidPayments = salary.paymentHistory.filter(p => p.status === 'paid');
            paidPayments.forEach(p => {
                totalSalaryPaid += p.amount || 0;
            });
        }
    });
    
    console.log(`\n💰 Total salary paid (from payment history): NPR ${totalSalaryPaid.toLocaleString()}`);
    
    return {
        totalRecords: allSalaries.length,
        validRecords: validSalaries.length,
        corruptedRecords: corruptedSalaries.length,
        teachersWithSalary: teachersWithSalary.length,
        staffWithSalary: staffWithSalary.length,
        totalSalaryPaid,
        validTeacherSalaries: validTeacherSalaries.length,
        validStaffSalaries: validStaffSalaries.length
    };
}

// Cleanup corrupted records
async function cleanupCorruptedSalaries(schoolId) {
    console.log('\n' + '='.repeat(60));
    console.log('🧹 CLEANING UP CORRUPTED SALARY RECORDS');
    console.log('='.repeat(60));
    
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    
    // Find corrupted records
    const corruptedSalaries = await Salary.find({
        school: schoolObjectId,
        status: 'active',
        employee: { $type: 'string' } // MongoDB query to find string employee fields
    });
    
    console.log(`Found ${corruptedSalaries.length} corrupted records`);
    
    if (corruptedSalaries.length === 0) {
        console.log('No corrupted records to delete');
        return 0;
    }
    
    // Show details before deleting
    console.log('\nRecords to be deleted:');
    corruptedSalaries.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.employeeType} - Position: ${s.position} - Salary: ${s.baseSalary}`);
    });
    
    // Delete corrupted records
    const result = await Salary.deleteMany({
        school: schoolObjectId,
        employee: { $type: 'string' }
    });
    
    console.log(`\n✅ Deleted ${result.deletedCount} corrupted records`);
    return result.deletedCount;
}

// Create sample salary records for testing
async function createSampleSalaries(schoolId) {
    console.log('\n' + '='.repeat(60));
    console.log('📝 CREATING SAMPLE SALARY RECORDS');
    console.log('='.repeat(60));
    
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    
    // Get teachers and staff
    const teachers = await Teacher.find({ school: schoolObjectId }).limit(3);
    const staff = await Staff.find({ school: schoolObjectId }).limit(2);
    
    console.log(`Found ${teachers.length} teachers and ${staff.length} staff`);
    
    if (teachers.length === 0 && staff.length === 0) {
        console.log('❌ No employees found. Please add employees first.');
        return 0;
    }
    
    let created = 0;
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
    const currentYear = new Date().getFullYear();
    
    // Create salary records for teachers
    for (const teacher of teachers) {
        const existingSalary = await Salary.findOne({
            school: schoolObjectId,
            employeeType: 'teacher',
            employee: teacher._id,
            status: 'active'
        });
        
        if (existingSalary) {
            console.log(`   ⏭️  Skipping ${teacher.name} - salary record already exists`);
            continue;
        }
        
        const baseSalary = 25000 + Math.floor(Math.random() * 15000); // 25000-40000
        const allowances = {
            houseRent: Math.round(baseSalary * 0.2),
            medical: Math.round(baseSalary * 0.05),
            transport: Math.round(baseSalary * 0.05),
            other: Math.round(baseSalary * 0.02)
        };
        const deductions = {
            providentFund: Math.round(baseSalary * 0.1),
            tax: Math.round(baseSalary * 0.05),
            insurance: 500,
            other: 200
        };
        const netSalary = baseSalary + 
            allowances.houseRent + allowances.medical + allowances.transport + allowances.other -
            deductions.providentFund - deductions.tax - deductions.insurance - deductions.other;
        
        // Create salary record
        const salary = new Salary({
            school: schoolObjectId,
            employeeType: 'teacher',
            employee: teacher._id,
            position: 'Teacher',
            baseSalary,
            allowances,
            deductions,
            status: 'active'
        });
        
        await salary.save();
        
        // Update teacher schema
        await Teacher.findByIdAndUpdate(teacher._id, {
            salary: {
                baseSalary,
                allowances,
                deductions,
                netSalary
            }
        });
        
        console.log(`   ✅ Created salary for teacher: ${teacher.name} - NPR ${baseSalary}/month`);
        created++;
        
        // Add sample payment for last 3 months
        for (let i = 0; i < 3; i++) {
            const monthIndex = new Date().getMonth() - i;
            const month = monthIndex >= 0 ? months[monthIndex] : months[months.length + monthIndex];
            const year = monthIndex >= 0 ? currentYear : currentYear - 1;
            
            salary.paymentHistory.push({
                month,
                year,
                amount: netSalary,
                paymentDate: new Date(year, monthIndex >= 0 ? monthIndex : 11 + monthIndex, 1),
                status: 'paid',
                paymentMethod: 'bank'
            });
        }
        await salary.save();
        console.log(`      Added 3 sample payments`);
    }
    
    // Create salary records for staff
    for (const staffMember of staff) {
        const existingSalary = await Salary.findOne({
            school: schoolObjectId,
            employeeType: 'staff',
            employee: staffMember._id,
            status: 'active'
        });
        
        if (existingSalary) {
            console.log(`   ⏭️  Skipping ${staffMember.name} - salary record already exists`);
            continue;
        }
        
        const baseSalary = 15000 + Math.floor(Math.random() * 10000); // 15000-25000
        const allowances = {
            houseRent: Math.round(baseSalary * 0.15),
            medical: Math.round(baseSalary * 0.03),
            transport: Math.round(baseSalary * 0.03),
            other: Math.round(baseSalary * 0.02)
        };
        const deductions = {
            providentFund: Math.round(baseSalary * 0.05),
            tax: Math.round(baseSalary * 0.02),
            insurance: 300,
            other: 100
        };
        const netSalary = baseSalary + 
            allowances.houseRent + allowances.medical + allowances.transport + allowances.other -
            deductions.providentFund - deductions.tax - deductions.insurance - deductions.other;
        
        // Create salary record
        const salary = new Salary({
            school: schoolObjectId,
            employeeType: 'staff',
            employee: staffMember._id,
            position: staffMember.position || 'Staff',
            baseSalary,
            allowances,
            deductions,
            status: 'active'
        });
        
        await salary.save();
        
        // Update staff schema
        await Staff.findByIdAndUpdate(staffMember._id, {
            salary: {
                baseSalary,
                allowances,
                deductions,
                netSalary
            }
        });
        
        console.log(`   ✅ Created salary for staff: ${staffMember.name} - NPR ${baseSalary}/month`);
        created++;
        
        // Add sample payment for last 3 months
        for (let i = 0; i < 3; i++) {
            const monthIndex = new Date().getMonth() - i;
            const month = monthIndex >= 0 ? months[monthIndex] : months[months.length + monthIndex];
            const year = monthIndex >= 0 ? currentYear : currentYear - 1;
            
            salary.paymentHistory.push({
                month,
                year,
                amount: netSalary,
                paymentDate: new Date(year, monthIndex >= 0 ? monthIndex : 11 + monthIndex, 1),
                status: 'paid',
                paymentMethod: 'cash'
            });
        }
        await salary.save();
        console.log(`      Added 3 sample payments`);
    }
    
    console.log(`\n✅ Created ${created} new salary records`);
    return created;
}

// Run diagnostic
async function runDiagnostic(schoolId) {
    await connectDB();
    
    console.log('\n🎯 DIAGNOSTIC MODE');
    const results = await diagnoseSalaryRecords(schoolId);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Salary Records: ${results.totalRecords}`);
    console.log(`Valid Records: ${results.validRecords}`);
    console.log(`Corrupted Records: ${results.corruptedRecords}`);
    console.log(`Teachers with Salary: ${results.teachersWithSalary}`);
    console.log(`Staff with Salary: ${results.staffWithSalary}`);
    console.log(`Total Salary Paid: NPR ${results.totalSalaryPaid.toLocaleString()}`);
    
    if (results.corruptedRecords > 0) {
        console.log('\n⚠️  ACTION REQUIRED: Run cleanup to delete corrupted records');
        console.log('   node test_salary_api.js cleanup <schoolId>');
    }
    
    if (results.validRecords === 0 && results.teachersWithSalary === 0 && results.staffWithSalary === 0) {
        console.log('\n⚠️  NO VALID DATA: Run sample creation to add test data');
        console.log('   node test_salary_api.js create <schoolId>');
    }
    
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'diagnostic';
    const schoolId = args[1];
    
    if (!schoolId) {
        console.log('❌ Error: School ID is required');
        console.log('\nUsage:');
        console.log('   node test_salary_api.js diagnostic <schoolId>');
        console.log('   node test_salary_api.js cleanup <schoolId>');
        console.log('   node test_salary_api.js create <schoolId>');
        console.log('   node test_salary_api.js fix <schoolId>');
        process.exit(1);
    }
    
    await connectDB();
    
    switch (command) {
        case 'diagnostic':
        case 'd':
            await runDiagnostic(schoolId);
            break;
            
        case 'cleanup':
        case 'c':
            await cleanupCorruptedSalaries(schoolId);
            await runDiagnostic(schoolId);
            break;
            
        case 'create':
        case 'add':
            await createSampleSalaries(schoolId);
            await runDiagnostic(schoolId);
            break;
            
        case 'fix':
        case 'repair':
            console.log('\n🔧 Running full fix...');
            await cleanupCorruptedSalaries(schoolId);
            await createSampleSalaries(schoolId);
            await runDiagnostic(schoolId);
            break;
            
        default:
            console.log(`Unknown command: ${command}`);
            console.log('Use: diagnostic, cleanup, create, or fix');
            process.exit(1);
    }
}

// Export for use in other scripts
module.exports = {
    diagnoseSalaryRecords,
    cleanupCorruptedSalaries,
    createSampleSalaries,
    isValidObjectId
};

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

