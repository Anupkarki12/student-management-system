import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    marksList: [],
    loading: false,
    error: null,
    response: null,
};

const marksSlice = createSlice({
    name: 'marks',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.response = null;
        },
        getSuccess: (state, action) => {
            state.loading = false;
            state.marksList = action.payload;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.response = action.payload;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { getRequest, getSuccess, getFailed, getError } = marksSlice.actions;
export default marksSlice.reducer;

