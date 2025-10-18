import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components';
import { useNavigation } from '@react-navigation/native';

const GetStartedScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleGetStarted = () => {
    // @ts-ignore
    navigation.navigate && navigation.navigate('Login');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Background Image */}
        <Image
          source={require('../assets/images/vector.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <View style={styles.inner}>
          {/* Centered Logo */}
          <Image
            source={require('../assets/images/logo-getstarted.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Get Started Button */}
          <View style={styles.buttonContainer}>
            <Button title="Get Started" onPress={handleGetStarted} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  logo: {
    width: 200,
    height: 84,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 0,
  },
});

export default GetStartedScreen;
