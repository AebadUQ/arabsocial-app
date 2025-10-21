// App.tsx  
import React from 'react';  
import { GestureHandlerRootView } from 'react-native-gesture-handler';  
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';  
import { ThemeProvider } from './src/theme/ThemeContext';  
import { AuthProvider } from '@/context/Authcontext';  // adjust path  
import AppNavigator from './src/navigation/AppNavigator';  // adjust path  
import { StyleSheet } from 'react-native';
import AppWrapper from '@/components/AuthWrapper';

const queryClient = new QueryClient();

const App: React.FC = () => {  
  return (  
    <GestureHandlerRootView style={styles.container}>  
      <QueryClientProvider client={queryClient}>  
        <BottomSheetModalProvider>  
          <ThemeProvider>  
            <AuthProvider>  
      <AppWrapper>
              <AppNavigator />  
              </AppWrapper>
            </AuthProvider>  
          </ThemeProvider>  
        </BottomSheetModalProvider>  
      </QueryClientProvider>  
    </GestureHandlerRootView>  
  );  
};

const styles = StyleSheet.create({ container: { flex: 1 } });

export default App;
