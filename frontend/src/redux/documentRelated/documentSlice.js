import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    documentsList: [],
    loading: false,
    error: null,
    response: null,
};

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        getDocumentRequest: (state) => {
            state.loading = true;
        },
        getDocumentSuccess: (state, action) => {
            state.documentsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getDocumentFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getDocumentError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        // Add document related actions
        addDocumentRequest: (state) => {
            state.loading = true;
        },
        addDocumentSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.response = 'success';
        },
        addDocumentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteDocumentRequest: (state) => {
            state.loading = true;
        },
        deleteDocumentSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.response = 'deleted';
        },
        deleteDocumentFailed: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    getDocumentRequest,
    getDocumentSuccess,
    getDocumentFailed,
    getDocumentError,
    addDocumentRequest,
    addDocumentSuccess,
    addDocumentFailed,
    deleteDocumentRequest,
    deleteDocumentSuccess,
    deleteDocumentFailed
} = documentSlice.actions;

export const documentReducer = documentSlice.reducer;

