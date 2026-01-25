import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './feeSlice';

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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
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
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        dispatch(getError(errorMessage));
    }
}

