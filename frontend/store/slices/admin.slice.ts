import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  _id: string;
  name: string;
  email: string;
};

interface IUser {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: IUser = {
  user: null,
  isAuthenticated: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAdmin: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdmin, clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;
