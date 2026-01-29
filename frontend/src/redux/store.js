import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './userRelated/userSlice';
import { studentReducer } from './studentRelated/studentSlice';
import { noticeReducer } from './noticeRelated/noticeSlice';
import { sclassReducer } from './sclassRelated/sclassSlice';
import { teacherReducer } from './teacherRelated/teacherSlice';
import { complainReducer } from './complainRelated/complainSlice';
import feeReducer from './feeRelated/feeSlice';
import { documentReducer } from './documentRelated/documentSlice';
import staffReducer from './staffRelated/staffSlice';
import parentReducer from './parentRelated/parentSlice';
import salaryReducer from './salaryRelated/salarySlice';

// Paths that may contain non-serializable values (error objects, Date objects, etc.)
const ignoredPaths = [
    'user.error',
    'student.error',
    'teacher.error',
    'notice.error',
    'complain.error',
    'fee.error',
    'document.error',
    'staff.error',
    'parent.error',
    'salary.error',
    'sclass.error',
    'user.tempDetails',
];

const store = configureStore({
    reducer: {
        user: userReducer,
        student: studentReducer,
        teacher: teacherReducer,
        notice: noticeReducer,
        complain: complainReducer,
        sclass: sclassReducer,
        fee: feeReducer,
        document: documentReducer,
        staff: staffReducer,
        parent: parentReducer,
        salary: salaryReducer
    },
    // Configure middleware to be more lenient with non-serializable values in development
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types that may contain non-serializable values
                ignoredActions: [
                    'teacher/getError',
                    'user/authError',
                    'user/getError',
                    'student/getError',
                    'notice/getError',
                    'complain/getError',
                    'fee/getError',
                    'document/getDocumentError',
                    'staff/getError',
                    'staff/authError',
                    'parent/getError',
                    'parent/authError',
                    'salary/getEmployeesFailed',
                    'salary/getSalaryRecordsFailed',
                    'salary/getEmployeeSalaryFailed',
                    'salary/paymentFailed',
                    'salary/bulkPaymentFailed',
                    'salary/updateSalaryFailed',
                    'salary/deleteSalaryFailed',
                ],
                ignoredPaths: ignoredPaths,
            },
            immutableCheck: {
                ignoredPaths: ignoredPaths,
            },
        }),
});

export default store;
