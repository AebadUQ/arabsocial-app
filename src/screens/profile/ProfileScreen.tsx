import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
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
  UserIcon,
} from 'phosphor-react-native';
import { useAuth } from '@/context/Authcontext';
import { updateUserDetailVisibility } from '@/api/auth';
import Card from '@/components/Card';
import ImageView from 'react-native-image-viewing';

const safeValue = (value: any): string =>
  value === null || value === undefined || value === '' ? '-' : String(value);

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
} as const;

type VisibilityKeys = keyof typeof DEFAULT_VISIBILITY;

const SOCIAL_ICON_MAP: Record<string, any> = {
  facebook: FacebookLogoIcon,
  twitter: XLogoIcon,
  instagram: InstagramLogoIcon,
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();

  // ⭐ Avatar Logic
  const hasImage = user?.image && user.image.trim() !== '';
  const avatarUri = hasImage ? user.image : null;

  const [avatarPreviewVisible, setAvatarPreviewVisible] = useState(false);

  const languages = useMemo(
    () =>
      Array.isArray(user?.language_spoken) && user.language_spoken.length > 0
        ? user.language_spoken
        : ['-'],
    [user?.language_spoken]
  );

  const details = useMemo(
    () => ({
      email: safeValue(user?.email),
      name: safeValue(user?.name),
      phone: safeValue(user?.phone),
      state: safeValue(user?.state),
      city: safeValue(user?.location || user?.city),
      nationality: safeValue(user?.nationality),
      gender: safeValue(user?.gender),
      height: safeValue(user?.height),
      maritalStatus: safeValue(user?.marital_status),
      religion: safeValue(user?.religion),
      educationLevel: safeValue(user?.education),
    }),
    [user]
  );

  const visibility = useMemo(
    () => ({
      ...DEFAULT_VISIBILITY,
      ...(user?.visibility_settings ?? {}),
    }),
    [user?.visibility_settings]
  );

  const handleSwitchChange = async (
    field: VisibilityKeys | string | undefined,
    value: boolean
  ) => {
    if (!field) return;
    try {
      await updateUserDetailVisibility({
        visibility_settings: { [field]: value },
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.background }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeftIcon size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>

          <Text variant="body1" color={theme.colors.text}>
            Profile
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileEdit')}
          style={[styles.editBtn, { backgroundColor: theme.colors.primaryLight }]}
        >
          <NotePencilIcon size={16} color={theme.colors.primary} />
          <Text variant="caption" color={theme.colors.primary} style={styles.editText}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <Card>
          <View style={styles.avatarCardContent}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => hasImage && setAvatarPreviewVisible(true)}
            >
              <View style={[styles.avatarBorder, { borderColor: theme.colors.primaryLight }]}>
                {hasImage ? (
                  <Image source={{ uri: avatarUri! }} style={styles.avatar} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <UserIcon size={50} color={theme.colors.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Fullscreen Preview */}
            {hasImage && (
              <ImageView
                images={[{ uri: avatarUri! }]}
                visible={avatarPreviewVisible}
                onRequestClose={() => setAvatarPreviewVisible(false)}
                swipeToCloseEnabled
                doubleTapToZoomEnabled
                imageIndex={0}
              />
            )}

            <Text variant="h5" style={styles.nameText} color={theme.colors.text}>
              {safeValue(user?.name)}
            </Text>

            <Text variant="caption" color={theme.colors.textLight}>
              {safeValue(user?.profession)}
            </Text>

            {/* Social Icons */}
            {user?.social_links && (
              <View style={styles.socialRow}>
                {Object.entries(user.social_links)
                  .filter(([_, v]) => !!v)
                  .map(([key, value]) => {
                    const IconComp = SOCIAL_ICON_MAP[key] || ListDashesIcon;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.socialIconWrap,
                          { borderColor: theme.colors.primaryLight },
                        ]}
                      >
                        <IconComp size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
          </View>
        </Card>

        {/* About Section */}
        <Card>
          <View style={styles.sectionTextWrap}>
            <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
              About me
            </Text>
            <Text variant="body1" color={theme.colors.textLight}>
              {safeValue(user?.about_me) === '-' ? 'No details provided.' : user?.about_me}
            </Text>
          </View>
        </Card>

        {/* Personal Details */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text variant="body1" color={theme.colors.text} style={styles.sectionTitle}>
              Personal Details
            </Text>
          </View>

          <View style={styles.detailsList}>
            <DetailRow Icon={EnvelopeSimpleIcon} label="Email" value={details.email} show={false} />
            <DetailRow Icon={UserIcon} label="Name" value={details.name} show={false} />
            <DetailRow Icon={PhoneIcon} label="Phone" value={details.phone} show={false} />
            <DetailRow
              Icon={MapPinIcon}
              label="State · City"
              value={`${details.state} · ${details.city}`}
              show={false}
            />

            <DetailRow
              Icon={FlagIcon}
              label="Nationality"
              value={details.nationality}
              field="nationality"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.nationality}
            />
            <DetailRow
              Icon={GenderFemaleIcon}
              label="Gender"
              value={details.gender}
              field="gender"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.gender}
            />
            <DetailRow
              Icon={RulerIcon}
              label="Height"
              value={details.height}
              field="height"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.height}
            />
            <DetailRow
              Icon={HeartIcon}
              label="Marital status"
              value={details.maritalStatus}
              field="marital_status"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.marital_status}
            />
            <DetailRow
              Icon={HandsPrayingIcon}
              label="Religion"
              value={details.religion}
              field="religion"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.religion}
            />
            <DetailRow
              Icon={GraduationCapIcon}
              label="Educational level"
              value={details.educationLevel}
              field="education"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.education}
            />
            <DetailRow
              Icon={TranslateIcon}
              label="Languages"
              value={languages.join(', ')}
              field="language_spoken"
              onSwitchChange={handleSwitchChange}
              defaultValue={visibility.language_spoken ?? visibility.language}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

/* --------------------------------
 * Detail Row
 --------------------------------*/
type DetailRowProps = {
  label: string;
  value: string;
  Icon?: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  show?: boolean;
  field?: VisibilityKeys | string;
  onSwitchChange?: (field: VisibilityKeys | string | undefined, value: boolean) => void;
  defaultValue?: boolean;
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  Icon,
  show = true,
  field,
  onSwitchChange,
  defaultValue = false,
}) => {
  const { theme } = useTheme();
  const IconComp = Icon || ListDashesIcon;
  const [active, setActive] = useState(defaultValue);

  useEffect(() => {
    setActive(defaultValue ?? false);
  }, [defaultValue]);

  const handleToggle = (val: boolean) => {
    setActive(val);
    onSwitchChange?.(field, val);
  };

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.borderColor }]}>
      <View style={[styles.detailIconWrap, { backgroundColor: theme.colors.primaryLight }]}>
        <IconComp size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.detailTextWrap}>
        <Text variant="overline" color={theme.colors.textLight}>
          {label}
        </Text>
        <Text variant="body1" color={theme.colors.text}>
          {value}
        </Text>
      </View>

      {show && <Switch initial={active} onToggle={handleToggle} />}
    </View>
  );
};

/* --------------------------------
 * Styles
 --------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  editText: { marginLeft: 6, fontWeight: '500' },

  content: {
    paddingHorizontal: 20,
    gap: 20,
  },

  avatarCardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },

  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameText: { marginBottom: 2, textTransform: 'capitalize' },

  socialRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    justifyContent: 'center',
  },

  socialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  sectionTextWrap: { flex: 1 },

  sectionTitle: { marginBottom: 4, fontWeight: '600' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailsList: { paddingTop: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.6,
  },

  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailTextWrap: { flex: 1 },
});

export default ProfileScreen;
