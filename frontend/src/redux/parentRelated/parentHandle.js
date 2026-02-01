import axios from 'axios';

import {
    authRequest,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
    getSuccess,
} from './parentSlice';

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

export const registerParent = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        // Check if there's a photo file in the fields
        if (fields.photo) {
            // Upload photo first
            const photoFormData = new FormData();
            photoFormData.append('photo', fields.photo);
            
            const photoResult = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/ProfilePhotoUpload`,
                photoFormData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            
            // Add photo path to fields and remove the file object
            fields = { ...fields, photo: photoResult.data.photo };
        }
        
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/ParentReg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else if (result.data._id) {
            dispatch(doneSuccess(result.data));
        } else {
            dispatch(authFailed("Unknown error occurred"));
        }
    } catch (error) {
        dispatch(authError(extractErrorMessage(error)));
    }
};

export const loginParent = (fields) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/ParentLogin`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(extractErrorMessage(error)));
    }
};

export const logoutParent = () => (dispatch) => {
    dispatch(authLogout());
};

export const getParentDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getAllParents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${id}`);
        if (result.data) {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getParentByStudent = (studentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/ByStudent/${studentId}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteParent = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Parent/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteParents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Parents/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const updateParent = (fields, id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Parent/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const linkStudentToParent = (parentId, studentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Parent/Link/${parentId}/${studentId}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const unlinkStudentFromParent = (parentId, studentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Parent/Unlink/${parentId}/${studentId}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getStudentsByParent = (parentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/Students/${parentId}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getParentDashboard = (parentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parent/Dashboard/${parentId}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

// Upload profile photo
export const uploadParentPhoto = (photo) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const formData = new FormData();
        formData.append('photo', photo);

        const result = await axios.post(
            `${process.env.REACT_APP_BASE_URL}/ProfilePhotoUpload`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );

        if (result.data.photo) {
            dispatch(authSuccess({ ...result.data, photo: result.data.photo }));
            return result.data.photo;
        } else {
            dispatch(authFailed(result.data.message));
            return null;
        }
    } catch (error) {
        dispatch(authError(extractErrorMessage(error)));
        return null;
    }
};

