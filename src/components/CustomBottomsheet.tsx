// src/components/CustomBottomSheet.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';
import { HouseIcon, CalendarBlankIcon, UsersIcon, BuildingIcon, ChatIcon } from 'phosphor-react-native';

const tabs = [
  { name: 'Home', label: 'Home', icon: HouseIcon },
  { name: 'Events', label: 'Events', icon: CalendarBlankIcon },
  { name: 'Members', label: 'Members', icon: UsersIcon },
  { name: 'Business', label: 'Business', icon: BuildingIcon },
  // { name: 'Chat', label: 'Chat', icon: ChatIcon },
];

const CustomBottomSheet = ({ state, descriptors, navigation }: any) => {
  const animations = useRef(
    tabs.map((_, i) => new Animated.Value(state.index === i ? 1 : 0))
  ).current;

  useEffect(() => {
    animations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: state.index === index ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        //@ts-ignore
        const scale = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15],
        });

        const handlePress = () => {
          // ✅ v6-correct: emit tabPress and navigate using route from state
          const route = state.routes[index];
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const IconComp = tab.icon;

        return (
          <View key={tab.name} style={styles.tabWrapper}>
            <TouchableWithoutFeedback onPress={handlePress}>
              <Animated.View
                style={[
                  styles.tabItem,
                  {
                    transform: [{ scale }],
                    borderColor: isFocused ? theme.colors.primary : 'transparent',
                    borderWidth: isFocused ? 1 : 0,
                  },
                ]}
              >
                <IconComp
                  size={22}
                  // ⚠️ color string kept as-is except invalid CSS removed
                  color={isFocused ? theme.colors.primary : '#191D2199'}
                />
                {isFocused && <Text style={styles.label}>{tab.label}</Text>}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 90,
    borderTopWidth: 1,
    borderTopColor: '#FBFBFB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom:20,
    
  },
  tabWrapper: {
    marginHorizontal: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default CustomBottomSheet;
