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
    underControl,
} from './staffSlice';

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

// Simple Staff API functions (without login/authentication)

export const addSimpleStaff = (fields, schoolId) => async (dispatch) => {
    dispatch(authRequest());
    console.log('[Staff] Adding staff:', { fields, schoolId });

    try {
        // Check if there's a photo file in the fields
        if (fields.photo && typeof fields.photo !== 'string') {
            console.log('[Staff] Uploading photo first...');
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
            
            console.log('[Staff] Photo uploaded:', photoResult.data);
            // Add photo path to fields and remove the file object
            fields = { ...fields, photo: photoResult.data.photo };
        }
        
        console.log('[Staff] Sending request to save staff...');
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/SimpleStaff/add`, { ...fields, school: schoolId }, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        console.log('[Staff] Response:', result.data);
        
        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else if (result.data._id) {
            dispatch(doneSuccess(result.data));
            dispatch(underControl()); // Set status to "added" for component to detect
        } else {
            console.error('[Staff] Unknown response structure:', result.data);
            dispatch(authFailed("Unknown error occurred"));
        }
    } catch (error) {
        console.error('[Staff] Error adding staff:', error);
        console.error('[Staff] Error response:', error.response?.data);
        dispatch(authError(extractErrorMessage(error)));
    }
};

export const getAllSimpleStaffs = (schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SimpleStaffs/${schoolId}`);
        if (result.data) {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getSimpleStaffDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SimpleStaff/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteSimpleStaff = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/SimpleStaff/${id}`);
        if (result.data.message) {
            dispatch(getDeleteSuccess());
        } else {
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteAllSimpleStaffs = (schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/SimpleStaffs/${schoolId}`);
        if (result.data.message) {
            dispatch(getDeleteSuccess());
        } else {
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const registerStaff = (fields, role) => async (dispatch) => {
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
        
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/StaffReg`, fields, {
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

export const loginStaff = (fields) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/StaffLogin`, fields, {
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

export const logoutStaff = () => (dispatch) => {
    dispatch(authLogout());
};

export const getStaffDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Staff/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const getAllStaffs = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Staffs/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteStaff = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Staff/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const deleteStaffs = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/Staffs/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

export const updateStaff = (fields, id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/Staff/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(extractErrorMessage(error)));
    }
};

// Upload profile photo
export const uploadStaffPhoto = (photo) => async (dispatch) => {
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

// Health check for staff database connection
export const checkStaffDatabaseHealth = () => async (dispatch) => {
    dispatch(getRequest());
    console.log('[Staff] Checking database health...');

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/SimpleStaff/Health`);
        console.log('[Staff] Database health:', result.data);
        return result.data;
    } catch (error) {
        console.error('[Staff] Database health check failed:', error);
        return { database: 'error', error: extractErrorMessage(error) };
    }
};

