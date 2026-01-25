const Fee = require('../models/feeSchema.js');
const Student = require('../models/studentSchema.js');

const createFee = async (req, res) => {
    try {
        const { studentId, schoolId, feeDetails } = req.body;

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        // Check if fee record already exists for this student
        let existingFee = await Fee.findOne({ student: studentId, school: schoolId });

        if (existingFee) {
            // Add new fee details to existing record
            existingFee.feeDetails.push(...feeDetails);
            await existingFee.save();
            return res.send(existingFee);
        } else {
            // Create new fee record
            const fee = new Fee({
                student: studentId,
                school: schoolId,
                feeDetails: feeDetails
            });

            let result = await fee.save();
            result = await result.populate("student", "name rollNum");
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentFees = async (req, res) => {
    try {
        const studentId = req.params.id;
        let fee = await Fee.findOne({ student: studentId })
            .populate("student", "name rollNum sclassName")
            .populate("school", "schoolName");

        if (fee) {
            // Sort fee details by month
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            fee.feeDetails.sort((a, b) => {
                const [monthA, yearA] = a.month.split(' ');
                const [monthB, yearB] = b.month.split(' ');
                const indexA = months.indexOf(monthA);
                const indexB = months.indexOf(monthB);
                if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                return indexA - indexB;
            });

            res.send(fee);
        } else {
            res.send({ message: 'No fee record found for this student' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getAllStudentFees = async (req, res) => {
    try {
        const schoolId = req.params.id;
        let fees = await Fee.find({ school: schoolId })
            .populate({
                path: "student",
                populate: { path: "sclassName" },
                select: "name rollNum sclassName"
            })
            .populate("school", "schoolName");

        if (fees.length > 0) {
            let modifiedFees = fees.map((fee) => {
                return {
                    ...fee._doc,
                    studentName: fee.student?.name || 'Unknown',
                    rollNum: fee.student?.rollNum || 'N/A',
                    className: fee.student?.sclassName?.sclassName || fee.student?.sclassName || 'N/A',
                    password: undefined
                };
            });
            res.send(modifiedFees);
        } else {
            res.send({ message: 'No fee records found' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateFee = async (req, res) => {
    try {
        const { feeId } = req.params;
        const { month, status, amount, description, paymentDate, paidAmount } = req.body;

        // First, let's try to find ANY fee that has this feeDetail ID
        const allFees = await Fee.find({});
        
        for (const fee of allFees) {
            const matchingDetail = fee.feeDetails.find(d => d._id.toString() === feeId);
            if (matchingDetail) {
                // Now update this fee
                const feeDetail = fee.feeDetails.id(feeId);
                
                if (amount !== undefined) {
                    feeDetail.amount = amount;
                }
                if (status) {
                    feeDetail.status = status;
                }
                if (description !== undefined) {
                    feeDetail.description = description;
                }
                if (paymentDate) {
                    feeDetail.paymentDate = paymentDate;
                } else if (status === 'Paid' && !feeDetail.paymentDate) {
                    feeDetail.paymentDate = new Date();
                } else if (status === 'Unpaid') {
                    feeDetail.paymentDate = null;
                }
                
                if (paidAmount !== undefined) {
                    feeDetail.paidAmount = parseFloat(paidAmount);
                } else if (status === 'Partial' && !feeDetail.paidAmount) {
                    feeDetail.paidAmount = feeDetail.amount / 2;
                } else if (status === 'Paid') {
                    feeDetail.paidAmount = feeDetail.amount;
                } else if (status === 'Unpaid') {
                    feeDetail.paidAmount = 0;
                }

                // Recalculate totals
                let total = 0;
                let paid = 0;
                let partial = 0;

                fee.feeDetails.forEach(f => {
                    total += f.amount;
                    if (f.status === 'Paid') {
                        paid += f.amount;
                    } else if (f.status === 'Partial') {
                        partial += f.paidAmount || 0;
                    }
                });

                fee.totalAmount = total;
                fee.paidAmount = paid;
                fee.partialAmount = partial;
                fee.dueAmount = total - paid - partial;

                await fee.save();
                
                const updatedFee = await Fee.findOne({ student: fee.student })
                    .populate({
                        path: "student",
                        populate: { path: "sclassName" },
                        select: "name rollNum sclassName"
                    })
                    .populate("school", "schoolName");
                
                return res.send(updatedFee);
            }
        }

        return res.status(404).send({ message: 'Fee record not found' });
    } catch (err) {
        console.error('Error in updateFee:', err);
        res.status(500).json(err);
    }
};

const deleteFee = async (req, res) => {
    try {
        const { studentId, feeDetailId } = req.params;

        if (feeDetailId) {
            // Delete specific fee detail
            const fee = await Fee.findOneAndUpdate(
                { student: studentId },
                { $pull: { feeDetails: { _id: feeDetailId } } },
                { new: true }
            );
            res.send(fee);
        } else {
            // Delete entire fee record
            const result = await Fee.findOneAndDelete({ student: studentId });
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createFee,
    getStudentFees,
    getAllStudentFees,
    updateFee,
    deleteFee
};

