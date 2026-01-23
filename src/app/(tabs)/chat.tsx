import { selectToken } from "@/src/features/auth/authSelectors";
import {
  receiveMessage,
  sendOptimisticMessage,
} from "@/src/features/chat/chatSlice";
import {
  fetchMessageHistory,
  markChatRead,
} from "@/src/features/chat/chatThunk";
import { SupportMessage } from "@/src/features/chat/chatTypes";
import type { AppDispatch } from "@/src/store";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import "text-encoding";

export default function ChatRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: any) => state.chat.messages);

  const [message, setMessage] = useState("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const token = useSelector(selectToken);
  const baseURL = Constants.expoConfig?.extra?.API_URL;
  const apiHost = baseURL?.replace(/^http:\/\//, "");
  const flatListRef = useRef<FlatList>(null);

  // Fetch history and mark as read
  useEffect(() => {
    if (token) {
      dispatch(fetchMessageHistory());
      dispatch(markChatRead());
    }
  }, [token, dispatch]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: `ws://${apiHost}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000, // reconnect automatically
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log("STOMP debug:", str),
      onConnect: () => {
        client.subscribe("/user/queue/support", (msg) => {
          const receivedMessage = JSON.parse(msg.body) as SupportMessage;
          dispatch(
            receiveMessage({
              from: receivedMessage.from,
              to: receivedMessage.to,
              content: receivedMessage.content,
              messageType: receivedMessage.messageType,
              timestamp: receivedMessage.timestamp,
              read: false,
            }),
          );
        });
      },
      onStompError: (frame) => console.log("❌ STOMP error:", frame),
      onWebSocketError: (event) => console.log("❌ WebSocket error:", event),
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [token, dispatch]);

  // Send message
  const sendMessage = () => {
    if (!stompClient || !stompClient.connected || message.trim() === "") return;

    const optimisticMessage: SupportMessage = {
      from: "USER", // your user nickname from auth could go here
      to: "ADMIN",
      content: message,
      messageType: "TEXT",
      timestamp: new Date().toISOString(),
      read: true,
    };

    dispatch(sendOptimisticMessage(optimisticMessage));

    stompClient.publish({
      destination: "/app/support.send",
      body: JSON.stringify({ content: message }),
    });

    setMessage("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.title}>Support Chat</Text>

        <FlatList
          ref={flatListRef}
          inverted
          data={[...messages].reverse()} // inverted FlatList
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => {
            const isMine = item.from !== "ADMIN";
            return (
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.myBubble : styles.adminBubble,
                ]}
              >
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingInline: 10,
    paddingBottom: 20,
    backgroundColor: "#f5f5f5",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  inputRow: { flexDirection: "row", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  bubble: {
    maxWidth: "75%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#cce5ff",
    borderTopRightRadius: 0,
  },
  adminBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
    borderTopLeftRadius: 0,
  },
  bubbleText: { fontSize: 16 },
});
