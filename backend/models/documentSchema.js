const mongoose = require("mongoose")

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
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
        default: null
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        default: null
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("document", documentSchema)

