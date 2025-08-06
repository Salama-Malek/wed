import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormOptionsState {
  titles: string;
}

const initialState: FormOptionsState = {
  titles: "",
};

const formOptionsSlice = createSlice({
  name: "formOptions",
  initialState,
  reducers: {
    setTitles(state, action: PayloadAction<string>) {
      state.titles = action.payload;
    },
  },
});

export const { setTitles } = formOptionsSlice.actions;
export default formOptionsSlice.reducer;
