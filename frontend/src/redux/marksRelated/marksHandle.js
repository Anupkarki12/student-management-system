import axios from 'axios';
import { getRequest, getSuccess, getFailed, getError } from './marksSlice';

/**
 * Safely extracts a serializable error message from an error object.
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

export const getStudentMarks = (id, examType = 'all') => async (dispatch) => {
    dispatch(getRequest());

    try {
        let url = `${process.env.REACT_APP_BASE_URL}/Marks/Student/${id}`;
        if (examType && examType !== 'all') {
            url += `?examType=${encodeURIComponent(examType)}`;
        }
        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getClassMarks = (sclassId, subjectId, examType) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const url = `${process.env.REACT_APP_BASE_URL}/Marks/Class/${sclassId}/${subjectId}/${examType}`;
        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

