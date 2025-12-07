import { getGroupMessages } from "@/api/group";
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
  NativeScrollEvent,
  Image,
} from "react-native";
import { Text } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CaretLeft, PaperPlaneTilt } from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";
import { useAuth } from "@/context/Authcontext";
import { useSocket } from "@/context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { urlRegex } from "@/utils";
import { showSnack } from "@/components/common/CustomSnackbar";

const PAGE_SIZE = 10;

const ChatDetailScreen = () => {
  const { theme } = useTheme();
  const route: any = useRoute();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const groupId = route?.params?.group?.id || 16;
  const auth = useAuth();
  const { socket, onlineUsers } = useSocket(); // ⭐ Get online users globally
  const queryClient = useQueryClient();

  const currentUserId = auth?.user?.id ?? 0;

  const group = route.params?.group;
  const title = group?.name || "Chat";

  // ----------------------- STATES -----------------------
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typingRef = useRef<any>(null);
  const listRef = useRef<FlatList>(null);

  const formatTimeOnly = (timestamp: string) => {
    const d = new Date(timestamp);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const mapMessage = (msg: any) => ({
    id: msg.id,
    text: msg.content,
    time: msg.createdAt || new Date().toISOString(),
    sender: msg.senderId === currentUserId ? "me" : "other",
    senderName: msg.sender?.name || "Unknown User", // Assuming sender's name is available in the message
    senderAvatar: msg.sender?.image ||msg.sender?.avatar || "default_avatar_url", // Adding avatar link
  });

  // ----------------------- FIRST LOAD -----------------------
  useEffect(() => {
    loadMessages(1);
    socket?.emit("group_chat:mark_read", { groupId }); // Mark as read when component loads
    queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
  }, [socket]);

  const loadMessages = async (pageNum: number) => {
    try {
      const res = await getGroupMessages(groupId, {
        page: pageNum,
        limit: PAGE_SIZE,
      });

      const msgsASC = (res.data || [])
        .map(mapMessage)
        .sort(
          (a: any, b: any) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );

      const meta = res.meta;

      if (pageNum === 1) {
        setMessages(msgsASC);
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false });
        }, 50); // Delay to ensure rendering
      } else {
        setMessages((prev) => [...msgsASC, ...prev]);
      }

      setHasMore(meta.page < meta.lastPage);
    } catch (err) {
      console.log("Load FAILED:", err);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await loadMessages(page + 1);
    setPage((p) => p + 1);
    setLoadingMore(false);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y <= 20) loadMore();
  };

  // ----------------------- SOCKET EVENTS -----------------------
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_group", { groupId });

    socket.on("group_chat:new_group_message", (msg) => {
      console.log("new msg",JSON.stringify(msg))
      setMessages((prev) => [...prev, mapMessage(msg)]);
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50); // Delay to ensure proper scroll after new message
    });

    socket.on("group_chat:user_typing", ({ userId, typing }) => {
      if (userId !== currentUserId) setIsTyping(typing);
    });

    return () => {
      socket.off("group_chat:new_group_message");
      socket.off("group_chat:user_typing");
    };
  }, [socket]);

  // ----------------------- SEND MESSAGE -----------------------
  const sendMessage = () => {
    if (!input.trim() || !socket) return;
 if (urlRegex.test(input)) {
      showSnack('Links are not allowed', "error");
    return;
  }
    socket.emit("group_chat:send_message", {
      groupId,
      senderId: currentUserId,
      messageType: "text",
      content: input.trim(),
    });

    setInput("");
    socket.emit("group_chat:stop_typing", { groupId, userId: currentUserId });
  };

  const handleInput = (text: string) => {
    setInput(text);

    socket?.emit("group_chat:typing", { groupId, userId: currentUserId });

    if (typingRef.current) clearTimeout(typingRef.current);

    typingRef.current = setTimeout(() => {
      socket?.emit("group_chat:stop_typing", { groupId, userId: currentUserId });
    }, 1200);
  };

  const renderMessage = ({ item, index }: any) => {
    const isMe = item.sender === "me";

    let showTimeBlock = false;

    if (index === 0) {
      showTimeBlock = true;
    } else {
      const prev = new Date(messages[index - 1].time);
      const curr = new Date(item.time);
      const diffMinutes = (curr.getTime() - prev.getTime()) / 60000;
      if (diffMinutes >= 5) showTimeBlock = true;
    }

    return (
        

        <View
          style={[
            styles.messageRow,
            { justifyContent: isMe ? "flex-end" : "flex-start" },
          ]}
        >
          {!isMe && (
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Image
              source={{ uri: item.senderAvatar }}
              style={styles.avatar}
            />
          </View>
        )}
          <View style={{ maxWidth: "75%" }}>
            {!isMe && (
                        <Text style={styles.senderName}>{item.senderName}</Text>)}

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
                { textAlign: isMe ? "right" : "left" },
              ]}
            >
              {formatTimeOnly(item.time)}
            </Text>
          </View>
        </View>
    );
  };

  // ----------------------- UI -----------------------
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER WITH AVATAR + ONLINE DOT + STATUS */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <CaretLeft size={24} color="#000" />
        </TouchableOpacity>

        {/* Avatar + Name + Status */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ position: "relative", marginRight: 10 }}>
            {group?.image ? (
              <Image
                source={{ uri: group.image }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#ddd",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, color: "#555" }}>
                  {title?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {isTyping ? (
              <Text style={[styles.headerSub, { color: "#1BAD7A" }]}>Typing...</Text>
            ) : onlineUsers?.[group?.id] ? (
              <Text style={[styles.headerSub, { color: "#1BAD7A" }]}>Online</Text>
            ) : (
              <Text style={styles.headerSub}>{group?.membersCount} members</Text>
            )}
          </View>
        </View>
      </View>

      {/* CHAT LIST */}
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 10 }}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#777"
            value={input}
            onChangeText={handleInput}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <PaperPlaneTilt size={20} weight="fill" color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ----------------------- STYLES -----------------------
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

  backButton: { padding: 8, marginRight: 10 },

  headerTitle: { fontSize: 17, fontWeight: "700", color: "#000" },
  headerSub: { fontSize: 13, color: "#666" },

  messageRow: { flexDirection: "row", marginBottom: 16 },

  bubble: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

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

  senderName: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
});

export default ChatDetailScreen;
