import api from "@/src/api/apiClient";
import { selectToken } from "@/src/features/auth/authSelectors";
import {
  addMessage,
  addMessages,
  ChatMessage,
  selectUser,
  setUnreadCounts,
} from "@/src/features/chat/adminChatSlice";
import { RootState } from "@/src/store";
import { colors } from "@/src/theme/colors";
import { Client } from "@stomp/stompjs";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function AdminChatRoute() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const { conversations, selectedUser, unreadCounts } = useSelector(
    (state: RootState) => state.adminChat,
  );

  const [users, setUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const apiHost = Constants.expoConfig?.extra?.API_URL?.replace(
    /^http:\/\//,
    "",
  );

  const fetchInbox = async () => {
    try {
      const userRes = await api.get<string[]>(`/api/chat/admin/inbox`);
      const unreadRes = await api.get<Record<string, number>>(
        "/api/chat/admin/unread-count",
      );
      setUsers(userRes.data);
      dispatch(setUnreadCounts(unreadRes.data));
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    }
  };

  // Fetch users
  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 120000); // fallback incase websocket disconnect
    return () => clearInterval(interval);
  }, []);

  // Fetch conversation for selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchConversation = async () => {
      try {
        const res = await api.get<ChatMessage[]>(
          `/api/chat/admin/conversation/${selectedUser}`,
        );
        dispatch(addMessages({ username: selectedUser, messages: res.data }));

        await api.post(`/api/chat/admin/mark-read/${selectedUser}`);
      } catch (error) {
        console.error("Failed to fetch conversation:", error);
      }
    };

    fetchConversation();
  }, [selectedUser, dispatch]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: `ws://${apiHost}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      onConnect: () => {
        console.log("✅ STOMP connected (admin)");
        client.subscribe("/topic/admin.support", (msg) => {
          const m = JSON.parse(msg.body);
          if (!conversations[m.from]) {
            api
              .get(`/api/chat/admin/conversation/${m.from}`)
              .then((res) => res.data)
              .then((messages: ChatMessage[]) =>
                dispatch(addMessages({ username: m.from, messages })),
              );
          } else {
            dispatch(addMessage({ username: m.from, message: m }));
          }

          // Also add to users list if not present
          if (!users.includes(m.from)) {
            setUsers((prev) => [...prev, m.from]);
          }
        });
        client.subscribe("/topic/admin.unread-counts", (msg) => {
          const counts = JSON.parse(msg.body) as Record<string, number>;
          dispatch(setUnreadCounts(counts));
        });
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [token, dispatch]);

  const sendReply = () => {
    if (!message || !selectedUser) return;

    const payload = { to: selectedUser, content: message };
    stompClient?.publish({
      destination: "/app/support.reply",
      body: JSON.stringify(payload),
    });

    dispatch(
      addMessage({
        username: selectedUser,
        message: {
          id: Date.now(),
          from: "ADMIN",
          to: selectedUser,
          content: message,
          timestamp: new Date().toISOString(),
          read: true,
        },
      }),
    );

    setMessage("");
  };

  const currentConversation = selectedUser ? conversations[selectedUser] : [];

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (currentConversation?.length) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [currentConversation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Users list */}
          <View style={styles.users}>
            <FlatList
              data={users}
              keyExtractor={(u) => u}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => dispatch(selectUser(item))}
                  style={[
                    styles.user,
                    selectedUser === item && styles.activeUser,
                  ]}
                >
                  <Text>{item}</Text>
                  {unreadCounts && unreadCounts[item] > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {unreadCounts[item]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Chat area */}
          <View style={styles.chat}>
            {selectedUser ? (
              <>
                <FlatList
                  ref={flatListRef}
                  inverted
                  data={currentConversation || []}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{
                    flexDirection: "column-reverse",
                    paddingTop: 10,
                  }}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.msg,
                        item.from === "ADMIN"
                          ? styles.adminMsg
                          : styles.userMsg,
                      ]}
                    >
                      <Text>{item.content}</Text>
                    </View>
                  )}
                />

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Reply..."
                  />
                  <Button title="Send" onPress={sendReply} />
                </View>
              </>
            ) : (
              <Text>Select a user</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", paddingBottom: 10 },
  users: { width: 120, backgroundColor: "#eee" },
  user: { padding: 12 },
  activeUser: { backgroundColor: "#ddd" },
  chat: { flex: 1, padding: 10 },
  msg: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "80%",
  },
  adminMsg: { alignSelf: "flex-end", backgroundColor: "#cce5ff" },
  userMsg: { alignSelf: "flex-start", backgroundColor: "#eee" },
  inputRow: { flexDirection: "row", marginTop: 5 },
  input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 5 },
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    textAlign: "center",
    width: 20,
  },
  unreadBadgeText: {
    color: "white",
    paddingHorizontal: 6,
    fontSize: 12,
  },
});
