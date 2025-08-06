import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState<T> {
  formData: Partial<T>;
}

const initialState: FormState<any> = {
  formData: [],
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: <T>(state: FormState<T>, action: PayloadAction<Partial<T>>) => {
      state.formData = action.payload;
    },
  },
});

export const {
  setFormData,
} = formSlice.actions;

export default formSlice.reducer;