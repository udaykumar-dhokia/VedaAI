import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  _id: string;
  name: string;
  email: string;
  school: string;
};

interface IUser {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: IUser = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const adminSlice = createSlice({
  name: "admin",
  initialState: initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearAdmin: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setAdmin, clearAdmin, setLoading } = adminSlice.actions;
export default adminSlice.reducer;
