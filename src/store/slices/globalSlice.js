import { createSlice } from "@reduxjs/toolkit";

const toDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = safeDate.getFullYear();
  const month = `${safeDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${safeDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialState = {
  reRenderSwitch: false,
  selectedDate: toDateKey(),
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    flipReRenderSwitch: (state) => {
      state.reRenderSwitch = !state.reRenderSwitch;
    },

    setSelectedDate: {
      reducer: (state, action) => {
        state.selectedDate = action.payload;
      },
      prepare: (value) => ({
        payload: toDateKey(value),
      }),
    },
  },
});

export const { flipReRenderSwitch, setSelectedDate } = globalSlice.actions;
export default globalSlice.reducer;

export const selectReRenderSwitch = (state) => state.global.reRenderSwitch;
export const selectSelectedDate = (state) => state.global.selectedDate;
