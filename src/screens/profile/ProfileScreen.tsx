import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Switch, Text } from '@/components';
import {
  ArrowLeftIcon,
  NotePencilIcon,
  FacebookLogoIcon,
  InstagramLogoIcon,
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
import { updateUserDetailVisibility } from '@/api/auth';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();

  // ---------- safe helpers ----------
  const safeValue = (value: any) =>
    value === null || value === undefined || value === '' ? 'N/A' : value;

  const interests: string[] =
    user?.interests && Array.isArray(user.interests) && user.interests.length > 0
      ? user.interests
      : ['N/A'];

  const languages: string[] =
    Array.isArray(user?.language_spoken) && user.language_spoken.length > 0
      ? user.language_spoken
      : ['N/A'];

  const avatarUri =
    user?.image || user?.img || 'https://i.pravatar.cc/200?img=12';

  const gallery: string[] = Array.isArray(user?.gallery)
    ? user.gallery
    : [];
  const hasGallery = gallery.length > 0;
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

  // ---------- visibility_settings safe fallback ----------
  const DEFAULT_VISIBILITY = {
    email: false,
    phone: false,
    state: false,
    city: false,
    nationality: false,
    gender: false,
    height: false,
    marital_status: false,
    religion: false,
    education: false,
    language: false,
    language_spoken: false,
  };

  const rawVisibility = user?.visibility_settings;
  const visibility = {
    ...DEFAULT_VISIBILITY,
    ...(rawVisibility ?? {}),
  };
  // now visibility.gender etc are guaranteed boolean

  // ---------- API sync for switch ----------
  const handleSwitchChange = async (
    field: string | undefined,
    value: boolean
  ) => {
    if (!field) return;

    const payload = {
      visibility_settings: {
        [field]: value,
      },
    };

    try {
      const result = await updateUserDetailVisibility(payload);
      console.log('Visibility updated successfully:', result);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // nav actions
  const onEditAbout = () => navigation.navigate('ProfileEdit');
  const onViewAll = () => console.log('View all photos');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Floating header */}
      <View style={styles.overlayRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
        >
          <ArrowLeftIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={onEditAbout}
          style={styles.circleBtn}
        >
          <NotePencilIcon size={22} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar + Name */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <Text variant="h5">{safeValue(user?.name)}</Text>
          <Text variant="caption" color={theme.colors.textLight}>
            {safeValue(user?.profession)}
          </Text>
        </View>

        {/* Socials */}
        <View style={styles.socialRow}>
          {user?.social_links &&
            Object.entries(user.social_links)
              .filter(([_, value]) => value)
              .map(([key, value], index) => {
                let IconComp: any;
                let type = key;
                switch (key) {
                  case 'facebook':
                    IconComp = FacebookLogoIcon;
                    break;
                  case 'twitter':
                    IconComp = XLogoIcon;
                    break;
                  case 'instagram':
                    IconComp = InstagramLogoIcon;
                    break;
                  default:
                    IconComp = ListDashesIcon;
                    type = 'other';
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={{ marginRight: 12 }}
                    onPress={() =>
                      console.log(
                        'Clicked social type:',
                        type,
                        'value:',
                        value
                      )
                    }
                  >
                    <IconComp size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                );
              })}
        </View>

        {/* About me */}
        <View
          style={[
            styles.sectionRow,
            { borderBottomColor: theme.colors.borderColor },
          ]}
        >
          <View style={styles.sectionTextWrap}>
            <Text
              variant="body1"
              color={theme.colors.text}
              style={styles.sectionTitle}
            >
              About me
            </Text>
            <Text variant="body1" color={theme.colors.textLight}>
              {safeValue(user?.about_me === '—' ? null : user?.about_me) ===
              'N/A'
                ? 'No details provided.'
                : user?.about_me}
            </Text>
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.galleryHeader}>
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.sectionTitle}
          >
            Gallery
          </Text>
          {hasGallery && gallery.length > MAX_PREVIEW && (
            <TouchableOpacity onPress={onViewAll} accessibilityRole="button">
              <Text variant="caption" color={theme.colors.primary}>
                View all ({gallery.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.galleryRow}>
          {hasGallery ? (
            preview.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.thumb} />
            ))
          ) : (
            <RNText
              style={[styles.noImageText, { color: theme.colors.textLight }]}
            >
              No image in gallery
            </RNText>
          )}
        </View>

        {/* Personal details */}
        <View style={styles.sectionRowTightNoLine}>
          <Text
            variant="body1"
            color={theme.colors.text}
            style={styles.sectionTitle}
          >
            Personal details
          </Text>
        </View>

        <View style={styles.detailsList}>
          {/* Email (switch hidden for now) */}
          <DetailRow
            Icon={EnvelopeSimpleIcon}
            iconColor={theme.colors.primaryDark}
            label="Email"
            value={details.email}
            show={false}
            // if in future: field="email" defaultValue={visibility.email}
          />

          {/* Phone (switch hidden for now) */}
          <DetailRow
            Icon={PhoneIcon}
            iconColor={theme.colors.primaryDark}
            label="Phone"
            value={details.phone}
            show={false}
          />

          {/* State · City (switch hidden for now) */}
          <DetailRow
            Icon={MapPinIcon}
            iconColor={theme.colors.primaryDark}
            label="State · City"
            value={`${details.state} · ${details.city}`}
            show={false}
          />

          {/* Nationality (switch hidden right now, but you could enable later) */}
          <DetailRow
            Icon={FlagIcon}
            iconColor={theme.colors.primaryDark}
            label="Nationality"
            value={details.nationality}
            show={false}
            field="nationality"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.nationality}
          />

          {/* Gender */}
          <DetailRow
            Icon={GenderFemaleIcon}
            iconColor={theme.colors.primaryDark}
            label="Gender"
            value={details.gender}
            show={true}
            field="gender"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.gender}
          />

          {/* Height */}
          <DetailRow
            Icon={RulerIcon}
            iconColor={theme.colors.primaryDark}
            label="Height"
            value={details.height}
            show={true}
            field="height"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.height}
          />

          {/* Marital status */}
          <DetailRow
            Icon={HeartIcon}
            iconColor={theme.colors.primaryDark}
            label="Marital status"
            value={details.maritalStatus}
            show={true}
            field="marital_status"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.marital_status}
          />

          {/* Religion */}
          <DetailRow
            Icon={HandsPrayingIcon}
            iconColor={theme.colors.primaryDark}
            label="Religion"
            value={details.religion}
            show={true}
            field="religion"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.religion}
          />

          {/* Education */}
          <DetailRow
            Icon={GraduationCapIcon}
            iconColor={theme.colors.primaryDark}
            label="Educational level"
            value={details.educationLevel}
            show={true}
            field="education"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.education}
          />

          {/* Languages */}
          <DetailRow
            Icon={TranslateIcon}
            iconColor={theme.colors.primaryDark}
            label="Languages"
            value={languages.join(', ')}
            show={true}
            field="language_spoken"
            onSwitchChange={handleSwitchChange}
            defaultValue={visibility.language_spoken ?? visibility.language}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------------------------
// DetailRow Component
// ---------------------------
type DetailRowProps = {
  label: string;
  value: string;
  iconColor: string;
  Icon?: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  show?: boolean;
  field?: string;
  onSwitchChange?: (field: string | undefined, value: boolean) => void;
  defaultValue?: boolean;
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  iconColor,
  Icon,
  show = true,
  field,
  onSwitchChange,
  defaultValue = false,
}) => {
  const IconComp = Icon || ListDashesIcon;

  const [active, setActive] = useState(defaultValue);

  // keep local switch state synced if parent re-renders with new defaultValue
  useEffect(() => {
    setActive(defaultValue ?? false);
  }, [defaultValue]);

  const handleToggle = (val: boolean) => {
    setActive(val);
    onSwitchChange?.(field, val);
  };

  return (
    <View style={styles.row}>
      <IconComp size={20} color={iconColor} weight="regular" />
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text variant="overline">{label}</Text>
        <Text variant="body1" color={iconColor}>
          {value}
        </Text>
      </View>
      {show && <Switch initial={active} onToggle={handleToggle} />}
    </View>
  );
};

// ---------------------------
// Styles
// ---------------------------
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
    minHeight: TILE,
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
