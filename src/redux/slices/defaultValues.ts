import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState<T> {
  values: any;
  DefaultValues: Partial<T>;
}

const initialState: FormState<any> = {
  values: {},
  DefaultValues: [],
};

const defaultValuesSlice = createSlice({
  name: 'DefaultValues',
  initialState,
  reducers: {
    setFormDefaultValues: <T>(state: FormState<T>, action: PayloadAction<Partial<T>>) => {
      state.DefaultValues = action.payload;
    },
  },
});

export const {
  setFormDefaultValues,
} = defaultValuesSlice.actions;

export default defaultValuesSlice.reducer;