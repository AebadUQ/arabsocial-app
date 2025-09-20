# ArabSocial - React Native App

A modern React Native social media application built with TypeScript, featuring a comprehensive theme system, navigation, and reusable components.

## 🚀 Features

- **Modern UI/UX**: Clean and intuitive design with Manrope font family
- **Theme System**: Comprehensive theming with light/dark mode support
- **Navigation**: React Navigation with bottom tabs and stack navigation
- **TypeScript**: Full TypeScript support with strict configuration
- **Reusable Components**: Custom Text, Button, Input, and Card components
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Font Integration**: Manrope fonts configured for iOS and Android

## 📱 Screens

- **Home**: Welcome screen with feature cards
- **Profile**: User profile with stats and bio
- **Settings**: App settings with theme toggle and preferences

## 🛠 Tech Stack

- React Native 0.81.4
- TypeScript
- React Navigation 6
- React Native Safe Area Context
- React Native Gesture Handler
- React Native Vector Icons
- React Native Linear Gradient
- AsyncStorage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ArabSocial
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Link fonts** (if needed)
   ```bash
   npx react-native-asset
   ```

## 🚀 Running the App

### iOS
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   └── index.ts
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── theme/             # Theme system
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── theme.ts
│   └── ThemeContext.tsx
├── utils/             # Utility functions
│   └── index.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── assets/            # Static assets
    └── fonts/         # Font files
```

## 🎨 Theme System

The app includes a comprehensive theme system with:

- **Colors**: Primary, secondary, neutral, semantic colors
- **Typography**: Manrope font family with various weights and sizes
- **Spacing**: Consistent spacing scale
- **Shadows**: Predefined shadow styles
- **Border Radius**: Consistent border radius values

### Using the Theme

```tsx
import { useTheme } from '@/theme/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.primary[500] }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
};
```

## 🧩 Components

### Text Component
```tsx
<Text variant="h1" color={theme.colors.primary[600]}>
  Heading
</Text>
```

### Button Component
```tsx
<Button
  title="Click Me"
  variant="primary"
  size="md"
  onPress={() => {}}
/>
```

### Input Component
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  error="Invalid email"
/>
```

### Card Component
```tsx
<Card variant="elevated" padding={4}>
  <Text>Card content</Text>
</Card>
```

## 🔧 Configuration

### TypeScript Paths
The project is configured with path aliases for cleaner imports:

```tsx
import { Text } from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import { User } from '@/types';
```

### Font Configuration
Manrope fonts are automatically linked and available through the theme system.

## 📱 Platform Support

- iOS 11.0+
- Android API 21+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Google Fonts for the Manrope font family
- React Navigation team for the navigation library