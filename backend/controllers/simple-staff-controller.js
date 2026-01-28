const mongoose = require('mongoose');
const Staff = require('../models/staffSchema.js');

// Logging utility
const log = {
    info: (msg, data) => console.log(`[STAFF INFO] ${msg}`, data || ''),
    error: (msg, err) => console.error(`[STAFF ERROR] ${msg}`, err || ''),
    debug: (msg, data) => console.log(`[STAFF DEBUG] ${msg}`, data || '')
};

const simpleStaffController = {
    // Add new staff without login/authentication
    addStaff: async (req, res) => {
        log.info('addStaff called', { body: req.body });

        try {
            const { name, address, position, phone, photo, school } = req.body;

            // Validation
            log.info('Validating fields', { name, position, school });
            if (!name || !position) {
                log.error('Validation failed: missing name or position');
                return res.status(400).send({ message: 'Name and Position are required' });
            }

            if (!school) {
                log.error('Validation failed: missing school ID');
                return res.status(400).send({ message: 'School ID is required' });
            }

            // Validate school ID format
            if (!mongoose.Types.ObjectId.isValid(school)) {
                log.error('Invalid school ID format', { school });
                return res.status(400).send({ message: 'Invalid school ID format' });
            }

            log.info('Creating new staff record');

            // Create new staff record (without email/password)
            const staff = new Staff({
                name,
                address: address || '',
                position,
                phone: phone || '',
                photo: photo || '',
                school,
                email: `staff_${Date.now()}@placeholder.com`, // Placeholder email
                password: 'placeholder', // Placeholder password
                role: 'Staff'
            });

            log.info('Attempting to save staff to database');
            
            let result = await staff.save();
            
            log.info('Staff saved successfully', { _id: result._id });
            
            // Return staff without sensitive data
            const { password, email, ...safeStaff } = result._doc;
            res.send(safeStaff);
        } catch (err) {
            log.error('Error saving staff', err);
            console.error('Full error details:', err);
            res.status(500).json({ 
                message: 'Failed to save staff', 
                error: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    },

    // Get all staff for a school
    getAllStaffs: async (req, res) => {
        log.info('getAllStaffs called', { schoolId: req.params.schoolId });

        try {
            const { schoolId } = req.params;

            // Validate school ID
            if (!schoolId) {
                log.error('Missing schoolId parameter');
                return res.status(400).send({ message: 'School ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(schoolId)) {
                log.error('Invalid school ID format', { schoolId });
                return res.status(400).send({ message: 'Invalid school ID format' });
            }

            log.info('Querying database for staff');
            let staff = await Staff.find({ school: schoolId });
            
            log.info('Database query completed', { count: staff.length });

            if (staff.length > 0) {
                // Remove sensitive data
                let modifiedStaff = staff.map((s) => {
                    const { password, ...safeData } = s._doc;
                    return safeData;
                });
                log.info('Sending staff list', { count: modifiedStaff.length });
                res.send(modifiedStaff);
            } else {
                log.info('No staff found for school');
                res.send({ message: "No staff found" });
            }
        } catch (err) {
            log.error('Error fetching staff', err);
            console.error('Full error details:', err);
            res.status(500).json({ 
                message: 'Failed to fetch staff', 
                error: err.message 
            });
        }
    },

    // Get single staff detail
    getStaffDetail: async (req, res) => {
        log.info('getStaffDetail called', { id: req.params.id });

        try {
            const { id } = req.params;

            if (!id) {
                log.error('Missing staff ID');
                return res.status(400).send({ message: 'Staff ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                log.error('Invalid staff ID format', { id });
                return res.status(400).send({ message: 'Invalid staff ID format' });
            }

            log.info('Querying database for staff detail');
            let staff = await Staff.findById(id).populate("school", "schoolName");
            
            if (staff) {
                log.info('Staff found', { _id: staff._id });
                const { password, ...safeData } = staff._doc;
                res.send(safeData);
            } else {
                log.info('Staff not found');
                res.send({ message: "No staff found" });
            }
        } catch (err) {
            log.error('Error fetching staff detail', err);
            console.error('Full error details:', err);
            res.status(500).json({ 
                message: 'Failed to fetch staff detail', 
                error: err.message 
            });
        }
    },

    // Delete single staff
    deleteStaff: async (req, res) => {
        log.info('deleteStaff called', { id: req.params.id });

        try {
            const { id } = req.params;

            if (!id) {
                log.error('Missing staff ID');
                return res.status(400).send({ message: 'Staff ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                log.error('Invalid staff ID format', { id });
                return res.status(400).send({ message: 'Invalid staff ID format' });
            }

            log.info('Deleting staff from database');
            const result = await Staff.findByIdAndDelete(id);
            
            if (result) {
                log.info('Staff deleted successfully', { _id: id });
                res.send({ message: "Staff deleted successfully" });
            } else {
                log.info('Staff not found for deletion');
                res.status(404).send({ message: "Staff not found" });
            }
        } catch (error) {
            log.error('Error deleting staff', error);
            console.error('Full error details:', error);
            res.status(500).json({ 
                message: 'Failed to delete staff', 
                error: error.message 
            });
        }
    },

    // Delete all staff for a school
    deleteAllStaffs: async (req, res) => {
        log.info('deleteAllStaffs called', { schoolId: req.params.schoolId });

        try {
            const { schoolId } = req.params;

            if (!schoolId) {
                log.error('Missing schoolId');
                return res.status(400).send({ message: 'School ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(schoolId)) {
                log.error('Invalid school ID format', { schoolId });
                return res.status(400).send({ message: 'Invalid school ID format' });
            }

            log.info('Deleting all staff for school');
            const result = await Staff.deleteMany({ school: schoolId });
            
            log.info('Delete result', { deletedCount: result.deletedCount });
            
            if (result.deletedCount === 0) {
                res.send({ message: "No staff found to delete" });
            } else {
                res.send({ message: `${result.deletedCount} staff deleted successfully` });
            }
        } catch (error) {
            log.error('Error deleting all staff', error);
            console.error('Full error details:', error);
            res.status(500).json({ 
                message: 'Failed to delete staff', 
                error: error.message 
            });
        }
    },

    // Health check for staff database connection
    healthCheck: async (req, res) => {
        try {
            const mongooseConnection = mongoose.connection.readyState;
            const connectionStates = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };

            const status = {
                database: connectionStates[mongooseConnection] || 'unknown',
                timestamp: new Date().toISOString()
            };

            // Test actual connection
            if (mongooseConnection === 1) {
                await mongoose.connection.db.admin().ping();
                status.ping = 'successful';
            }

            log.info('Health check', status);
            res.send(status);
        } catch (error) {
            log.error('Health check failed', error);
            res.status(500).send({ 
                database: 'error',
                error: error.message 
            });
        }
    }
};

module.exports = simpleStaffController;

