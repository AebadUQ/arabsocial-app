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
  placeholderTextColor, // override allow
  ...rest
}: Props) {
  const [hide, setHide] = useState(!!secureTextEntry);
  const { theme: appTheme } = useTheme();

  const finalPlaceholderColor =
    placeholderTextColor ?? appTheme.colors.textLight;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: labelColor, fontSize: appTheme.typography.fontSize.v5 },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.container,
          {
            backgroundColor: appTheme.colors.background,
            borderColor: appTheme.colors.primary,
          },
          error && { borderColor: appTheme.colors.error, borderWidth: 1 },
        ]}
      >
        {left && <View style={styles.side}>{left}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: appTheme.colors.text, // ✅ typed text color
              fontSize: appTheme.typography.fontSize.v5,
            },
            inputStyle,
          ]}
          placeholderTextColor={finalPlaceholderColor} // ✅ placeholder textLight
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
              <EyeSlashIcon size={22} color={appTheme.colors.primary} />
            ) : (
              <EyeIcon size={22} color={appTheme.colors.primary} />
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

      {error && (
        <Text
          style={[
            styles.error,
            { color: appTheme.colors.error },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    overflow:'hidden'
  },
  label: {
    marginBottom: 6,
  },
  container: {
    minHeight: 50,
    borderRadius: 50,
    borderWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    overflow:'hidden'
  },
  containerError: {
    borderWidth: 1,
  },
  side: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal:14
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
});
