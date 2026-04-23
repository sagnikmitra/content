import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reRenderSwitch: false,
  selectedDate: new Date(),
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    flipReRenderSwitch: (state) => {
      state.reRenderSwitch = !state.reRenderSwitch;
    },

    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

export const { flipReRenderSwitch, setSelectedDate } = globalSlice.actions;
export default globalSlice.reducer;

export const selectReRenderSwitch = (state) => state.global.reRenderSwitch;
export const selectSelectedDate = (state) =>
  new Date(state.global.selectedDate);
