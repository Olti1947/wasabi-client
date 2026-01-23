import api from "@/src/api/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loadHistory, markAllRead } from "./chatSlice";

export const fetchMessageHistory = createAsyncThunk(
  "chat/fetchHistory",
  async (_, thunkAPI) => {
    const res = await api.get("/api/chat/history");
    thunkAPI.dispatch(loadHistory(res.data));
  },
);

export const markChatRead = createAsyncThunk(
  "chat/markRead",
  async (_, thunkAPI) => {
    await api.post("/api/chat/read");
    thunkAPI.dispatch(markAllRead());
  },
);
