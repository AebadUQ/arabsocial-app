import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text } from '../components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Event } from '@/components/event/EventCard';
import LinearGradient from 'react-native-linear-gradient';
import { CalendarBlank, Crown, LinkSimple, MapPin, Tag } from 'phosphor-react-native';
import { formatDate } from '@/utils';

type EventDetailParams = {
  EventDetail: { event: Event };
};

const EventDetail: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<EventDetailParams, 'EventDetail'>>();
  const { event } = route.params;

  const CTA_HEIGHT = 56;
  const contentBottomPad = CTA_HEIGHT + 24 + insets.bottom;

  const onBookNow = () => {
    if (event?.ticketLink) {
      Linking.openURL(event.ticketLink).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: contentBottomPad }]}>
        {!!event?.image && (
          <Image source={event.image} style={styles.banner} resizeMode="cover" />
        )}

        {/* Title */}
        <Text variant="h5" style={[styles.title, { color: theme.colors.text, marginBottom: 16 }]}>
          {event?.name}
        </Text>

        <View style={{ flexDirection: 'column', gap: 24 }}>
          {/* Description */}
          {!!event?.description && <Text variant="body2">{event.description}</Text>}

          {/* Location */}
          {(event?.city || event?.address) && (
            <View style={styles.row}>
              <MapPin size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Location</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event?.address ? `${event.address}, ` : ''}
                  {event?.city}
                </Text>
              </View>
            </View>
          )}

          {/* Date */}
          {!!event?.startDate && (
            <View style={styles.row}>
              <CalendarBlank size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Date</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {formatDate(event.startDate)}
                </Text>
              </View>
            </View>
          )}

          {/* Ticket link */}
          {!!event?.ticketLink && (
            <View style={styles.row}>
              <LinkSimple size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Ticket link</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event.ticketLink}
                </Text>
              </View>
            </View>
          )}

          {/* Promo code (only if exists) */}
          {!!event?.promoCode && (
            <View style={styles.row}>
              <Tag size={20} color={theme.colors.primaryDark} />
              <View>
                <Text variant="overline">Promo code</Text>
                <Text variant="body1" color={theme.colors.primaryDark}>
                  {event.promoCode}
                </Text>
              </View>
            </View>
          )}

          {/* Organizer (placeholder using name) */}
          <View style={styles.row}>
            <Crown size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Organized by</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                {event?.name}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA: Book Now */}
      <View
        pointerEvents="box-none"
        style={[
          styles.ctaWrap,
         
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Book Now"
          onPress={onBookNow}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={['#1BAD7A', '#008F5C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaBtn}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16, // fixed RN key
    paddingTop: 16,
  },
  banner: {
    width: '100%',
    height: 320,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 0,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  // Sticky CTA
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  ctaShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default EventDetail;
