import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Discount } from "./discountTypes";

export const activateDiscount = createAsyncThunk(
    'discounts/activate',
    async (discountId: number, {rejectWithValue}) => {

       try {
        await api.post('/api/discounts/activate', {
            discountId
        });
        return discountId;
    } catch (err: any) {
            return rejectWithValue(err.response?.data || 'Activation failed');
        }
}
)


export const fetchAvailableDiscounts = createAsyncThunk(
    'discounts/fetchAvailable',
    async () => {
        const response = await api.get('/api/discounts/available')
        return response.data
    }
)

export const fetchActiveDiscounts = createAsyncThunk(
    'discounts/fetchActive', 
    async () => {
        const response = await api.get('/api/discounts/user-active')
        return response.data
    }
)

const discountSlice = createSlice({
    name: 'discounts',
    initialState: {
        available: [] as Discount[],
        active: [] as Discount[],
        loading: false
    },
    reducers: {

    },
    extraReducers : (builder) => {
        builder
        .addCase(fetchAvailableDiscounts.pending, (state, action) => {
            state.loading = true;
        })
        .addCase(fetchAvailableDiscounts.fulfilled, (state, action) => {
            state.loading = false;
            state.available = action.payload;
        })

        .addCase(fetchAvailableDiscounts.rejected, (state) => {
            state.loading = false
        })
        .addCase(fetchActiveDiscounts.pending, (state) => {
    state.loading = true;
})
    .addCase(fetchActiveDiscounts.fulfilled, (state, action) => {
    state.loading = false;
    state.active = action.payload;
})
    .addCase(fetchActiveDiscounts.rejected, (state) => {
    state.loading = false;
})
      .addCase(activateDiscount.fulfilled, (state, action) => {
                const discountId = action.payload;
                const discount = state.available.find(d => d.id === discountId);
                if (discount) {
                    state.active.push(discount);
                    state.available = state.available.filter(d => d.id !== discountId);
                }
            });

    }
})

export default discountSlice.reducer;