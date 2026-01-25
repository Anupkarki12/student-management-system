import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    feesList: [],
    loading: false,
    error: null,
    response: null,
};

const feeSlice = createSlice({
    name: 'fee',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.feesList = action.payload;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.response = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.response = null;
        },
        stuffDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = "Done";
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone,
} = feeSlice.actions;

export default feeSlice.reducer;

