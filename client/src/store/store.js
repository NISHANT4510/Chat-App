// import { configureStore } from "@reduxjs/toolkit";
// import uiSlice from "./ui-slice";
// import userSlice from "./user-slice";




// const store  = configureStore({
//     reducer: {ui: uiSlice.reducer,user: userSlice.reducer}
// })

// export default store;

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user-slice";   // correct import (default export)
import uiSlice from "./ui-slice";       // assuming you have this

const store = configureStore({
  reducer: {
    user: userReducer,   // <-- MUST map reducer key here
    ui: uiSlice.reducer  // for your UI slice
  }
});

export default store;
