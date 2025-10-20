import { useTheme } from '@/theme/ThemeContext';
import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

interface SwitchProps {
  initial?: boolean;
  onToggle?: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ initial = false, onToggle }) => {
  const [active, setActive] = useState(initial);
  const {theme} = useTheme(); // assumes you have theme colors

  const toggle = () => {
    setActive(prev => !prev);
    onToggle?.(!active);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[
        styles.container,
        { backgroundColor: active ? theme.colors.primary : '#ccc' }, // primary or gray
      ]}
    >
      <View
        style={[
          styles.circle,
          { alignSelf: active ? 'flex-end' : 'flex-start' },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 18,
    borderRadius: 14,
    padding: 5,
    paddingInline:6,
    justifyContent: 'center',
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

export default Switch;
