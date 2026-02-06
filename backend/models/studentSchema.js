const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNum: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sclassName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Student"
    },
    photo: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    dob: {
        type: Date,
        default: ""
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subject',
            },
            marksObtained: {
                type: Number,
                default: 0
            }
        }
    ],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true
        },
        subName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject',
            required: true
        }
    }],
    passwordHistory: {
        type: [String],
        default: []
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parent',
        default: null
    },
    // Archived results for historical reference
    archivedResults: [{
        academicInfo: {
            year: String,
            examType: String
        },
        marks: [{
            subject: String,
            examType: String,
            examDate: Date,
            marksObtained: Number,
            maxMarks: Number,
            grade: String,
            percentage: String
        }],
        summary: {
            totalExams: Number,
            totalMarks: {
                obtained: Number,
                max: Number
            },
            overallPercentage: String,
            overallGrade: String
        },
        archivedBy: {
            type: String,
            default: 'system'
        },
        description: String,
        archivedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalDays: {
        type: Number,
        default: 0
    },
    presentDays: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("student", studentSchema);

