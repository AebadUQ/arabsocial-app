import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '@/components';
import {
  ArrowLeftIcon,
  NotePencilIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
  PlusIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  MapPinIcon,
  FlagIcon,
  GenderFemaleIcon,
  RulerIcon,
  HeartIcon,
  HandsPrayingIcon,
  GraduationCapIcon,
  TranslateIcon,
  XLogoIcon,
  ListDashesIcon,
} from 'phosphor-react-native';
import { useAuth } from '@/context/Authcontext';
import { theme } from '@/theme/theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  console.log("s",user?.social_links)

  const safeValue = (value: any) => (value === null || value === undefined || value === '' ? 'N/A' : value);

  // interests array fallback
  const interests: string[] = user?.interests && Array.isArray(user.interests) && user.interests.length > 0
    ? user.interests
    : ['N/A'];

  // language_spoken assumed array always
  const languages: string[] = Array.isArray(user?.language_spoken) && user.language_spoken.length > 0
    ? user.language_spoken
    : ['N/A'];

  // Avatar fallback
  const avatarUri = user?.image || user?.img || 'https://i.pravatar.cc/200?img=12';

  // Gallery fallback, and check if empty to show "No image in gallery"
  const gallery: string[] = Array.isArray(user?.gallery) ? user.gallery : [];
  const hasGallery = gallery.length > 0;

  // Preview max 3 images
  const MAX_PREVIEW = 3;
  const preview = hasGallery ? gallery.slice(0, MAX_PREVIEW) : [];

  const details = {
    email: safeValue(user?.email),
    phone: safeValue(user?.phone),
    state: safeValue(user?.state),
    city: safeValue(user?.location || user?.city),
    nationality: safeValue(user?.nationality),
    gender: safeValue(user?.gender),
    height: safeValue(user?.height),
    maritalStatus: safeValue(user?.marital_status),
    religion: safeValue(user?.religion),
    educationLevel: safeValue(user?.education),
  };

  const onEditAbout = () => navigation.navigate('ProfileEdit');
  const onViewAll = () => console.log('View all photos');
  const onEditPersonal = () => console.log('Edit personal details');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Floating header */}
      <View style={styles.overlayRow}>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" onPress={onEditAbout} style={styles.circleBtn}>
          <NotePencilIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text variant="h5">{safeValue(user?.name)}</Text>
          <Text variant="caption" color={theme.colors.textLight}>{safeValue(user?.profession)}</Text>
        </View>

        {/* Socials */}
        {/* Socials */}
<View style={styles.socialRow}>
  {user?.social_links &&
    Object.entries(user.social_links)
      .filter(([_, value]) => value) // only non-empty links
      .map(([key, value], index) => {
        let IconComp;
        let type = key; // keeps track of social type

        switch (key) {
          case "facebook":
            IconComp = FacebookLogoIcon;
            break;
          case "twitter":
            IconComp = XLogoIcon;
            break;
          case "instagram":
            IconComp = InstagramLogoIcon;
            break;
          default:
            IconComp = ListDashesIcon;
            type = "other";
        }

        return (
          <TouchableOpacity
            key={index}
            style={{ marginRight: 12 }}
            onPress={() => {
              // handle navigation or link action here
              console.log("Clicked social type:", type, "value:", value);
              // Example: navigation.navigate('SocialProfile', { type, handle: value });
            }}
          >
            <IconComp size={20} color={theme.colors.text} />
          </TouchableOpacity>
        );
      })}
</View>


        {/* About me */}
        <View style={[styles.sectionRow, { borderBottomColor: theme.colors.borderColor }]}>
          <View style={styles.sectionTextWrap}>
            <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>About me</Text>
            <Text variant="body1" color={theme.colors.textLight}>
              {safeValue(user?.about_me === '—' ? null : user?.about_me) === 'N/A'
                ? 'No details provided.'
                : user?.about_me}
            </Text>
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.galleryHeader}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Gallery</Text>
          {hasGallery && gallery.length > MAX_PREVIEW && (
            <TouchableOpacity onPress={onViewAll} accessibilityRole="button">
              <Text variant="caption" color={theme.colors.primary}>View all ({gallery.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.galleryRow}>
          {hasGallery ? (
            preview.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.thumb} />
            ))
          ) : (
            <RNText style={[styles.noImageText, { color: theme.colors.textLight }]}>
              No image in gallery
            </RNText>
          )}
        </View>

        {/* Interests */}
        <View style={[styles.interestsSection]}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Interests</Text>

          <View style={styles.chipsWrap}>
            {interests.map((label, i) => (
              <TouchableOpacity key={i} style={styles.chip} accessibilityRole="button">
                <Text variant="overline" color={theme.colors.textWhite}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal details */}
        <View style={styles.sectionRowTightNoLine}>
          <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>Personal details</Text>
        </View>

        <View style={styles.detailsList}>
          <DetailRow Icon={EnvelopeSimpleIcon} iconColor={theme.colors.primaryDark} label="Email" value={details.email} />
          <DetailRow Icon={PhoneIcon} iconColor={theme.colors.primaryDark} label="Phone" value={details.phone} />
          <DetailRow Icon={MapPinIcon} iconColor={theme.colors.primaryDark} label="State · City" value={`${details.state} · ${details.city}`} />
          <DetailRow Icon={FlagIcon} iconColor={theme.colors.primaryDark} label="Nationality" value={details.nationality} />
          <DetailRow Icon={GenderFemaleIcon} iconColor={theme.colors.primaryDark} label="Gender" value={details.gender} />
          <DetailRow Icon={RulerIcon} iconColor={theme.colors.primaryDark} label="Height" value={details.height} />
          <DetailRow Icon={HeartIcon} iconColor={theme.colors.primaryDark} label="Marital status" value={details.maritalStatus} />
          <DetailRow Icon={HandsPrayingIcon} iconColor={theme.colors.primaryDark} label="Religion" value={details.religion} />
          <DetailRow Icon={GraduationCapIcon} iconColor={theme.colors.primaryDark} label="Educational level" value={details.educationLevel} />
          <DetailRow Icon={TranslateIcon} iconColor={theme.colors.primaryDark} label="Languages" value={languages.join(', ')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
  iconColor: string;
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
const CHIP_BG = '#1E644CCC';

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  content: { padding: 20, paddingTop: 40 },

  overlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    minHeight: TILE, // to keep space even if no images
  },

  thumb: {
    width: TILE,
    height: TILE,
    borderRadius: RADIUS,
    backgroundColor: '#e9e9e9',
  },

  noImageText: {
    fontSize: 16,
    fontStyle: 'italic',
  },

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
