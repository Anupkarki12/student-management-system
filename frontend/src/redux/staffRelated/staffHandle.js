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
} from './staffSlice';

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
        dispatch(authError(error));
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
        dispatch(authError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(authError(error));
        return null;
    }
};

