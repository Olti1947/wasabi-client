import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FoodItem } from "./foodTypes";

interface FetchFoodParams {
    page?: number;
    size?: number;
    search?: string | null;
}

export const fetchFoodItems = createAsyncThunk(
    'food/fetchFoodItems',
    async ({page = 0, size = 10, search}: FetchFoodParams, {getState}) => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

    if (search) {
      params.append("search", search);
    }

        const response = await api.get (`/api/foods?${params.toString()}`);
    return response.data;
    }
);

const  foodSlice = createSlice({
    name: 'food',
    initialState: {
        items: [] as FoodItem[],
        loading: false,
        page: 0,
        totalPages: 1,
        search: null as string | null,
    },
    reducers: {
        resetFoodItems(state) {
            state.items = [];
            state.page = 0;
        }
    },
    extraReducers: (builder) => {
    builder
      // FETCH START
      .addCase(fetchFoodItems.pending, (state, action) => {
        state.loading = true;

        // New search or fresh load
        if (action.meta.arg.page === 0) {
          state.items = [];
        }
      })

      // FETCH SUCCESS
      .addCase(fetchFoodItems.fulfilled, (state, action) => {
        const { content, totalPages, number } = action.payload;

        state.loading = false;
        state.page = number;
        state.totalPages = totalPages;

        if (number === 0) {
          // replace items
          state.items = content;
        } else {
          // append items
          state.items = [...state.items, ...content];
        }
      })

      // FETCH ERROR
      .addCase(fetchFoodItems.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const { resetFoodItems } = foodSlice.actions;
export default foodSlice.reducer;