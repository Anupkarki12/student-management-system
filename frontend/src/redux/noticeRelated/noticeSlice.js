import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    noticesList: [],
    loading: false,
    error: null,
    response: null,
    status: "idle",
};

const noticeSlice = createSlice({
    name: "notice",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = false;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.error = false;
            state.response = null;
            
            // Handle different response formats safely
            if (Array.isArray(action.payload)) {
                state.noticesList = action.payload;
            } else if (action.payload && typeof action.payload === 'object') {
                // Handle object responses (like API error responses)
                if (action.payload.message) {
                    state.response = String(action.payload.message);
                } else if (action.payload.error) {
                    state.response = String(action.payload.error);
                } else {
                    // Log unexpected object for debugging
                    console.warn('Unexpected payload object in getSuccess:', action.payload);
                    state.response = 'Unexpected response format';
                }
                state.noticesList = [];
            } else if (typeof action.payload === 'string') {
                state.response = action.payload;
                state.noticesList = [];
            } else {
                state.noticesList = [];
            }
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = true;
            state.response = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = true;
            // Handle AxiosError objects - extract serializable message
            const payload = action.payload;
            if (payload && typeof payload === 'object') {
                // Handle AxiosError
                if (payload.message) {
                    state.response = String(payload.message);
                } else if (payload.error) {
                    state.response = String(payload.error);
                } else {
                    // Log unexpected object for debugging
                    console.warn('Unexpected error object in getError:', payload);
                    state.response = 'An error occurred';
                }
            } else if (typeof payload === 'string') {
                state.response = payload;
            } else {
                state.response = 'An error occurred';
            }
        },
        doneSuccess: (state, action) => {
            state.loading = false;
            state.error = false;
            state.response = null;
        },
        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = false;
            state.response = null;
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    doneSuccess,
    getDeleteSuccess,
} = noticeSlice.actions;

export const noticeReducer = noticeSlice.reducer;
export default noticeSlice.reducer;

