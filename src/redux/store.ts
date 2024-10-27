import {configureStore} from "@reduxjs/toolkit";
import profile from "./features/profile"
import selectPost from "./features/SelectPost"


const store = configureStore({
  reducer: {
    profile, selectPost
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export type RootState = ReturnType<typeof store | any>;
export type AppDispatch = typeof store.dispatch;
export default store
