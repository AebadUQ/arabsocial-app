import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

const { height } = Dimensions.get('window');

interface CustomBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({ visible, onClose, children }) => {
  const sheetHeight = height * 0.7;
  const slideAnim = useRef(new Animated.Value(sheetHeight)).current;

  useEffect(() => {
    // Reset position when visibility changes
    if (visible) {
      // Start from bottom (sheetHeight), animate up to 0
      slideAnim.setValue(sheetHeight);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate down to bottom (sheetHeight)
      Animated.timing(slideAnim, {
        toValue: sheetHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, sheetHeight, slideAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handle} />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Make sure sheet sticks to bottom
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default CustomBottomSheet;
