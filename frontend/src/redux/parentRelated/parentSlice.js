import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    parentList: [],
    parent: null,
    userDetails: null,
    loading: false,
    error: null,
    response: null,
    status: "idle",
};

const parentSlice = createSlice({
    name: "parent",
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
            if (action.payload && action.payload.message) {
                state.response = action.payload.message;
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
            state.parent = action.payload;
            state.status = "added";
            // For dashboard data, also set userDetails for backward compatibility
            if (action.payload && action.payload.students) {
                state.userDetails = action.payload;
            }
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
            state.parent = action.payload;
            state.status = "success";
            // Store students in userDetails for dashboard access
            if (action.payload && action.payload.students) {
                state.userDetails = {
                    school: action.payload.school, // Store school info
                    students: action.payload.students.map(student => ({
                        studentId: student._id,
                        name: student.name,
                        rollNum: student.rollNum,
                        class: student.sclassName?.sclassName,
                        sclassName: student.sclassName, // Keep full sclassName object with _id for API calls
                        photo: student.photo
                    }))
                };
            }
            // If no students but parent has school info, store it
            if (action.payload && action.payload.school) {
                if (!state.userDetails) {
                    state.userDetails = {};
                }
                state.userDetails.school = action.payload.school;
            }
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
            state.parent = null;
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
} = parentSlice.actions;

export default parentSlice.reducer;

