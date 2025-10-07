import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Text } from '@/components';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CaretLeft } from 'phosphor-react-native';
import { useTheme } from '@/theme/ThemeContext';

const GRADIENT = ['#166152', '#004334'];
const HEADER_HEIGHT = 56;
const INPUT_BAR_APPROX = 64; // input height + padding

const ChatDetailScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute() as any;
  const chat = route.params?.chat ?? {};
  const title = chat?.name ?? 'Chat';

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey, raincheck on that event??', time: '3:30 PM', sender: 'other' },
    { id: '2', text: 'Okay, no problem!', time: '3:31 PM', sender: 'me' },
    { id: '3', text: 'Sounds good! What about next week?', time: '3:32 PM', sender: 'other' },
    { id: '4', text: 'Let’s reschedule for Friday.', time: '3:33 PM', sender: 'me' },
    { id: '5', text: 'Can we push it to the weekend?', time: '3:34 PM', sender: 'other' },
    { id: '6', text: 'Sure, how about Saturday?', time: '3:35 PM', sender: 'me' },
    { id: '7', text: 'Looking forward to it! Sunday works too.', time: '3:36 PM', sender: 'other' },
    { id: '8', text: 'Perfect, see you then!', time: '3:37 PM', sender: 'me' },
    { id: '9', text: 'Any updates for our meet next week?', time: '3:38 PM', sender: 'other' },
    { id: '10', text: 'Still confirming with the team — will update soon!', time: '3:39 PM', sender: 'me' },
    { id: '11', text: 'Cool, I’ll keep my weekend free then.', time: '3:40 PM', sender: 'other' },
    { id: '12', text: 'By the way, did you check the new place downtown?', time: '3:41 PM', sender: 'other' },
    { id: '13', text: 'Not yet, but I heard it’s really good!', time: '3:42 PM', sender: 'me' },
    { id: '14', text: 'Yeah, we can try it after our meetup.', time: '3:43 PM', sender: 'other' },
    { id: '15', text: 'Perfect plan 🙌', time: '3:44 PM', sender: 'me' },
  ]);

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const scrollToEnd = () => {
    // slight delay lets layout settle before scrolling
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), time: 'Now', sender: 'me' },
    ]);
    setInput('');
    scrollToEnd();
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.sender === 'me';
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.otherBubble,
            { backgroundColor: isMe ? theme.colors.primaryDark : theme.colors.chatDark },
          ]}
        >
          <Text variant="body1" color={theme.colors.textWhite}>
            {item.text}
          </Text>
          <Text variant="overline" style={styles.time}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      <LinearGradient
        colors={GRADIENT}
        style={[styles.headerWrap, { height: insets.top + HEADER_HEIGHT }]}
      >
        <View style={[styles.headerRow, { marginTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
            <CaretLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{title?.charAt(0) ?? 'U'}</Text>
              </View>
            </View>

            <View style={styles.userText}>
              <Text style={styles.userName}>{title}</Text>
              <View style={styles.statusRow}>
                <View style={styles.dotOnline} />
                <Text style={styles.userStatus}>Online</Text>
              </View>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // header (56) + status bar inset
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + HEADER_HEIGHT : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.listContent,
          ]}
          onContentSizeChange={scrollToEnd}    // 👈 auto-scroll when content grows
          onLayout={scrollToEnd}               // 👈 auto-scroll on first paint
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={<View style={{ height: 0 }} />}
        />

        {/* Input bar */}
        <View style={[styles.inputRow, { borderTopColor: '#ccc', }]}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  headerWrap: {
    width: '100%',
    position: 'relative',
  },
  headerRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: { padding: 16 },
  messageContainer: { marginVertical: 4 },
  myMessageContainer: { alignItems: 'flex-end' },
  otherMessageContainer: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 10,
  },
  myBubble: { borderTopRightRadius: 0 },
  otherBubble: { borderTopLeftRadius: 0 },
  time: {
    fontSize: 11,
    color: '#ddd',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#1BAD7A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendText: { color: '#fff', fontWeight: '600' },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrap: { marginRight: 10 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontWeight: '700', fontSize: 18 },
  userText: { flexDirection: 'column' },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dotOnline: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF84', marginRight: 5 },
  userStatus: { color: '#d2f9e4', fontSize: 13 },
});

export default ChatDetailScreen;
