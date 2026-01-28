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
            state.response = action.payload;
            if (Array.isArray(action.payload)) {
                state.noticesList = action.payload;
            } else if (action.payload && action.payload.message) {
                state.response = action.payload.message;
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
            state.response = action.payload;
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

