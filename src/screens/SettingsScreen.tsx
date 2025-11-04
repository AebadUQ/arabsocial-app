import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../components';
import { useTheme } from '@/theme/ThemeContext';
import { ArrowLeft } from 'phosphor-react-native';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {theme} = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors?.background || '#fff' }]}>
      {/* Header with back arrow */}
      <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={[styles.backBtn, { top: 16 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Go Back"
                >
                  <ArrowLeft size={22} color="#fff" weight="bold" />
                </TouchableOpacity>

       

      <ScrollView contentContainerStyle={styles.content}>
        {/* Your settings content goes here */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
 
  content: {
    padding: 20,
  },
});

export default SettingsScreen;
