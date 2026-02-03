import api from "@/src/api/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserScanInfo } from "./qrScanTypes";

export const fetchScanInfo = createAsyncThunk<UserScanInfo, string>(
  "qrScan/fetchScanInfo",
  async (qrToken: string) => {
    const response = await api.get(`/api/admin/qr/${qrToken}`);
    return response.data;
  },
);

const initialState = {
  selectedUser: null as UserScanInfo | null,
  loading: false,
};

const qrCodeSlice = createSlice({
  name: "qrScan",
  initialState,
  reducers: {
    resetQrCode(state) {
      state.selectedUser = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchScanInfo.pending, (state, action) => {
        state.loading = true;
      })

      .addCase(fetchScanInfo.fulfilled, (state, action) => {
        const user = action.payload;

        state.loading = false;
        state.selectedUser = user;
      })

      .addCase(fetchScanInfo.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { resetQrCode } = qrCodeSlice.actions;
export default qrCodeSlice.reducer;
