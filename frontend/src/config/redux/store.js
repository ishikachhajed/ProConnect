
import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";
/** 
 * 
 * STEPS FOR STATE MANAGEMENT
 * SUBMIT ACTION
 * HANDLE ACTION IN IT'S REDUCER
 * REGISTER HERE => REDUCER
 * 
 * 
 */

const store = configureStore({
    reducer: {
        auth: authReducer,
        postReducer:postReducer
    },
});
export default store;

