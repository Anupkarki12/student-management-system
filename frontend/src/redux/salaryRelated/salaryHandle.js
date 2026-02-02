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

// DEBUG: Get diagnostic info about salary system
export const getSalaryDebugInfo = (schoolId) => async (dispatch) => {
    dispatch(getSalaryRecordsRequest());

    try {
        console.log('[DEBUG] Fetching diagnostic info for school:', schoolId);
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Salary/Debug/${schoolId}`, {
            timeout: 10000
        });

        console.log('[DEBUG] Diagnostic info received:', result.data);
        return result.data;
    } catch (error) {
        console.error('[DEBUG] Error fetching diagnostic info:', error);
        return { error: extractErrorMessage(error) };
    }
};

// FIX: Clean up corrupted salary records and get diagnostic info
export const fixSalaryRecords = (schoolId) => async (dispatch) => {
    dispatch(getSalaryRecordsRequest());

    try {
        console.log('[FIX] Running salary fix for school:', schoolId);
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Salary/Fix/${schoolId}`, {
            timeout: 15000
        });

        console.log('[FIX] Fix results:', result.data);
        return result.data;
    } catch (error) {
        console.error('[FIX] Error fixing salary records:', error);
        return { error: extractErrorMessage(error) };
    }
};

/**
 * Safely extracts a serializable error message from an error object.
 * This prevents non-serializable values (like AxiosError) from being stored in Redux state.
 * @param {any} error - The error object (typically from axios)
 * @returns {string} - A serializable error message
 */
const extractErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    if (typeof error === 'string') return error;
    
    // Handle axios errors
    if (error.response?.data?.error) return error.response.data.error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.statusText) return error.response.statusText;
    if (error.response?.status) return `Server error (${error.response.status})`;
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
    if (error.code === 'ERR_NETWORK') return 'Unable to connect to server. Please check your connection.';
    
    // Fallback to message or generic error
    if (error.message) return error.message;
    
    return 'An unknown error occurred';
};

// Get employees (teachers/staff) with their salary status
export const getEmployeesWithSalaryStatus = (schoolId, employeeType, month, year) => async (dispatch) => {
    dispatch(getEmployeesRequest());

    // Validate inputs
    if (!schoolId) {
        console.error('getEmployeesWithSalaryStatus: schoolId is required');
        dispatch(getEmployeesFailed('School ID is required'));
        return Promise.reject(new Error('School ID is required'));
    }

    if (!employeeType || !['teacher', 'staff', 'all'].includes(employeeType)) {
        console.error('getEmployeesWithSalaryStatus: Invalid employeeType', employeeType);
        dispatch(getEmployeesFailed('Invalid employee type'));
        return Promise.reject(new Error('Invalid employee type'));
    }

    // Build URL with query params for month/year
    let apiUrl = `${process.env.REACT_APP_BASE_URL}/Salary/Employees/${schoolId}/${employeeType}`;
    const queryParams = [];
    if (month) queryParams.push(`month=${encodeURIComponent(month)}`);
    if (year) queryParams.push(`year=${encodeURIComponent(year)}`);
    if (queryParams.length > 0) {
        apiUrl += `?${queryParams.join('&')}`;
    }

    console.log(`Fetching employees for school: ${schoolId}, type: ${employeeType}, month: ${month}, year: ${year}`);
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
            // Return the employees data for use in .then() callbacks
            return employees;
        } else {
            console.warn('API returned empty data');
            dispatch(getEmployeesSuccess([]));
            return [];
        }
    } catch (error) {
        // Log the full error for debugging
        console.error('Error fetching employees:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        // Extract serializable error message - THIS IS THE FIX
        const errorMessage = extractErrorMessage(error);
        console.error('Dispatching error message:', errorMessage);
        
        dispatch(getEmployeesFailed(errorMessage));
        return Promise.reject(new Error(errorMessage));
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
        dispatch(getSalaryRecordsFailed(extractErrorMessage(error)));
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
        dispatch(getEmployeeSalaryFailed(extractErrorMessage(error)));
    }
};

// Create or update salary
export const createOrUpdateSalary = (salaryData) => async (dispatch) => {
    dispatch(paymentRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/Salary/Create`, salaryData);
        if (result.data) {
            dispatch(paymentSuccess(result.data));
            // Don't call underControl() here - let the component handle the success state
            // This ensures the success state persists for the useEffect to handle
            return result.data;
        }
    } catch (error) {
        dispatch(paymentFailed(extractErrorMessage(error)));
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
        dispatch(paymentFailed(extractErrorMessage(error)));
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
            // Don't call underControl() here - let the component handle the success state
            // This ensures the success state persists for the useEffect to handle refresh
            return result.data;
        }
    } catch (error) {
        dispatch(bulkPaymentFailed(extractErrorMessage(error)));
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
        dispatch(updateSalaryFailed(extractErrorMessage(error)));
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
        dispatch(deleteSalaryFailed(extractErrorMessage(error)));
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
        dispatch(getSalaryRecordsFailed(extractErrorMessage(error)));
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
        dispatch(getSalaryRecordsFailed(extractErrorMessage(error)));
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
        dispatch(getEmployeeSalaryFailed(extractErrorMessage(error)));
        throw error;
    }
};

