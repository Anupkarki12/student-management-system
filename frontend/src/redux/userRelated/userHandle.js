import axios from 'axios';

import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Login`, fields, {
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

export const registerUser = (fields, role) => async (dispatch) => {
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
        
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded());
        }
        else if (result.data.message) {
            dispatch(authFailed(result.data.message));
        }
        else if (result.data.rollNum || result.data._id) {
            // Student registration successful - no message field, just return the student object
            dispatch(stuffAdded());
        }
        else {
            dispatch(authFailed("Unknown error occurred"));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}


// export const deleteUser = (id, address) => async (dispatch) => {
//     dispatch(getRequest());
//     dispatch(getFailed("Sorry the delete function has been disabled for now."));
// }

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/${address}Create`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
}

// Upload profile photo
export const uploadProfilePhoto = (photo) => async (dispatch) => {
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

