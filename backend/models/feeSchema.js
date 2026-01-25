const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    feeDetails: [{
        month: {
            type: String,
            required: true
        },
        monthlyAmount: {
            type: Number,
            required: true,
            default: 0
        },
        duesAmount: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Partial'],
            default: 'Unpaid'
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        paymentDate: {
            type: Date
        },
        description: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalMonthlyAmount: {
        type: Number,
        default: 0
    },
    totalDuesAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    partialAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
feeSchema.pre('save', function(next) {
    let totalMonthly = 0;
    let totalDues = 0;
    let total = 0;
    let paid = 0;
    let partial = 0;
    
    this.feeDetails.forEach(fee => {
        totalMonthly += fee.monthlyAmount || 0;
        totalDues += fee.duesAmount || 0;
        total += fee.amount;
        
        if (fee.status === 'Paid') {
            paid += fee.amount;
        } else if (fee.status === 'Partial') {
            // For partial payments, add the paidAmount (if set) or the full amount as partial
            partial += fee.paidAmount || 0;
        }
    });
    
    this.totalMonthlyAmount = totalMonthly;
    this.totalDuesAmount = totalDues;
    this.totalAmount = total;
    this.paidAmount = paid;
    this.partialAmount = partial;
    this.dueAmount = total - paid - partial;
    
    next();
});

// Also run calculation on findOneAndUpdate
feeSchema.pre('findOneAndUpdate', function(next) {
    const docToUpdate = this._update;
    
    if (docToUpdate.feeDetails) {
        let totalMonthly = 0;
        let totalDues = 0;
        let total = 0;
        let paid = 0;
        let partial = 0;
        
        docToUpdate.feeDetails.forEach(fee => {
            totalMonthly += fee.monthlyAmount || 0;
            totalDues += fee.duesAmount || 0;
            total += fee.amount;
            
            if (fee.status === 'Paid') {
                paid += fee.amount;
            } else if (fee.status === 'Partial') {
                partial += fee.paidAmount || 0;
            }
        });
        
        docToUpdate.totalMonthlyAmount = totalMonthly;
        docToUpdate.totalDuesAmount = totalDues;
        docToUpdate.totalAmount = total;
        docToUpdate.paidAmount = paid;
        docToUpdate.partialAmount = partial;
        docToUpdate.dueAmount = total - paid - partial;
    }
    
    next();
});

module.exports = mongoose.model("fee", feeSchema);

