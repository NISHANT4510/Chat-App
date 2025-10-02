import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user-slice";
import uiSlice from "./ui-slice";
import messagesReducer from "./messagesReducer";

const store = configureStore({
    reducer: {
        user: userReducer,
        ui: uiSlice.reducer,
        messages: messagesReducer
    }
});

export default store;
