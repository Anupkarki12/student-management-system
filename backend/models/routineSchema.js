const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sclass',
        required: true
    },
    type: {
        type: String,
        enum: ['class', 'exam'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // For exam routines only
    examType: {
        type: String,
        enum: ['first', 'second', 'mid', 'preboard', 'final', null],
        default: null
    },
    examDate: Date,
    // File upload for exam routine PDF
    filePath: {
        type: String,
        default: null
    },
    title: {
        type: String,
        default: ''
    },
    // For class routines
    day: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', null],
        default: null
    },
    periods: [{
        periodNumber: Number,
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'teacher'
        },
        startTime: String,
        endTime: String,
        room: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);

