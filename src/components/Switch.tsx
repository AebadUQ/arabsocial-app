import { useTheme } from '@/theme/ThemeContext';
import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface SwitchProps {
  initial?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ initial = false, value, onToggle }) => {
  const { theme } = useTheme();
  const [internal, setInternal] = useState(initial);

  const active = value !== undefined ? value : internal;

  const toggle = () => {
    const newVal = !active;
    setInternal(newVal);
    onToggle?.(newVal);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[
        styles.container,
        {
          backgroundColor: active ? theme.colors.primary : '#CFCFCF',
        },
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
    width: 42,
    height: 24,
    borderRadius: 20,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});

export default Switch;
