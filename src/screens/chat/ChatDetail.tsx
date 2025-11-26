// ChatDetailScreen.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { Text } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CaretLeft, PaperPlaneTilt } from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";
import { getChatRoomMessage } from "@/api/chat";
import { useAuth } from "@/context/Authcontext";
import { useSocket } from "@/context/SocketContext";
import { formatDate } from "@/utils";

const PAGE_SIZE = 10;

const ChatDetailScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const auth = useAuth();
  const socket = useSocket();

  const currentUserId = auth?.user?.id ?? 0;

  const route: any = useRoute();
  const roomId = route.params?.roomId;
  const room = route.params?.room;

  const title = room?.user1?.name || room?.user2?.name || "Chat";

  // ======================================
  // STATES
  // ======================================
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");

  const listRef = useRef<FlatList>(null);

  // ======================================
  // UTIL
  // ======================================
  const mapMessage = (msg: any) => ({
    id: msg.id,
    text: msg.content,
    time: msg.createdAt?.$date || msg.createdAt || msg.time || new Date().toISOString(),
    sender: msg.senderId === currentUserId ? "me" : "other",
  });

  // ======================================
  // FIRST LOAD
  // ======================================
  useEffect(() => {
    loadMessages(1);
  }, []);

  // ======================================
  // LOAD MESSAGE PAGE
  // Backend DESC → convert to ASC
  // ======================================
  const loadMessages = async (pageNumber: number) => {
    try {
      const res = await getChatRoomMessage(roomId, {
        page: pageNumber,
        limit: PAGE_SIZE,
      });

      let newMessagesASC = (res.data || [])
        .map(mapMessage)
        .reverse(); // Convert backend DESC → ASC

      const meta = res.meta || { page: 1, lastPage: 1 };

      if (pageNumber === 1) {
        setMessages(newMessagesASC); // first load
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false });
        }, 50);
      } else {
        setMessages((prev) => [...newMessagesASC, ...prev]); // prepend older messages
      }

      setHasMore(meta.page < meta.lastPage);
    } catch (error) {
      console.log("Load Messages Error:", error);
    }
  };

  // ======================================
  // LOAD MORE (only when SCROLL UP)
  // ======================================
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await loadMessages(page + 1);
    setPage((p) => p + 1);
    setLoadingMore(false);
  };

  // ======================================
  // SCROLL HANDLER (TOP SCROLL ONLY)
  // ======================================
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;

    // When user reaches TOP
    if (y <= 20 && !loadingMore && hasMore) {
      loadMore();
    }
  };

  // ======================================
  // SOCKET: JOIN ROOM + RECEIVE NEW MSG
  // ======================================
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", { roomId });

    socket.on("new_message", (msg) => {
      if (msg.senderId === currentUserId) return; // avoid duplicate

      const mapped = mapMessage(msg);

      setMessages((prev) => [...prev, mapped]);

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 60);
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  // ======================================
  // SEND MESSAGE
  // ======================================
  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const payload = {
      roomId,
      senderId: currentUserId,
      content: input.trim(),
      messageType: "text",
    };

    socket.emit("send_message", payload);

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "me",
        text: input,
        time: new Date().toISOString(), // REAL DATE
      },
    ]);

    setInput("");

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 60);
  };

  // ======================================
  // RENDER MESSAGE BUBBLE
  // ======================================
  const renderMessage = ({ item }: any) => {
    const isMe = item.sender === "me";

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        <View style={{ maxWidth: "75%" }}>
          <View
            style={[
              styles.bubble,
              isMe
                ? { backgroundColor: theme.colors.primary }
                : {
                    backgroundColor: theme.colors.primaryLight,
                    borderWidth: 0.3,
                    borderColor: theme.colors.primary,
                  },
            ]}
          >
            <Text style={{ color: isMe ? "#fff" : theme.colors.text }}>
              {item.text}
            </Text>
          </View>

          <Text
            style={[
              styles.time,
              { textAlign: isMe ? "right" : "left" } // FIXED ALIGNMENT
            ]}
          >
            {formatDate(item.time)}
          </Text>
        </View>
      </View>
    );
  };

  // ======================================
  // UI
  // ======================================
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <CaretLeft size={24} color="#000" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSub}>Messages</Text>
        </View>
      </View>

      {/* CHAT BODY */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          ListHeaderComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 10 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />

        {/* INPUT AREA */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#777"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <PaperPlaneTilt size={20} weight="fill" color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ======================================
// STYLES
// ======================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
  },

  backButton: {
    padding: 8,
    marginRight: 10,
  },

  headerTitle: { fontSize: 17, fontWeight: "700", color: "#000" },
  headerSub: { fontSize: 13, color: "#666" },

  messageRow: { flexDirection: "row", marginBottom: 16 },

  bubble: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },

  time: { color: "#999", fontSize: 11, marginTop: 4 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 0.4,
    borderTopColor: "#ddd",
  },

  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },

  sendBtn: {
    marginLeft: 12,
    backgroundColor: "#1BAD7A",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatDetailScreen;
