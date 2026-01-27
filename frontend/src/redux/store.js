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
        parent: parentReducer
    },
});

export default store;
