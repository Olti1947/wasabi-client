import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Order } from "../order/orderTypes";
import { CartItem } from "./cartTypes";

export const fetchCurrentOrder = createAsyncThunk<
  Order,
  void,
  { rejectValue: string }
>("cart/fetchCurrentOrder", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Order>("/api/checkout/current-order");
    return response.data;
  } catch (error) {
    return rejectWithValue("Failed to fetch current order");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [] as CartItem[],
    currentOrder: null as Order | null,
  },
  reducers: {
    addToCart(state, action) {
      const { id, name, description, price, imageUrl, quantity } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, name, description, price, imageUrl, quantity });
      }
    },
    updateCartItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeFromCart(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    resetCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(fetchCurrentOrder.rejected, (state, action) => {
        alert("Failed to fetch current order: " + action.payload);
      });
  },
});

export const { addToCart, updateCartItemQuantity, removeFromCart, resetCart } =
  cartSlice.actions;
export default cartSlice.reducer;
