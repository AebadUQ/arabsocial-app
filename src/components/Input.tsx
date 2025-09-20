import React, { useState, ReactNode } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image
} from "react-native";
import { useTheme } from '../theme/ThemeContext';
import { theme } from "@/theme/theme";


type Props = TextInputProps & {
  label?: string;
  error?: string;
  left?: ReactNode;                 // custom left icon/component
  right?: ReactNode;                // custom right icon/component
  onPressRight?: () => void;        // for eye / clear button
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  secureToggle?: boolean;           // show eye button to toggle secure
};

export default function InputField({
  label,
  error,
  left,
  right,
  onPressRight,
  containerStyle,
  inputStyle,
  secureTextEntry,
  secureToggle,
  placeholderTextColor = theme.colors.placeholder,
  ...rest
}: Props) {

  const [hide, setHide] = useState(!!secureTextEntry);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.container, error && styles.containerError]}>
        {left ? <View style={styles.side}>{left}</View> : null}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={hide}
          {...rest}
        />

        {/* Right adornment or secure toggle */}
        {secureToggle ? (
          <TouchableOpacity
            onPress={() => setHide(!hide)}
            style={styles.side}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
             <Image 
              source={require('@/assets/icons/eye-off.png')}
            />
          </TouchableOpacity>
        ) : right ? (
          <TouchableOpacity onPress={onPressRight} disabled={!onPressRight} style={styles.side}>
            {right}
          </TouchableOpacity>
        ) : null}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 6,
    fontSize: 14,
  },
  container: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",

    // soft shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    // soft shadow (Android)
    elevation: 2,
  },
  containerError: {
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  side: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  error: {
    color: theme.colors.error,
    marginTop: 6,
    fontSize: 12,
  },
});