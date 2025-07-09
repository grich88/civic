import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Event, SocialImpact } from '../types';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  EventDetails: { 
    event: Event & { 
      date: string; // Serialized date
      imageUrl?: string;
    };
  };
  Purchase: { event: Event };
  SocialImpact: { socialImpact: SocialImpact };
};

type EventDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;
type EventDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetails'>;

const EventDetailsScreen: React.FC = () => {
  const route = useRoute<EventDetailsScreenRouteProp>();
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const { event } = route.params;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Convert serialized date back to Date object
  const eventDate = new Date(event.date);
  const isEventPast = eventDate < new Date();
  const ticketsRemaining = event.maxCapacity - event.ticketsSold;
  const isEventFull = ticketsRemaining <= 0;

  const handlePurchase = () => {
    if (isEventPast) {
      Alert.alert('Event Ended', 'This event has already taken place.');
      return;
    }
    
    if (isEventFull) {
      Alert.alert('Event Full', 'Sorry, this event is sold out.');
      return;
    }

    navigation.navigate('Purchase', { 
      event: {
        ...event,
        date: eventDate // Convert back to Date object for Purchase screen
      }
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.name} at ${event.venue} on ${eventDate.toLocaleDateString()}. ${event.description}`,
        title: event.name,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleSocialImpact = () => {
    if (event.socialImpact) {
      navigation.navigate('SocialImpact', { socialImpact: event.socialImpact });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatusColor = () => {
    if (isEventPast) return '#666';
    if (isEventFull) return '#FF5722';
    if (ticketsRemaining <= 10) return '#FF9800';
    return '#4CAF50';
  };

  const getEventStatus = () => {
    if (isEventPast) return 'Event Ended';
    if (isEventFull) return 'Sold Out';
    if (ticketsRemaining <= 10) return `Only ${ticketsRemaining} left!`;
    return 'Tickets Available';
  };

  const renderImageFallback = () => (
    <View style={styles.imageFallback}>
      <Icon name="event" size={80} color="#ccc" />
      <Text style={styles.imageFallbackText}>Event Image</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Event Image */}
      <View style={styles.imageContainer}>
        {event.imageUrl && !imageError ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          renderImageFallback()
        )}
        
        {/* Overlay Actions */}
        <View style={styles.imageOverlay}>
          <TouchableOpacity style={styles.overlayButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayButton} onPress={handleShare}>
            <Icon name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Event Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getEventStatusColor() }]}>
          <Text style={styles.statusText}>{getEventStatus()}</Text>
        </View>
      </View>

      {/* Event Content */}
      <View style={styles.content}>
        {/* Event Title and Basic Info */}
        <View style={styles.header}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.organizer}>by {event.organizer}</Text>
          
          {/* Price and Loyalty Points */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${event.price.toFixed(2)}</Text>
            <View style={styles.loyaltyBadge}>
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.loyaltyPoints}>+{event.loyaltyPointsReward} pts</Text>
            </View>
          </View>
        </View>

        {/* Date and Venue */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon name="event" size={20} color="#2E7D32" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(eventDate)} at {formatTime(eventDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#2E7D32" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Venue</Text>
              <Text style={styles.detailValue}>{event.venue}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="people" size={20} color="#2E7D32" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Capacity</Text>
              <Text style={styles.detailValue}>
                {event.ticketsSold} / {event.maxCapacity} tickets sold
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Social Impact */}
        {event.socialImpact && (
          <TouchableOpacity style={styles.impactCard} onPress={handleSocialImpact}>
            <View style={styles.impactHeader}>
              <Icon name="eco" size={24} color="#4CAF50" />
              <Text style={styles.impactTitle}>Social Impact</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>
            <Text style={styles.impactDescription}>
              {event.socialImpact.description}
            </Text>
            <View style={styles.impactMetrics}>
              <Text style={styles.impactMetric}>
                {event.socialImpact.impactMetrics.impactPerTicket} per ticket
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Anti-Scalping Info */}
        {event.isAntiScalpingEnabled && (
          <View style={styles.antiScalpingCard}>
            <View style={styles.antiScalpingHeader}>
              <Icon name="verified-user" size={20} color="#2E7D32" />
              <Text style={styles.antiScalpingTitle}>Anti-Scalping Protection</Text>
            </View>
            <Text style={styles.antiScalpingDescription}>
              This event uses Civic Pass for identity verification to prevent ticket scalping and ensure fair access.
            </Text>
          </View>
        )}

        {/* Vendor Info */}
        {event.vendorId && (
          <View style={styles.vendorCard}>
            <Text style={styles.vendorLabel}>Powered by</Text>
            <Text style={styles.vendorName}>
              {event.vendorId === 'humanitix' ? 'Humanitix' :
               event.vendorId === 'citizenticket' ? 'Citizen Ticket' :
               event.vendorId === 'tickethic' ? 'TickEthic' :
               event.vendorId === 'ticketebo' ? 'Ticketebo' :
               'Partner Vendor'}
            </Text>
          </View>
        )}
      </View>

      {/* Purchase Button */}
      <View style={styles.purchaseContainer}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (isEventPast || isEventFull) && styles.purchaseButtonDisabled
          ]}
          onPress={handlePurchase}
          disabled={isEventPast || isEventFull}
        >
          <Icon 
            name={isEventPast ? "event-busy" : isEventFull ? "block" : "confirmation-number"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.purchaseButtonText}>
            {isEventPast ? 'Event Ended' : 
             isEventFull ? 'Sold Out' : 
             `Purchase Ticket - $${event.price.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageFallbackText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  eventName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  organizer: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loyaltyPoints: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  impactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  impactMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  impactMetric: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  antiScalpingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  antiScalpingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  antiScalpingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  antiScalpingDescription: {
    fontSize: 14,
    color: '#666',
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  vendorLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
  purchaseContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  purchaseButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#999',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EventDetailsScreen; 