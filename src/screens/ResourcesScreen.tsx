import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Text } from "../components";
import { useTheme } from "@/theme/ThemeContext";
import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeft,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  ShareNetwork,
  ChatCircle,
  WhatsappLogo,
  CaretRight,
  Users,
  ChatsCircle,
} from "phosphor-react-native";
import Card from "@/components/Card";

const ResourcesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const cards = [
    {
      label: "Facebook",
      Icon: FacebookLogo,
      url: "https://www.facebook.com/arabsocials/",
    },
    {
      label: "Instagram",
      Icon: InstagramLogo,
      url: "https://www.instagram.com/arabsocials/",
    },
    {
      label: "TikTok",
      Icon: TiktokLogo,
      url: "https://www.tiktok.com/@arabsocial",
    },
    {
      label: "Website",
      Icon: ShareNetwork,
      url: "https://arabsocials.com",
    },
  ];

  const handlePress = (url: string) => {
    Linking.openURL(url);
  };

  const handleContactPress = async () => {
    const email = "contact@arabsocials.com";
    const subject = "Support request from ArabSocials app";
    const body = "";

    const mailtoUrl =
      "mailto:" +
      email +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        await Linking.openURL("mailto:" + email);
      }
    } catch (err) {
      console.log("Failed to open mail app", err);
    }
  };

  const handleWhatsAppPress = () => {
    // TODO: replace with your actual WhatsApp group link
    Linking.openURL("https://wa.me/");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors?.background || "#fff" },
      ]}
    >
      {/* Header: back btn + centered title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft size={16} color="#000" weight="bold" />
        </TouchableOpacity>

        <Text
          variant="body1"
          style={styles.headerTitle}
          color={theme.colors.text}
        >
          Resources
        </Text>

        {/* right spacer to keep title centered */}
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* WhatsApp Highlight Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleWhatsAppPress}
          style={styles.whatsappWrapper}
        >
          <LinearGradient
            colors={["#3FD68A", "#04A97C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.whatsappCard}
          >
            <View style={styles.whatsappInner}>
              {/* Top row: icon + arrow */}
              <View style={styles.whatsappHeaderRow}>
                <View style={styles.whatsappIconWrap}>
                  <WhatsappLogo size={32} color="#fff" weight="regular" />
                </View>

                <View style={styles.whatsappArrowWrap}>
                  <CaretRight size={18} color="#fff" weight="bold" />
                </View>
              </View>

              {/* Title + subtitle */}
              <View style={styles.whatsappTextBlock}>
                <Text variant="h5" color="#fff" style={styles.whatsappTitle}>
                  Join Our WhatsApp Groups
                </Text>
                <Text
                  variant="body1"
                  color="#fff"
                  style={styles.whatsappSubtitle}
                >
                  Connect with our vibrant community and stay updated with the
                  latest news.
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.whatsappDivider} />

              {/* Meta row */}
              <View style={styles.whatsappMetaRow}>
                <View style={styles.whatsappMetaItem}>
                  <Users size={18} color="#fff" />
                  <Text variant="overline" color="#fff">
                    5,000+ Members
                  </Text>
                </View>
                <View style={styles.whatsappMetaItem}>
                  <ChatsCircle size={18} color="#fff" />
                  <Text variant="overline" color="#fff">
                    Active Daily
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text
          variant="body1"
          color={theme.colors.text}
          style={{ marginVertical: 10 }}
        >
          Follow Us on Social Media
        </Text>

        {/* Social Links 2x2 grid inside Card */}
        <Card style={styles.socialCardWrapper}>
          <View style={styles.grid}>
            {cards.map(({ label, Icon, url }) => {
              const isWebsite = label === "Website";

              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.socialCard,
                    isWebsite
                      ? { backgroundColor: theme.colors.primary }
                      : { backgroundColor: theme.colors.primaryShade },
                  ]}
                  activeOpacity={0.9}
                  onPress={() => handlePress(url)}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      isWebsite && styles.iconWrapWebsite,
                    ]}
                  >
                    <Icon
                      size={32}
                      weight={isWebsite ? "regular" : "fill"}
                      color={isWebsite ? "#fff" : theme.colors.primary}
                    />
                  </View>
                  <Text
                    variant="body1"
                    textAlign="center"
                    color={isWebsite ? "#fff" : theme.colors.primary}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Contact Card (mailto) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContactPress}
          style={styles.contactWrapper}
        >
          <Card>
            <View style={styles.contactRow}>
              <View
                style={[
                  styles.contactIconWrap,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <ChatCircle size={24} color="#fff" weight="fill" />
              </View>

              <View style={styles.contactTextWrap}>
                <Text
                  variant="body1"
                  color={theme.colors.text}
                  style={styles.contactTitle}
                >
                  Need Help?
                </Text>
                <Text
                  variant="body1"
                  color={theme.colors.textLight}
                  style={styles.contactSubtitle}
                >
                  Have questions or feedback? We&apos;d love to hear from you.
                </Text>
                <Text
                  variant="body1"
                  color={theme.colors.primary}
                  style={styles.contactEmail}
                >
                  contact@arabsocials.com
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const HEADER_SIDE = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  backBtn: {
    width: HEADER_SIDE,
    height: HEADER_SIDE,
    borderRadius: HEADER_SIDE / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  headerTitle: {
    textAlign: "center",
    fontWeight: "600",
  },

  headerRightSpacer: {
    width: HEADER_SIDE,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  /* WhatsApp gradient card */

  whatsappWrapper: {
    marginBottom: 16,
  },

  whatsappCard: {
    borderRadius: 26,
    overflow: "hidden",
  },

  whatsappInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  whatsappHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  whatsappIconWrap: {
    backgroundColor: "rgba(255,255,255,0.14)",
    padding: 14,
    borderRadius: 18,
  },

  whatsappArrowWrap: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappTextBlock: {
    marginTop: 18,
  },

  whatsappTitle: {
    marginBottom: 6,
  },

  whatsappSubtitle: {
    lineHeight: 20,
  },

  whatsappDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.28)",
    marginTop: 18,
    marginBottom: 10,
  },

  whatsappMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  whatsappMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  /* Social grid */

  socialCardWrapper: {
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  socialCard: {
    width: "48%",
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
  },

  iconWrap: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
  },

  iconWrapWebsite: {
    backgroundColor: "#48bd96",
  },

  /* Contact card */

  contactWrapper: {
    marginTop: 8,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  contactIconWrap: {
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },

  contactTextWrap: {
    flex: 1,
  },

  contactTitle: {
    marginBottom: 2,
  },

  contactSubtitle: {
    marginBottom: 4,
  },

  contactEmail: {
    fontWeight: "600",
  },
});

export default ResourcesScreen;
