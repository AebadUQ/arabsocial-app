import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
      <ThemeProvider>      

        <AppNavigator />
      </ThemeProvider>
        </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default App;
