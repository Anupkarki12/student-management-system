import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    employeesWithSalary: [],
    salaryRecords: [],
    currentEmployee: null,
    paymentHistory: [],
    loading: false,
    error: null,
    success: false,
    response: null,
    status: 'idle'
};

const salarySlice = createSlice({
    name: 'salary',
    initialState,
    reducers: {
        // Get employees with salary status
        getEmployeesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getEmployeesSuccess: (state, action) => {
            state.loading = false;
            state.employeesWithSalary = action.payload;
            state.error = null;
        },
        getEmployeesFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Get all salary records
        getSalaryRecordsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSalaryRecordsSuccess: (state, action) => {
            state.loading = false;
            state.salaryRecords = action.payload;
            state.error = null;
        },
        getSalaryRecordsFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Get single employee salary
        getEmployeeSalaryRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getEmployeeSalarySuccess: (state, action) => {
            state.loading = false;
            state.currentEmployee = action.payload;
            state.error = null;
        },
        getEmployeeSalaryFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Payment operations
        paymentRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        paymentSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.success = true;
            state.error = null;
        },
        paymentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // Bulk payment
        bulkPaymentRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        bulkPaymentSuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.success = true;
            state.error = null;
        },
        bulkPaymentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // Update salary
        updateSalaryRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSalarySuccess: (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.error = null;
        },
        updateSalaryFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete salary
        deleteSalaryRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteSalarySuccess: (state) => {
            state.loading = false;
            state.response = 'Salary deleted successfully';
            state.error = null;
        },
        deleteSalaryFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Reset states
        resetSalary: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.response = null;
            state.status = 'idle';
        },
        underControl: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.status = 'idle';
        }
    }
});

export const {
    getEmployeesRequest,
    getEmployeesSuccess,
    getEmployeesFailed,
    getSalaryRecordsRequest,
    getSalaryRecordsSuccess,
    getSalaryRecordsFailed,
    getEmployeeSalaryRequest,
    getEmployeeSalarySuccess,
    getEmployeeSalaryFailed,
    paymentRequest,
    paymentSuccess,
    paymentFailed,
    bulkPaymentRequest,
    bulkPaymentSuccess,
    bulkPaymentFailed,
    updateSalaryRequest,
    updateSalarySuccess,
    updateSalaryFailed,
    deleteSalaryRequest,
    deleteSalarySuccess,
    deleteSalaryFailed,
    resetSalary,
    underControl
} = salarySlice.actions;

export default salarySlice.reducer;

