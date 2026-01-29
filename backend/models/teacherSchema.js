const mongoose = require("mongoose")

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Teacher"
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    },
    teachSclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    photo: {
        type: String,
        default: ""
    },
    salary: {
        baseSalary: {
            type: Number,
            default: 0
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
        }
    },
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        presentCount: {
            type: String,
        },
        absentCount: {
            type: String,
        }
    }],
    passwordHistory: {
        type: [String],
        default: []
    }
}, { timestamps: true });

// Calculate net salary before saving
teacherSchema.pre('save', function(next) {
    if (this.isModified('salary')) {
        const totalAllowances = 
            (this.salary.allowances?.houseRent || 0) +
            (this.salary.allowances?.medical || 0) +
            (this.salary.allowances?.transport || 0) +
            (this.salary.allowances?.other || 0);
        
        const totalDeductions = 
            (this.salary.deductions?.providentFund || 0) +
            (this.salary.deductions?.tax || 0) +
            (this.salary.deductions?.insurance || 0) +
            (this.salary.deductions?.other || 0);
        
        this.salary.netSalary = this.salary.baseSalary + totalAllowances - totalDeductions;
    }
    next();
});

module.exports = mongoose.model("teacher", teacherSchema)

