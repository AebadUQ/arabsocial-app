// components/Avatar.tsx
import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

type Props = {
  uri?: string; // remote image
  source?: ImageSourcePropType; // local image
  size?: number;
};

const Avatar: React.FC<Props> = ({ uri, source, size = 42 }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.darkGray,
        },
      ]}
    >
      {(uri || source) && (
        <Image
          source={uri ? { uri } : source!}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Avatar;
