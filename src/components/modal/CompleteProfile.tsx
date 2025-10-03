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
type Props = {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
  title: string;
};

const CompleteProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  onProceed,
  title,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Image
            source={require('@/assets/images/no-profile.png')}
            style={styles.avatar}
            resizeMode="contain"
          />

          <Text variant='h5' fontWeight='bold'>{`${title}`}</Text>

          <Text variant='body1' style={styles.description} color={theme.colors.textLight}>
            Set up your profile now to unlock connections and opportunities.
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
              <Text variant='caption'  style={styles.skipTxt}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proceedBtn, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary }]}
              onPress={onProceed}
            >
              <Text variant='caption' style={styles.proceedTxt}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  
  description: {
    textAlign: 'center',
    marginVertical: 20,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#191D21',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipTxt: {
    fontWeight: '600',
    color: '#191D21',
  },
  proceedBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  proceedTxt: {
    fontWeight: '600',
    color: '#fff',
  },
});

export default CompleteProfileModal;
