const mongoose = require('mongoose');

const teacherClassAssignmentSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
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
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate assignments
teacherClassAssignmentSchema.index({ teacher: 1, sclass: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('teacherClassAssignment', teacherClassAssignmentSchema);

