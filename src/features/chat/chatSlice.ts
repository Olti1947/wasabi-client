import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SupportMessage } from "./chatTypes";

interface ChatState {
  messages: SupportMessage[];
  unreadCount: number;
}

const initialState: ChatState = {
  messages: [],
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    loadHistory(state, action: PayloadAction<SupportMessage[]>) {
      state.messages = action.payload;
      state.unreadCount = action.payload.filter((m) => !m.read).length;
    },
    receiveMessage(state, action: PayloadAction<SupportMessage>) {
      state.messages.push(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },

    markAllRead(state) {
      state.messages.forEach((message) => {
        message.read = true;
      });
      state.unreadCount = 0;
    },

    sendOptimisticMessage(state, action: PayloadAction<SupportMessage>) {
      state.messages.push({
        ...action.payload,
        read: true,
      });
    },
  },
});

export const {
  loadHistory,
  receiveMessage,
  markAllRead,
  sendOptimisticMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
