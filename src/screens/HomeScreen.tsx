import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text, Card } from '../components';  // Assuming Button is unused here
import CustomBottomSheet from '../components/BottomSheet'; // Import your bottom sheet component

type Comment = {
  id: string;
  user: string;
  text: string;
};

type Post = {
  id: string;
  name: string;
  location: string;
  content: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
};

const posts: Post[] = [
  {
    id: '1',
    name: 'Jane Doe',
    location: 'California',
    content: 'Lorem ipsum dolor sit amet consectetur...',
    likes: 15,
    commentsCount: 24,
    comments: [
      { id: 'c1', user: 'User 1', text: 'Nice post!' },
      { id: 'c2', user: 'User 2', text: 'I agree!' },
    ],
  },
  {
    id: '2',
    name: 'John Smith',
    location: 'New York',
    content: 'Praesent sit amet nulla vitae justo facilisis...',
    likes: 12,
    commentsCount: 9,
    comments: [{ id: 'c3', user: 'User 3', text: 'Great insight.' }],
  },
  // Add more posts as needed
];

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedComments, setSelectedComments] = useState<Comment[]>([]);

  const openComments = (comments: Comment[]) => {
    setSelectedComments(comments);
    setCommentsVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {posts.map((post) => (
          <Card key={post.id} style={styles.card}>
            <View style={{display:'flex',flexDirection:'row',gap:8,alignItems:'center',marginBottom:8}}>
              <View>
                <View style={{width:24,height:24,backgroundColor:'#5F6367',borderRadius:'50%'}}>

                </View>
             
              </View>
              <View>
                <Text variant="caption" color={theme.colors.text} textAlign="left">{post.name}</Text>
                <Text variant="caption" color={theme.colors.textLight} textAlign="left">{post.location}</Text>

                </View>
              </View>
              <Text variant="body1" color={theme.colors.textLight} textAlign="left">{post.content}</Text>
              {/* <Text style={[styles.name, { color: theme.colors.text }]}>{post.name}</Text>
            <Text style={[styles.location, { color: theme.colors.text }]}>{post.location}</Text>
            <Text style={{ color: theme.colors.text, marginBottom: 10 }}>{post.content}</Text>

            <View style={styles.row}>
              <Text style={{ color: theme.colors.text }}>👍 {post.likes}</Text>
              <TouchableOpacity onPress={() => openComments(post.comments)}>
                <Text style={[styles.commentsText, { color: theme.colors.primary }]}>
                  💬 Comments ({post.commentsCount})
                </Text>
              </TouchableOpacity>
            </View> */}
          </Card>
        ))}
      </ScrollView>

      <CustomBottomSheet visible={commentsVisible} onClose={() => setCommentsVisible(false)}>
        <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Comments</Text>
        {selectedComments.length === 0 ? (
          <Text style={{ color: theme.colors.text }}>No comments yet.</Text>
        ) : (
          selectedComments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={[styles.commentUser, { color: theme.colors.text }]}>{comment.user}</Text>
              <Text style={{ color: theme.colors.text }}>{comment.text}</Text>
            </View>
          ))
        )}
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    // shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  location: { marginBottom: 5, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentsText: { fontWeight: '600' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  comment: { marginBottom: 15 },
  commentUser: { fontWeight: 'bold' },
});

export default HomeScreen;
