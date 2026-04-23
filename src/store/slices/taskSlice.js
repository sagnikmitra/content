import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  task: {
    id: 0,
    title: "",
    description: "",
    date: null,
    time: null,
    type: null,
    instagram: ``,
    discord: ``,
    twitter: ``,
    linkedin: ``,
    pictures: [],
    createdAt: null,
    updatedAt: null,
  },
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    updateTask: (state, action) => {
      state.task = {
        ...state.task,
        ...action.payload,
        id: action.payload._id,
      };
    },
    resetTask: (state) => {
      state.task = initialState.task;
    },
  },
});

export const { resetTask, updateTask } = taskSlice.actions;
export default taskSlice.reducer;

export const selectTask = (state) => state.task.task;
