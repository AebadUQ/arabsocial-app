import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Text } from '../components';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Event } from '@/components/event/EventCard';
import LinearGradient from 'react-native-linear-gradient';
import { CalendarBlank, CopyIcon, Crown, LinkSimple, ListDashesIcon, MapPin, Tag } from 'phosphor-react-native';
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
          {!!event?.description && <Text variant="body2" color={theme.colors.textLight}>{event.description}</Text>}

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

         

        

          {/* Organizer (placeholder using name) */}
          <View style={styles.row}>
            <ListDashesIcon size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Category</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                {event?.name}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <MapPin size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Location</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                Oman
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <LinkSimple size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Website</Text>
              <Text variant="body1" color={theme.colors.primaryDark}>
                business.com
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Tag size={20} color={theme.colors.primaryDark} />
            <View>
              <Text variant="overline">Promo code</Text>
              <View style={{display:'flex',flexDirection:'row',gap:8}}>

              <Text variant="body1" color={theme.colors.primaryDark}>
                arabsocial             
              </Text>
              <CopyIcon size={20} color={theme.colors.primaryDark} />

              </View>
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA: Book Now */}
     
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

  
});

export default EventDetail;
