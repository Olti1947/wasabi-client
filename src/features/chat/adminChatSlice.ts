import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatState {
  conversations: Record<string, ChatMessage[]>;
  selectedUser: string | null;
  unreadCounts?: Record<string, number>;
}

const initialState: ChatState = {
  conversations: {},
  selectedUser: null,
  unreadCounts: {},
};

const adminChatSlice = createSlice({
  name: "adminChat",
  initialState,
  reducers: {
    selectUser(state, action: PayloadAction<string>) {
      state.selectedUser = action.payload;
      state.unreadCounts![action.payload] = 0;
    },

    setConversation(
      state,
      action: PayloadAction<{ username: string; messages: ChatMessage[] }>,
    ) {
      const { username, messages } = action.payload;

      // filter out duplicates by id
      const existingIds = new Set(
        (state.conversations[username] || []).map((m) => m.id),
      );
      const filtered = messages.filter((m) => !existingIds.has(m.id));

      state.conversations[username] = [
        ...(state.conversations[username] || []),
        ...filtered,
      ];

      const unread = filtered.filter(
        (m) => !m.read && m.from !== "ADMIN",
      ).length;
      state.unreadCounts![username] =
        (state.unreadCounts![username] || 0) + unread;
    },

    addMessages(
      state,
      action: PayloadAction<{ username: string; messages: ChatMessage[] }>,
    ) {
      const { username, messages } = action.payload;

      const existingIds = new Set(
        (state.conversations[username] || []).map((m) => m.id),
      );
      const filtered = messages.filter((m) => !existingIds.has(m.id));

      state.conversations[username] = [
        ...(state.conversations[username] || []),
        ...filtered,
      ];
    },

    addMessage(
      state,
      action: PayloadAction<{ username: string; message: ChatMessage }>,
    ) {
      const { username, message } = action.payload;

      const exists = (state.conversations[username] || []).some(
        (m) => m.id === message.id,
      );
      if (!exists) {
        if (!state.conversations[username]) state.conversations[username] = [];
        state.conversations[username].push(message);
      }

      if (message.from !== "ADMIN" && !message.read) {
        state.unreadCounts![username] =
          (state.unreadCounts![username] || 0) + 1;
      }
    },

    setUnreadCounts(state, action: PayloadAction<Record<string, number>>) {
      state.unreadCounts = action.payload;
    },
  },
});

export const {
  selectUser,
  setConversation,
  addMessage,
  addMessages,
  setUnreadCounts,
} = adminChatSlice.actions;

export default adminChatSlice.reducer;
