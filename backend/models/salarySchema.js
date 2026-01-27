const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    employeeType: {
        type: String,
        enum: ['teacher', 'staff', 'admin'],
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'employeeType',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    allowances: {
        houseRent: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    deductions: {
        providentFund: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    paymentHistory: [{
        month: String,
        year: Number,
        amount: Number,
        paymentDate: Date,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        paymentMethod: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);

