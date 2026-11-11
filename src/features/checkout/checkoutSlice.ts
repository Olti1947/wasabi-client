import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Discount } from "../discount/discountTypes";
import { CartItemRequest, CheckoutPreview, CheckoutRequest, CheckoutState } from "./checkoutTypes";

export const previewCheckout = createAsyncThunk<
CheckoutPreview,
CheckoutRequest
>(
    'checkout/preview',
    async (payload) => {
        const res = await api.post('/api/checkout/preview', payload)
        return res.data;
    }
)

export const getAvailableCoupons = createAsyncThunk<
Discount[],
CartItemRequest[]
>(
    'checkout/availableDiscounts',
    async (payload) => {
      const res = await api.post('/api/checkout/availableDiscounts', payload);
      return res.data;
    }
)

const initialState: CheckoutState = {
    availableCoupons: [],
    selectedCouponId: null,
    preview: null,
    loading: false,
    error: null
}


const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.availableCoupons = [];
      state.selectedCouponId = null;
      state.preview = null;
      state.loading = false;
      state.error = null;
    },

    selectCoupon: (state, action) => {
      state.selectedCouponId = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(previewCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.preview = null;
      })
      .addCase(previewCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
      })
      .addCase(previewCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Preview failed';
      })

      .addCase(getAvailableCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.availableCoupons = [];
      })
      .addCase(getAvailableCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCoupons = action.payload;
      })
      .addCase(getAvailableCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch available coupons';
      });
  }
});

export const {resetCheckout, selectCoupon} = checkoutSlice.actions;
export default checkoutSlice.reducer