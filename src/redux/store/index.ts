import { combineReducers, configureStore, PreloadedStateShapeFromReducersMapObject } from '@reduxjs/toolkit';
import { api } from '@/config/api';

import { APP_TITLE } from '@/config/general';
import loadingReducer from '../slices/loadingSlice';
import formSlice from '../slices/formSlice';
import formOptionsSlice from '../slices/formOptionsSlice';
import defaultValuesSlice from '../slices/defaultValues';



const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  loading:loadingReducer,
  form:formSlice,
  formOptions: formOptionsSlice,
  DefaultValues:defaultValuesSlice
});

export const setupStore = (preloadedState?: PreloadedStateShapeFromReducersMapObject<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: {
      name: APP_TITLE,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
