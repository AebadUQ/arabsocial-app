// src/components/modal/CompleteProfileModal.tsx
import { theme } from '@/theme/theme';
import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Text from '../Text';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type Props = {
  name?: string;
  visible: boolean;
  setVisible: (v: boolean) => void;  // parent will send setter
};

const CompleteProfileModal: React.FC<Props> = ({
  name = "Complete Your Profile",
  visible,
  setVisible,
}) => {

  const navigation = useNavigation<any>();

  // 👉 Close modal only
  const handleClose = () => {
    setVisible(false);
  };

  // 👉 Go to profile edit AND close modal
  const handleProceed = () => {
    setVisible(false);
    navigation.navigate("ProfileEdit");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          
          <Image
            source={require('@/assets/images/no-profile.png')}
            style={styles.avatar}
            resizeMode="contain"
          />

          <Text variant="h5" fontWeight="bold">
            {name}
          </Text>

          <Text
            variant="body1"
            style={styles.description}
            color={theme.colors.textLight}
          >
            Complete your profile to unlock meaningful connections and exciting opportunities.
          </Text>

          {/* Main Proceed Button */}
          <View style={styles.shadowWrap}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleProceed}>
              <LinearGradient
                colors={["#1BAD7A", "#1BAD7A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                <Text variant='body1' color={theme.colors.textWhite} fontWeight='bold'>
                  Let’s do now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Close (Later) */}
          <TouchableOpacity style={{ marginTop: 14 }} onPress={handleClose}>
            <Text variant="caption" color={theme.colors.textLight}>
              Maybe later
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginVertical: 16,
  },
  shadowWrap: {
    width: "100%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

export default CompleteProfileModal;
