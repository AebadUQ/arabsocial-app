import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { ArrowLeft, TrashIcon, CaretRight } from 'phosphor-react-native';
import { Card, Text } from '@/components';
import { useAuth } from '@/context/Authcontext';

const CTA_HEIGHT = 56;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { deleteAccount } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAccount();
      setShowModal(false);
    } catch (err) {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { top: insets.top + 8 }]}>
        <ArrowLeft size={22} color="#fff" weight="bold" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="body1" color={theme.colors.text} style={{ marginBottom: 12 }}>
          Support
        </Text>

        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => navigation.navigate("Help")}>
            <Text variant="body1" color={theme.colors.text}>Help & FAQs</Text>
            <CaretRight size={20} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => navigation.navigate("ContactSupport")}>
            <View>
              <Text variant="body1" color={theme.colors.text}>Contact Support</Text>
              <Text variant="caption" color={theme.colors.textLight}>contact@arabsocials.com</Text>
            </View>
            <CaretRight size={20} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => navigation.navigate("PrivacyPolicy")}>
            <Text variant="body1" color={theme.colors.text}>Privacy Policy</Text>
            <CaretRight size={20} color={theme.colors.textLight} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => navigation.navigate("TermsConditions")}>
            <Text variant="body1" color={theme.colors.text}>Terms & Conditions</Text>
            <CaretRight size={20} color={theme.colors.textLight} />
          </Pressable>

          <Pressable
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Text variant="body1" color={theme.colors.text}>Change Password</Text>
            <CaretRight size={20} color={theme.colors.textLight} />
          </Pressable>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text variant="body1" color={theme.colors.text}>Delete Account</Text>

          <Card
            style={{
              backgroundColor: '#FEE2E266',
              borderColor: theme.colors.error,
              marginTop: 10,
            }}
          >
            <Text variant="caption" color={theme.colors.error}>ACCOUNT REMOVAL</Text>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowModal(true)}>
              <TrashIcon size={20} color={theme.colors.error} />
              <Text variant="body1" color={theme.colors.error}>Delete Account</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.iconWrap}>
              <TrashIcon size={36} color={theme.colors.error} />
            </View>

            <Text variant="body1" color={theme.colors.text} style={{ marginTop: 10 }}>
              Delete Your Account?
            </Text>

            <Text
              variant="caption"
              color={theme.colors.textLight}
              style={{ textAlign: 'center', marginTop: 6, paddingHorizontal: 10 }}
            >
              This action will permanently delete your account and all associated data.
              Once deleted, it cannot be recovered.
            </Text>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={[styles.modalBtn, { backgroundColor: '#E8F5E9' }]}>
              <Text variant="body1" color={theme.colors.success}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.modalBtn, { backgroundColor: '#FEE2E2' }]}
            >
              <Text variant="body1" color={theme.colors.error}>Yes, Delete My Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  backBtn: {
    position: "absolute",
    left: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  content: {
    padding: 20,
    paddingTop: 80,
  },

  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E580",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deleteBtn: {
    marginTop: 16,
    height: CTA_HEIGHT,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: '#FEE2E2',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
  },

  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 70,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBtn: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
});

export default SettingsScreen;
