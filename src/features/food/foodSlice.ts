import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';
import Constants from "expo-constants";
import { FoodItem } from "./foodTypes";

interface FetchFoodParams {
    page?: number;
    size?: number;
}

export const fetchFoodItems = createAsyncThunk(
    'food/fetchFoodItems',
    async ({page = 0, size = 10}: FetchFoodParams, {getState}) => {
        const response = await axios.get (`${Constants.expoConfig?.extra?.API_URL}/api/foods?page=${page}&size=${size}`);
    return response.data;
    }
);

const  foodSlice = createSlice({
    name: 'food',
    initialState: {
        items: [] as never | FoodItem[],
        loading: false,
        page: 0,
        totalPages: 1,
    },
    reducers: {
        resetFoodItems(state) {
            state.items = [];
            state.page = 0;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchFoodItems.pending, (state) => {
        state.loading = true;
    })
        .addCase(fetchFoodItems.fulfilled, (state, action) => { 
        state.loading = false;
        const {content, totalPages} = action.payload;
        state.items = [...state.items, ...content];
        state.totalPages = totalPages;
        state.page += 1;
    })
        .addCase(fetchFoodItems.rejected, (state) => {
        state.loading = false; 
        });
}})

export const { resetFoodItems } = foodSlice.actions;
export default foodSlice.reducer;