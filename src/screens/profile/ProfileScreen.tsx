import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '@/components';
import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  NotePencil,
  Plus,
  ListDashes as ListDashesIcon,
  EnvelopeSimple,
  Phone,
  MapPin,
  Flag,
  GenderFemale,
  Ruler,
  Heart,
  HandsPraying,
  GraduationCap,
  Translate,
  ArrowLeft,
} from 'phosphor-react-native';
import { theme } from '@/theme/theme';

const ProfileScreen: React.FC = () => {
const navigation = useNavigation<any>();
  const { theme } = useTheme();

  // 🔹 Example photos
  const photos = [
    'https://i.pravatar.cc/200?img=12',
    'https://i.pravatar.cc/200?img=15',
    'https://i.pravatar.cc/200?img=18',
    'https://i.pravatar.cc/200?img=21',
    'https://i.pravatar.cc/200?img=25',
  ];

  // 🔹 Example interests
  const interests = ['UI/UX', 'React Native', 'Photography', 'Travel', 'Fitness', 'Street Food'];

  // 🔹 Example personal details
  const details = {
    email: 'harleen@example.com',
    phone: '+92 300 1234567',
    state: 'Sindh',
    city: 'Karachi',
    nationality: 'Pakistani',
    gender: 'Female',
    height: "5'6”",
    maritalStatus: 'Single',
    religion: '—',
    educationLevel: 'Bachelor’s',
  };

  // 🔹 Example languages
  const languages = ['English', 'Urdu', 'Arabic'];

  const MAX_PREVIEW = 3;
  const preview = photos.slice(0, MAX_PREVIEW);
  const extraCount = Math.max(0, photos.length - MAX_PREVIEW);

  const onEditAbout = () => {
      navigation.navigate("ProfileEdit");

  };
  const onAddPhoto = () => console.log('Add photo');
  const onViewAll = () => console.log('View all photos');
  const onAddInterest = () => console.log('Add interest');
  const onEditPersonal = () => console.log('Edit personal details');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Floating header controls over avatar */}
      <View style={styles.overlayRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
        >
          <ArrowLeft size={22} color="#fff" weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={onEditAbout}
          style={styles.circleBtn}
        >
          <NotePencil size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: 'https://i.pravatar.cc/200?img=12' }} style={styles.avatar} />
          <Text variant="h5">Harleen Quinzel</Text>
          <Text variant="caption" color={theme.colors.textLight}>Graphic Designer</Text>
        </View>

        {/* Socials */}
        <View style={styles.socialRow}>
          <FacebookLogo size={20} color={theme.colors.text} />
          <XLogo size={20} color={theme.colors.text} />
          <InstagramLogo size={20} color={theme.colors.text} />
        </View>

        {/* About + Edit */}
        <View style={[styles.sectionRow, { borderBottomColor: theme.colors.borderColor }]}>
          <View style={styles.sectionTextWrap}>
            <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>About me</Text>
            <Text variant="body1" color={theme.colors.textLight}>
              Nullam euismod dui vitae nisi vestibulum, tincidunt erat semper.
            </Text>
          </View>
          <TouchableOpacity onPress={onEditAbout} style={styles.iconBtn} accessibilityRole="button">
            <NotePencil size={22} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Gallery header */}
        <View style={styles.galleryHeader}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Gallery</Text>
          {extraCount > 0 && (
            <TouchableOpacity onPress={onViewAll} accessibilityRole="button">
              <Text variant="caption" color={theme.colors.primary}>View all ({photos.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Gallery Row: inline plus BEFORE images */}
        <View style={styles.galleryRow}>
          {preview.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumb} />
          ))}
          <TouchableOpacity
            onPress={onAddPhoto}
            accessibilityRole="button"
            style={[styles.plusBox, { backgroundColor: theme.colors.primary }]}
          >
            <Plus size={12} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* ===== Interests ===== */}
        <View style={[styles.interestsSection, { borderBottomWidth: 1, borderBottomColor: theme.colors.borderColor }]}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Interests</Text>

          <View style={styles.chipsWrap}>
            {interests.map((label, i) => (
              <TouchableOpacity key={i} style={styles.chip} accessibilityRole="button">
                <Text variant="overline" color={theme.colors.textWhite}>{label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={onAddInterest} accessibilityRole="button" style={styles.plusChip}>
              <Plus size={12} color="#fff" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== Personal Details (no line under) ===== */}
        <View style={styles.sectionRowTightNoLine}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Personal details</Text>
          <TouchableOpacity onPress={onEditPersonal} accessibilityRole="button" style={styles.iconBtn}>
            <NotePencil size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Details List with per-field icons */}
        <View style={styles.detailsList}>
          <DetailRow Icon={EnvelopeSimple} iconColor={theme.colors.primaryDark} label="Email" value={details.email} />
          <DetailRow Icon={Phone} iconColor={theme.colors.primaryDark} label="Phone" value={details.phone} />
          <DetailRow Icon={MapPin} iconColor={theme.colors.primaryDark} label="State · City" value={`${details.state} · ${details.city}`} />
          <DetailRow Icon={Flag} iconColor={theme.colors.primaryDark} label="Nationality" value={details.nationality} />
          <DetailRow Icon={GenderFemale} iconColor={theme.colors.primaryDark} label="Gender" value={details.gender} />
          <DetailRow Icon={Ruler} iconColor={theme.colors.primaryDark} label="Height" value={details.height} />
          <DetailRow Icon={Heart} iconColor={theme.colors.primaryDark} label="Marital status" value={details.maritalStatus} />
          <DetailRow Icon={HandsPraying} iconColor={theme.colors.primaryDark} label="Religion" value={details.religion} />
          <DetailRow Icon={GraduationCap} iconColor={theme.colors.primaryDark} label="Educational level" value={details.educationLevel} />
          <DetailRow Icon={Translate} iconColor={theme.colors.primaryDark} label="Languages" value={languages.join(', ')} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
  iconColor: string;
  // Icon component optional, falls back to ListDashesIcon if not provided
  Icon?: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value, iconColor, Icon }) => {
  const IconComp = Icon || ListDashesIcon;
  return (
    <View style={styles.row}>
      <IconComp size={20} color={iconColor} weight="regular" />
      <View style={{ flex: 1 }}>
        <Text variant="overline">{label}</Text>
        <Text variant="body1" color={iconColor}>{value}</Text>
      </View>
    </View>
  );
};

const TILE = 100;
const RADIUS = 10;
// keeping your chip color as-is to avoid bigger changes
const CHIP_BG = '#1E644CCC';

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  content: { padding: 20, paddingTop: 40 },

  /* Floating buttons row */
  overlayRow: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },

  avatarWrap: { justifyContent: 'center', alignItems: 'center' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    backgroundColor: '#e9e9e9',
    marginBottom: 8,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    marginBottom: 10,
  },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },

  sectionRowTightNoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 16,
  },

  sectionTextWrap: { flex: 1, paddingRight: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 4 },
  iconBtn: { padding: 6, borderRadius: 8 },

  galleryHeader: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },

  galleryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  thumb: {
    width: TILE,
    height: TILE,
    borderRadius: RADIUS,
    backgroundColor: '#e9e9e9',
  },

  plusBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Interests
  interestsSection: {
    marginTop: 16,
    paddingBottom: 16,
  },

  chipsWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CHIP_BG,
  },

  plusChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },

  // Details list
  detailsList: {
    paddingTop: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default ProfileScreen;
