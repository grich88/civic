import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import VendorPluginService from '../services/VendorPluginService';
import { Event, VendorPlugin } from '../types';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePlugins, setActivePlugins] = useState<VendorPlugin[]>([]);

  useEffect(() => {
    loadEvents();
    loadActivePlugins();
  }, []);

  const loadActivePlugins = () => {
    const plugins = VendorPluginService.getActivePlugins();
    setActivePlugins(plugins);
  };

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Use the service method to get all events with proper fallback
      const allEvents = await VendorPluginService.getAllEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      // Fallback to empty array
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    // Serialize the date to avoid navigation warnings
    const eventWithSerializedDate = {
      ...event,
      date: event.date.toISOString(), // Convert Date to string
    };
    navigation.navigate('EventDetails', { event: eventWithSerializedDate });
  };

  const getSocialImpactIcon = (type: string) => {
    switch (type) {
      case 'charity':
        return 'favorite';
      case 'trees':
        return 'park';
      case 'carbon-offset':
        return 'eco';
      case 'education':
        return 'school';
      case 'healthcare':
        return 'local-hospital';
      default:
        return 'eco';
    }
  };

  const getSocialImpactColor = (type: string) => {
    switch (type) {
      case 'charity':
        return '#E91E63';
      case 'trees':
        return '#4CAF50';
      case 'carbon-offset':
        return '#2196F3';
      case 'education':
        return '#FF9800';
      case 'healthcare':
        return '#9C27B0';
      default:
        return '#4CAF50';
    }
  };

  const renderEventCard = ({ item: event }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.eventImageContainer}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="event" size={40} color="#ccc" />
          </View>
        )}
        {event.vendorId && (
          <View style={styles.vendorBadge}>
            <Text style={styles.vendorBadgeText}>
              {VendorPluginService.getPlugin(event.vendorId)?.name || 'Partner'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.name}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.eventDetailText}>
              {event.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit', 
                year: 'numeric' 
              })} at {event.date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.eventDetailText}>{event.venue}</Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.eventDetailText}>{event.organizer}</Text>
          </View>
        </View>

        {event.socialImpact && (
          <View style={styles.socialImpactContainer}>
            <Icon
              name={getSocialImpactIcon(event.socialImpact.type)}
              size={16}
              color={getSocialImpactColor(event.socialImpact.type)}
            />
            <Text style={styles.socialImpactText} numberOfLines={1}>
              {event.socialImpact.description}
            </Text>
          </View>
        )}

        <View style={styles.eventFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {event.price === 0 ? 'FREE' : `$${event.price}`}
            </Text>
            {event.loyaltyPointsReward > 0 && (
              <View style={styles.loyaltyBadge}>
                <Icon name="stars" size={12} color="#FFD700" />
                <Text style={styles.loyaltyText}>+{event.loyaltyPointsReward}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityText}>
              {event.maxCapacity - event.ticketsSold} left
            </Text>
            {event.isAntiScalpingEnabled && (
              <Icon name="verified-user" size={16} color="#4CAF50" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Discover Events</Text>
      <Text style={styles.headerSubtitle}>
        Every ticket supports social causes
      </Text>
      
      {activePlugins.length > 0 && (
        <View style={styles.partnersPreview}>
          <Text style={styles.partnersLabel}>Active Partners:</Text>
          <View style={styles.partnersList}>
            {activePlugins.map((plugin, index) => (
              <View key={plugin.id} style={styles.partnerChip}>
                <Text style={styles.partnerChipText}>{plugin.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2E7D32']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  partnersPreview: {
    marginTop: 10,
  },
  partnersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 8,
  },
  partnersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  partnerChip: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  partnerChipText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  vendorBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
  },
  eventDetails: {
    marginBottom: 10,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  socialImpactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  socialImpactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  loyaltyText: {
    fontSize: 10,
    color: '#E65100',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
});

export default HomeScreen; 