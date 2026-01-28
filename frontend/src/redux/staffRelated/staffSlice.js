import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    staffList: [],
    staff: null,
    loading: false,
    error: null,
    response: null,
    status: "idle",
};

const staffSlice = createSlice({
    name: "staff",
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
            // Set staffList if the payload is an array of staff
            if (Array.isArray(action.payload)) {
                state.staffList = action.payload;
            } else if (action.payload && action.payload.message) {
                state.response = action.payload.message;
                state.staffList = [];
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
            state.staff = action.payload;
        },
        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = false;
            state.response = null;
        },
        underControl: (state) => {
            state.loading = false;
            state.response = null;
            state.status = "added";
        },
        authRequest: (state) => {
            state.loading = true;
            state.error = false;
        },
        authSuccess: (state, action) => {
            state.loading = false;
            state.error = false;
            state.staff = action.payload;
            state.status = "success";
        },
        authFailed: (state, action) => {
            state.loading = false;
            state.error = true;
            state.response = action.payload;
            state.status = "failed";
        },
        authError: (state, action) => {
            state.loading = false;
            state.error = true;
            state.response = action.payload;
            state.status = "error";
        },
        authLogout: (state) => {
            state.staff = null;
            state.status = "logout";
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
    underControl,
    authRequest,
    authSuccess,
    authFailed,
    authError,
    authLogout,
} = staffSlice.actions;

export default staffSlice.reducer;

