import axios from 'axios';
import {
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
    underControl
} from './salarySlice';

// Get employees (teachers/staff) with their salary status
export const getEmployeesWithSalaryStatus = (schoolId, employeeType) => async (dispatch) => {
    dispatch(getEmployeesRequest());

    // Validate inputs
    if (!schoolId) {
        console.error('getEmployeesWithSalaryStatus: schoolId is required');
        dispatch(getEmployeesFailed('School ID is required'));
        return;
    }

    if (!employeeType || !['teacher', 'staff', 'all'].includes(employeeType)) {
        console.error('getEmployeesWithSalaryStatus: Invalid employeeType', employeeType);
        dispatch(getEmployeesFailed('Invalid employee type'));
        return;
    }

    const apiUrl = `${process.env.REACT_APP_BASE_URL}/Salary/Employees/${schoolId}/${employeeType}`;
    console.log(`Fetching employees for school: ${schoolId}, type: ${employeeType}`);
    console.log(`API URL: ${apiUrl}`);

    try {
        const result = await axios.get(apiUrl, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('API Response status:', result.status);
        console.log('Data received:', result.data ? `${Array.isArray(result.data) ? result.data.length + ' items' : 'object'}` : 'empty');

        if (result.data) {
            // Ensure data is an array
            const employees = Array.isArray(result.data) ? result.data : [];
            console.log(`Successfully loaded ${employees.length} employees`);
            dispatch(getEmployeesSuccess(employees));
        } else {
            console.warn('API returned empty data');
            dispatch(getEmployeesSuccess([]));
        }
    } catch (error) {
        console.error('Error fetching employees:', error.message);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        // Provide more specific error messages
        let errorMessage = 'Failed to fetch employees';
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.response) {
            if (error.response.status === 400) {
                errorMessage = error.response.data?.error || 'Invalid request parameters';
            } else if (error.response.status === 404) {
                errorMessage = 'No employees found';
            } else if (error.response.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else {
                errorMessage = error.response.data?.error || `Server error (${error.response.status})`;
            }
        } else if (error.request) {
            errorMessage = 'Unable to connect to server. Please check your connection.';
        }

        dispatch(getEmployeesFailed(errorMessage));
    }
};

// Get all salary records for school
export const getAllSalaryRecords = (schoolId) => async (dispatch) => {
    dispatch(getSalaryRecordsRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salaries/${schoolId}`);
        if (result.data) {
            dispatch(getSalaryRecordsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getSalaryRecordsFailed(error.message));
    }
};

// Get salary by employee
export const getSalaryByEmployee = (schoolId, employeeType, employeeId) => async (dispatch) => {
    dispatch(getEmployeeSalaryRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salary/${schoolId}/${employeeType}/${employeeId}`);
        if (result.data) {
            dispatch(getEmployeeSalarySuccess(result.data));
        }
    } catch (error) {
        dispatch(getEmployeeSalaryFailed(error.message));
    }
};

// Create or update salary
export const createOrUpdateSalary = (salaryData) => async (dispatch) => {
    dispatch(paymentRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Salary/Create`, salaryData);
        if (result.data) {
            dispatch(paymentSuccess(result.data));
            dispatch(underControl());
            return result.data;
        }
    } catch (error) {
        dispatch(paymentFailed(error.message));
        throw error;
    }
};

// Record single payment
export const recordSalaryPayment = (salaryId, paymentData) => async (dispatch) => {
    dispatch(paymentRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Salary/Payment/${salaryId}`, paymentData);
        if (result.data) {
            dispatch(paymentSuccess(result.data));
            dispatch(underControl());
            return result.data;
        }
    } catch (error) {
        dispatch(paymentFailed(error.message));
        throw error;
    }
};

// Bulk salary payment
export const bulkSalaryPayment = (paymentData) => async (dispatch) => {
    dispatch(bulkPaymentRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Salary/BulkPayment`, paymentData);
        if (result.data) {
            dispatch(bulkPaymentSuccess(result.data));
            dispatch(underControl());
            return result.data;
        }
    } catch (error) {
        dispatch(bulkPaymentFailed(error.message));
        throw error;
    }
};

// Update salary structure
export const updateSalaryStructure = (salaryId, salaryData) => async (dispatch) => {
    dispatch(updateSalaryRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Salary/Update/${salaryId}`, salaryData);
        if (result.data) {
            dispatch(updateSalarySuccess(result.data));
            dispatch(underControl());
            return result.data;
        }
    } catch (error) {
        dispatch(updateSalaryFailed(error.message));
        throw error;
    }
};

// Delete salary record
export const deleteSalaryRecord = (salaryId) => async (dispatch) => {
    dispatch(deleteSalaryRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Salary/${salaryId}`);
        if (result.data.message) {
            dispatch(deleteSalarySuccess());
            dispatch(underControl());
            return result.data;
        }
    } catch (error) {
        dispatch(deleteSalaryFailed(error.message));
        throw error;
    }
};

// Get salary summary
export const getSalarySummary = (schoolId) => async (dispatch) => {
    dispatch(getSalaryRecordsRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salary/Summary/${schoolId}`);
        if (result.data) {
            dispatch(getSalaryRecordsSuccess(result.data));
            return result.data;
        }
    } catch (error) {
        dispatch(getSalaryRecordsFailed(error.message));
        throw error;
    }
};

// Get salary by month and year
export const getSalaryByMonthYear = (schoolId, month, year) => async (dispatch) => {
    dispatch(getSalaryRecordsRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salary/ByMonth/${schoolId}/${month}/${year}`);
        if (result.data) {
            dispatch(getSalaryRecordsSuccess(result.data));
            return result.data;
        }
    } catch (error) {
        dispatch(getSalaryRecordsFailed(error.message));
        throw error;
    }
};

// Get employee payment history
export const getEmployeePaymentHistory = (schoolId, employeeType, employeeId) => async (dispatch) => {
    dispatch(getEmployeeSalaryRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salary/EmployeeHistory/${schoolId}/${employeeType}/${employeeId}`);
        if (result.data) {
            dispatch(getEmployeeSalarySuccess(result.data));
            return result.data;
        }
    } catch (error) {
        dispatch(getEmployeeSalaryFailed(error.message));
        throw error;
    }
};

