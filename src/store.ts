import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { Persistor, persistReducer, persistStore } from "redux-persist";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import adminChatReducer from "./features/chat/adminChatSlice";
import chatReducer from "./features/chat/chatSlice";
import checkoutReducer from "./features/checkout/checkoutSlice";
import discountReducer from "./features/discount/discountSlice";
import foodReducer from "./features/food/foodSlice";
import orderReducer from "./features/order/orderSlice";
import qrCodeReducer from "./features/qrScan/qrScanSlice";
// Persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "cart"], // only persist auth and cart slices
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  food: foodReducer,
  cart: cartReducer,
  discounts: discountReducer,
  checkout: checkoutReducer,
  chat: chatReducer,
  adminChat: adminChatReducer,
  order: orderReducer,
  qrCode: qrCodeReducer,
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

// --- Create persistor on client only ---
export const getPersistor = (): Persistor | null => {
  if (typeof window === "undefined") return null; // SSR safe
  return persistStore(store);
};

// --- Types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
