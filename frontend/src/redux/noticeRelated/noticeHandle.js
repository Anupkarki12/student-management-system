import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';

export const getAllNotices = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        console.log(`📡 API Call: GET /${address}List/${id}`);
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/${address}List/${id}`);
        
        console.log(`📊 API Response:`, result.data);
        
        if (result.data.message) {
            console.log(`ℹ️ API Message: ${result.data.message}`);
            dispatch(getFailed(result.data.message));
        } else if (Array.isArray(result.data)) {
            console.log(`✅ Success: Found ${result.data.length} notices`);
            dispatch(getSuccess(result.data));
        } else {
            console.log(`⚠️ Unexpected response format:`, result.data);
            dispatch(getFailed('Invalid response format'));
        }
    } catch (error) {
        console.error(`❌ API Error:`, error.message);
        if (error.response) {
            console.error(`📨 Response status: ${error.response.status}`);
            console.error(`📄 Response data:`, error.response.data);
            
            // Extract serializable error message
            const errorMessage = error.response.data?.message 
                || error.response.data?.error 
                || `Server error (${error.response.status})`;
            dispatch(getError(errorMessage));
        } else if (error.request) {
            // Network error (no response received)
            dispatch(getError('Unable to connect to server. Please check your connection.'));
        } else {
            // Something else went wrong
            dispatch(getError(error.message || 'An unknown error occurred'));
        }
    }
}

// Force refresh notices - useful after adding a new notice
export const refreshNotices = (id, address) => async (dispatch) => {
    console.log('🔄 Manual refresh triggered for notices');
    dispatch(getSuccess([])); // Clear current notices
    dispatch(getAllNotices(id, address)); // Fetch fresh data
}

