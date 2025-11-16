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
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { theme } from "@/theme/theme";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";

type Props = {
  label?: string | undefined;
  labelColor?: string | undefined;
  error?: string | undefined;
  left?: ReactNode | undefined;
  right?: ReactNode | undefined;
  onPressRight?: (() => void) | undefined;
  containerStyle?: ViewStyle | undefined;
  inputStyle?: TextStyle | undefined;
  secureToggle?: boolean | undefined;
} & TextInputProps;


export default function InputField({
  label,
  labelColor = "#FFFFFF",
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
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}

      <View style={[styles.container, error && styles.containerError]}>
        {left && <View style={styles.side}>{left}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureToggle ? hide : secureTextEntry}
          {...rest}
        />

        {secureToggle ? (
          <TouchableOpacity
            onPress={() => setHide(!hide)}
            style={styles.side}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {hide ? (
              <EyeSlashIcon size={22} color={theme.colors.primary} />
            ) : (
              <EyeIcon size={22} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        ) : right ? (
          <TouchableOpacity
            onPress={onPressRight}
            disabled={!onPressRight}
            style={styles.side}
          >
            {right}
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: theme.typography.fontSize.v5,
  },
  container: {
    minHeight: 50,
    borderRadius: 50,
    backgroundColor: theme.colors.background,
    borderWidth:0.5,
    borderColor:theme.colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 3 },
    // elevation: 2,
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
    color: theme.colors.placeholder,
    fontSize: theme.typography.fontSize.v5,
    paddingVertical: 12,
  },
  error: {
    color: theme.colors.error,
    marginTop: 6,
    fontSize: 12,
  },
});
