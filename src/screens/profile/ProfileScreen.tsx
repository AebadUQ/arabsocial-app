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
} from 'phosphor-react-native';
import { useAuth } from '@/context/Authcontext';
import { updateUserDetailVisibility } from '@/api/auth';
import Card from '@/components/Card';

// ---------------------------
// Helpers & constants
// ---------------------------

const safeValue = (value: any): string =>
  value === null || value === undefined || value === '' ? 'N/A' : String(value);

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
type SocialKey = 'facebook' | 'twitter' | 'instagram' | string;

const SOCIAL_ICON_MAP: Record<string, any> = {
  facebook: FacebookLogoIcon,
  twitter: XLogoIcon,
  instagram: InstagramLogoIcon,
};

// ---------------------------
// Screen
// ---------------------------

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const avatarUri =
    user?.image || user?.img || 'https://i.pravatar.cc/200?img=12';

  const languages = useMemo(
    () =>
      Array.isArray(user?.language_spoken) && user.language_spoken.length > 0
        ? user.language_spoken
        : ['N/A'],
    [user?.language_spoken]
  );

  const details = useMemo(
    () => ({
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

  const onEditAbout = () => navigation.navigate('ProfileEdit');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* 🔹 Top header (like screenshot) */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              // { backgroundColor: '#fff', borderColor: theme.colors.borderColor },
            ]}
          >
            <ArrowLeftIcon size={20} color={theme.colors.text} weight="bold" />
          </TouchableOpacity>

          <Text variant="body1" color={theme.colors.text} style={styles.topTitle}>
            Profile
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={onEditAbout}
          style={[
            styles.editBtn,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <NotePencilIcon size={16} color={theme.colors.primary} weight="regular" />
          <Text
            variant="caption"
            color={theme.colors.primary}
            style={styles.editText}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + basic info */}
        <Card>
          <View style={styles.avatarCardContent}>
            <View
              style={[
                styles.avatarBorder,
                { borderColor: theme.colors.primaryLight },
              ]}
            >
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </View>

            <Text
              variant="h5"
              style={styles.nameText}
              color={theme.colors.text}
            >
              {safeValue(user?.name)}
            </Text>
            <Text variant="caption" color={theme.colors.textLight}>
              {safeValue(user?.profession)}
            </Text>

            {/* Socials */}
            {user?.social_links && (
              <View style={styles.socialRow}>
                {Object.entries(user.social_links)
                  .filter(([_, value]) => !!value)
                  .map(([key, value]) => {
                    const iconKey = key as SocialKey;
                    const IconComp = SOCIAL_ICON_MAP[iconKey] || ListDashesIcon;

                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.socialIconWrap,
                          { borderColor: theme.colors.primaryLight },
                        ]}
                        onPress={() =>
                          console.log('Clicked social:', iconKey, value)
                        }
                      >
                        <IconComp size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
          </View>
        </Card>

        {/* About me */}
        <Card>
          <View style={styles.sectionTextWrap}>
            <Text
              variant="body1"
              color={theme.colors.text}
              style={styles.sectionTitle}
            >
              About me
            </Text>
            <Text variant="body1" color={theme.colors.textLight}>
              {safeValue(
                user?.about_me === '—' ? null : user?.about_me
              ) === 'N/A'
                ? 'No details provided.'
                : user?.about_me}
            </Text>
          </View>
        </Card>

        {/* Personal details */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text
              variant="body1"
              color={theme.colors.text}
              style={styles.sectionTitle}
            >
              Personal Details
            </Text>
          </View>

          <View style={styles.detailsList}>
            <DetailRow
              Icon={EnvelopeSimpleIcon}
              label="Email"
              value={details.email}
              show={false}
            />
            <DetailRow
              Icon={PhoneIcon}
              label="Phone"
              value={details.phone}
              show={false}
            />
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

// ---------------------------
// DetailRow Component
// ---------------------------
type DetailRowProps = {
  label: string;
  value: string;
  Icon?: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  show?: boolean;
  field?: VisibilityKeys | string;
  onSwitchChange?: (
    field: VisibilityKeys | string | undefined,
    value: boolean
  ) => void;
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
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.colors.borderColor },
      ]}
    >
      <View
        style={[
          styles.detailIconWrap,
          { backgroundColor: theme.colors.primaryLight },
        ]}
      >
        <IconComp size={20} color={theme.colors.primary} weight="regular" />
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

// ---------------------------
// Styles
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* 🔹 Top bar styles */
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
    columnGap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editText: {
    marginLeft: 6,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: 20,
    display:'flex',
    gap:20
  },

  // avatar section
  avatarCardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    padding: 4,
    borderWidth: 4,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  nameText: {
    textTransform: 'capitalize',
    marginBottom: 2,
  },

  // socials
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 8,
    marginTop: 10,
  },
  socialIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // sections
  sectionTextWrap: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailsList: {
    paddingTop: 10,
  },

  // detail row
  row: {
    flexDirection: 'row',
    columnGap: 12,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextWrap: {
    flex: 1,
    marginLeft: 4,
  },
});

export default ProfileScreen;
