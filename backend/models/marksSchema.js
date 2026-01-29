const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    sclass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    examType: {
        type: String,
        enum: ['First Terminal', 'Second Terminal', 'Mid-Terminal', 'Annual', 'Test'],
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    grade: {
        type: String
    },
    comments: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate grade before saving
marksSchema.pre('save', function(next) {
    if (this.marksObtained !== undefined && this.maxMarks !== undefined) {
        const percentage = (this.marksObtained / this.maxMarks) * 100;
        if (percentage >= 90) this.grade = 'A+';
        else if (percentage >= 80) this.grade = 'A';
        else if (percentage >= 70) this.grade = 'B+';
        else if (percentage >= 60) this.grade = 'B';
        else if (percentage >= 50) this.grade = 'C+';
        else if (percentage >= 40) this.grade = 'C';
        else this.grade = 'F';
    }
    next();
});

module.exports = mongoose.model("marks", marksSchema);

