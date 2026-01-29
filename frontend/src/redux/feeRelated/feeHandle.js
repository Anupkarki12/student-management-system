import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './feeSlice';

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

export const getAllFees = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/AllFees/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        console.error('Error fetching fees:', errorMessage);
        dispatch(getError(errorMessage));
    }
}

export const getStudentFee = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Fees/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // Backend returns a single fee object for student, wrap in array
            dispatch(getSuccess([result.data]));
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(getError(errorMessage));
    }
}

export const addFee = (data) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/FeeCreate`, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(getError(errorMessage));
    }
}

export const updateFeeStatus = (id, data) => async (dispatch) => {
    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Fee/${id}`, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
            return { success: false, message: result.data.message };
        } else {
            dispatch(stuffDone());
            return { success: true, data: result.data };
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(getError(errorMessage));
        return { success: false, message: errorMessage };
    }
}

export const deleteFee = (studentId, feeDetailId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        let url = `${process.env.REACT_APP_BASE_URL}/Fee/${studentId}`;
        if (feeDetailId) {
            url += `/${feeDetailId}`;
        }
        await axios.delete(url);
        // Don't set any state here - let the component handle the refresh
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(getError(errorMessage));
    }
}

