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
            url = `${process.env.REACT_APP_BASE_URL}/StudentDocuments/${schoolId}/${classId}`;
        }

        const result = await axios.get(url);
        if (result.data.message) {
            dispatch(getDocumentFailed(result.data.message));
        } else {
            dispatch(getDocumentSuccess(result.data));
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Error loading documents";
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
        // Extract serializable error information
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           error.toString() ||
                           "Error uploading document";
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
        const errorMessage = error.response?.data?.message || error.message || "Error deleting document";
        dispatch(deleteDocumentFailed(errorMessage));
    }
};
