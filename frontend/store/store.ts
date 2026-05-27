import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/admin.slice";
import assignmentReducer from "./slices/assignment.slice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    assignment: assignmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
