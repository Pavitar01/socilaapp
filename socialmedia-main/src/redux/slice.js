import { createSlice } from "@reduxjs/toolkit";

export const UserSlice = createSlice({
  name: "userData",
  initialState: {
    user: null,
    roomId: null,
  },
  reducers: {
    AddUser: (state, action) => {
      state.user = action.payload;
    },
    DelUser: (state) => {
      state.user = null;
    },
    SetRoom: (state, action) => {
      state.roomId = action.payload.roomId;
    },
  },
});

export const { AddUser, DelUser, SetRoom } = UserSlice.actions;
export default UserSlice.reducer;
