const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    fatherName: {
        type: String,
        required: true,
    },
    fatherOccupation: {
        type: String,
        default: ""
    },
    fatherPhone: {
        type: String,
        default: ""
    },
    fatherEmail: {
        type: String,
        default: ""
    },
    motherName: {
        type: String,
        default: ""
    },
    motherOccupation: {
        type: String,
        default: ""
    },
    motherPhone: {
        type: String,
        default: ""
    },
    motherEmail: {
        type: String,
        default: ""
    },
    guardianName: {
        type: String,
        default: ""
    },
    guardianRelation: {
        type: String,
        default: ""
    },
    guardianPhone: {
        type: String,
        default: ""
    },
    guardianEmail: {
        type: String,
        default: ""
    },
    guardianAddress: {
        type: String,
        default: ""
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student'
    }],
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    role: {
        type: String,
        default: "Parent"
    },
    address: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    photo: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    emergencyContact: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        relation: { type: String, default: "" }
    },
    monthlyIncome: {
        type: Number,
        default: 0
    },
    passwordHistory: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("parent", parentSchema);

