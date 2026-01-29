import axios from 'axios';
import {
    getDocumentRequest,
    getDocumentSuccess,
    getDocumentFailed,
    getDocumentError,
    addDocumentRequest,
    addDocumentSuccess,
    addDocumentFailed,
    deleteDocumentRequest,
    deleteDocumentSuccess,
    deleteDocumentFailed
} from './documentSlice';

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

// Get documents based on role
export const getAllDocuments = (id, role, schoolId = null, classId = null) => async (dispatch) => {
    dispatch(getDocumentRequest());

    try {
        let url;
        if (role === 'Teacher') {
            url = `${process.env.REACT_APP_BASE_URL}/TeacherDocuments/${id}`;
        } else if (role === 'Admin') {
            url = `${process.env.REACT_APP_BASE_URL}/SchoolDocuments/${id}`;
        } else if (role === 'Student') {
            console.log('Fetching documents with schoolId:', schoolId, 'classId:', classId);
            url = `${process.env.REACT_APP_BASE_URL}/StudentDocuments/${schoolId}/${classId}`;
        }

        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getDocumentFailed(result.data.message));
        } else {
            dispatch(getDocumentSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(getDocumentError(errorMessage));
    }
};

// Add a new document
export const addDocument = (formData, address) => async (dispatch) => {
    dispatch(addDocumentRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (result.data.message) {
            dispatch(addDocumentFailed(result.data.message));
        } else {
            dispatch(addDocumentSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        console.error('Document upload error:', errorMessage);
        dispatch(addDocumentFailed(errorMessage));
    }
};

// Delete a document
export const deleteDocument = (id, address) => async (dispatch) => {
    dispatch(deleteDocumentRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(deleteDocumentFailed(result.data.message));
        } else {
            dispatch(deleteDocumentSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(deleteDocumentFailed(errorMessage));
    }
};

