import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Text } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CaretLeft, PaperPlaneTilt } from "phosphor-react-native";
import { useTheme } from "@/theme/ThemeContext";

const ChatDetailScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const route = useRoute() as any;
  const chat = route.params?.chat ?? {};
  const title = chat?.name ?? "Chat";

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "other",
      user: "Ahmed Hassan",
      initials: "AH",
      text: "Welcome everyone to the group! Feel free to share your thoughts and ideas.",
      time: "10:30 AM",
    },
    {
      id: "2",
      sender: "other",
      user: "Fatima Al-Rashid",
      initials: "FA",
      text: "Thanks for creating this group! Excited to be here.",
      time: "10:45 AM",
    },
    {
      id: "3",
      sender: "me",
      text: "Looking forward to great discussions!",
      time: "11:20 AM",
    },
    {
      id: "4",
      sender: "other",
      user: "Omar Khalil",
      initials: "OK",
      text: "This is exactly what I was looking for. Great initiative!",
      time: "11:35 AM",
    },
    {
      id: "5",
      sender: "other",
      user: "Fatima Al-Rashid",
      initials: "FA",
      text: "I have some ideas to share later today.",
      time: "2:15 PM",
    },
    {
      id: "6",
      sender: "me",
      text: "Can’t wait to hear them!",
      time: "2:20 PM",
    },
  ]);

  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "me",
        text: input.trim(),
        time: "Now",
      },
    ]);

    setInput("");
    scrollToBottom();
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender === "me";

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        {!isMe && (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.primaryLight,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "700",
              }}
            >
              {item.initials}
            </Text>
          </View>
        )}

        <View style={{ maxWidth: "78%" }}>
          {!isMe && (
            <Text
              style={{
                color: theme.colors.textLight,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              {item.user}
            </Text>
          )}

          {/* ❌ reply removed */}
          {false && <></>}

          <View
            style={[
              styles.bubble,
              isMe
                ? {
                    backgroundColor: theme.colors.primary,
                  }
                : {
                    backgroundColor: theme.colors.primaryLight,
                    borderWidth: 0.25,
                    borderColor: theme.colors.primary,
                  },
            ]}
          >
            <Text
              style={{
                color: isMe
                  ? theme.colors.textWhite
                  : theme.colors.text,
              }}
            >
              {item.text}
            </Text>
          </View>

          <Text
            style={{
              color: theme.colors.textLight,
              fontSize: 11,
              marginTop: 4,
              marginLeft: 4, // ✅ always left aligned
            }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: "#fff" },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <CaretLeft size={24} color="#000" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>California Photography Enthusiasts</Text>
          <Text style={styles.headerSub}>📸 1243 members</Text>
        </View>

        <View style={{ width: 35 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

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

/* --------------------------------------
 * Styles
 * ------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
  },
  backButton: { padding: 8, marginRight: 10 },

  headerTitle: { fontSize: 17, fontWeight: "700", color: "#000" },
  headerSub: { fontSize: 13, color: "#666", marginTop: 2 },

  messageRow: { flexDirection: "row", gap: 10, marginBottom: 18 },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.25,   // ✅ FIXED
    justifyContent: "center",
    alignItems: "center",
  },

  bubble: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 0.4,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#1BAD7A",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatDetailScreen;
