import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import authReducer from '../features/auth/authSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only persist auth slice
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }),
});

export const persistor = persistStore(store);

// --- Types ---
// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;

// For async actions (Thunk)
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
