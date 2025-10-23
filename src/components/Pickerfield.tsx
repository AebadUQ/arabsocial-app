import React from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Text } from "@/components";
import { useTheme } from "@/theme/ThemeContext";

type PickerFieldProps = {
  label?: string;
  labelColor?: string;
  placeholder: string;
  value?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  fieldStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  labelColor = "#FFFFFF",
  placeholder,
  value,
  icon,
  onPress,
  disabled,
  error,
  containerStyle,
  fieldStyle,
  textStyle,
}) => {
  const { theme } = useTheme();
  const activeColor = value ? theme.colors.text : theme.colors.placeholder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label */}
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}

      {/* Touchable Field */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.fieldContainer,
          {
            backgroundColor: theme.colors.background,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          },
          error && { borderWidth: 1, borderColor: theme.colors.error },
          fieldStyle,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            {
              color: activeColor,
            },
            textStyle,
          ]}
        >
          {value || placeholder}
        </Text>

        {icon && <View style={styles.iconWrap}>{icon}</View>}
      </TouchableOpacity>

      {/* Error Text */}
      {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  fieldContainer: {
    minHeight: 50,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  text: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  iconWrap: {
    marginLeft: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
  },
});

export default PickerField;
