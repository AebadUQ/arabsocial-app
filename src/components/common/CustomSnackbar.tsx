// src/components/CustomSnackbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Portal, Text } from "react-native-paper";
import { CheckCircle, WarningCircle, Info } from "phosphor-react-native";
import { theme } from "@/theme/theme"; // adjust path if needed

type Variant = "success" | "error" | "info";

type SnackOptions = {
  message: string;
  variant?: Variant;
  duration?: number; // ms
};

let externalShowSnack: ((options: SnackOptions) => void) | null = null;

export const showSnack = (
  message: string,
  variant: Variant = "info",
  duration = 2500
) => {
  if (externalShowSnack) {
    externalShowSnack({ message, variant, duration });
  } else {
    console.log("Snackbar not mounted yet:", message);
  }
};

const CustomSnackbar = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<Variant>("info");
  const [duration, setDuration] = useState(2500);

  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<any | null>(null);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 80,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  useEffect(() => {
    externalShowSnack = ({ message, variant = "info", duration = 2500 }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setMessage(message);
      setVariant(variant);
      setDuration(duration);
      setVisible(true);

      // animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // auto-hide
      timeoutRef.current = setTimeout(() => hide(), duration);
    };

    return () => {
      externalShowSnack = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [translateY, opacity]);

  if (!visible) return null;

  const {  borderColor, iconColor } = getColors(variant);
  const Icon = getIcon(variant);

  return (
    <Portal>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              borderColor,
            },
          ]}
        >
          <Icon size={20} color={iconColor} weight="fill" />
          <Text style={[styles.text, { color: theme.colors.text }]} numberOfLines={3}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </Portal>
  );
};

const getColors = (variant: Variant) => {
  switch (variant) {
    case "success":
      return {
        borderColor: theme.colors.primary,
        iconColor:theme.colors.primary,
      };
    case "error":
      return {
        // adjust key to exactly match your theme (errrorLight / errorLight etc.)
        borderColor:
          theme.colors.errorLight || theme.colors.error || "#B71C1C",
        iconColor: theme.colors.error,
      };
    default:
      return {
        borderColor: "rgba(255,255,255,0.25)",
        iconColor: "#B0BEC5",
      };
  }
};

const getIcon = (variant: Variant) => {
  switch (variant) {
    case "success":
      return CheckCircle;
    case "error":
      return WarningCircle;
    default:
      return Info;
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 0.25, // 👈 required border
    backgroundColor:'white',
    width:'94%'
  },
  text: {
    fontSize: 14,
    flexShrink: 1,
  },
});

export default CustomSnackbar;
