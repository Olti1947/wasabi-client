import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Banner } from "./bannerType";

export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async () => {
    const response = await api.get("/api/banner-images");
    console.log("Fetched banners:", response.data);
    return response.data as Banner[];
  },
);

const initialState = {
  loading: false,
  banners: [] as Banner[],
};

export const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.fulfilled, (state, action) => {
        return {
          ...state,
          banners: action.payload,
          loading: false,
        };
      })
      .addCase(fetchBanners.rejected, (state) => {
        return {
          ...state,
          banners: [],
          loading: false,
        };
      })
      .addCase(fetchBanners.pending, (state) => {
        return {
          ...state,
          loading: true,
        };
      });
  },
});

export default bannerSlice.reducer;
