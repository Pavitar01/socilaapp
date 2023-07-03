import { createSlice } from '@reduxjs/toolkit';

const commentsSlice = createSlice({
  name: 'comments',
  initialState: [],
  reducers: {
    addComment: (state, action) => {
      state.push(action.payload);
    },
    setComments: (state, action) => {
      return action.payload;
    },
    clearComments: (state) => {
      state.splice(0, state.length);
    },
  },
});

export const { addComment, setComments, clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
