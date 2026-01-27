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
} from './parentSlice';

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
        dispatch(authError(error));
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
        dispatch(authError(error));
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
        dispatch(getError(error));
    }
};

export const getAllParents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Parents/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(getError(error));
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
        dispatch(authError(error));
        return null;
    }
};

