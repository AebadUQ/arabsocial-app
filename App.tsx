import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        {/* <StatusBar  translucent={false}   barStyle="dark-content" backgroundColor="#ffffff" /> */}
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;