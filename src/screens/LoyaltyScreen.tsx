import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Image,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VendorPluginService from '../services/VendorPluginService';
import { 
  LoyaltyPoint, 
  RewardTier, 
  RewardCatalog, 
  RewardRedemption,
  UserLoyaltyProfile 
} from '../types';

const { width } = Dimensions.get('window');

interface LoyaltyScreenProps {
  navigation: any;
}

const LoyaltyScreen: React.FC<LoyaltyScreenProps> = ({ navigation }) => {
  const [userPoints, setUserPoints] = useState<LoyaltyPoint[]>([]);
  const [rewardCatalogs, setRewardCatalogs] = useState<RewardCatalog[]>([]);
  const [selectedReward, setSelectedReward] = useState<RewardTier | null>(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState<RewardRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'profile'>('rewards');

  const mockUserId = 'user-123';

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      setIsLoading(true);
      
      // Load user points (mock data)
      const mockPoints: LoyaltyPoint[] = [
        {
          id: 'points-1',
          userId: mockUserId,
          vendorId: 'humanitix',
          vendorName: 'Humanitix',
          points: 650,
          earnedFrom: 'Concert ticket purchase',
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'points-2',
          userId: mockUserId,
          vendorId: 'citizen-ticket',
          vendorName: 'Citizen Ticket',
          points: 420,
          earnedFrom: 'Eco-festival attendance',
          earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'points-3',
          userId: mockUserId,
          vendorId: 'tickethic',
          vendorName: 'TickEthic',
          points: 280,
          earnedFrom: 'Green conference ticket',
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'points-4',
          userId: mockUserId,
          vendorId: 'ticketebo',
          vendorName: 'Ticketebo',
          points: 380,
          earnedFrom: 'Climate summit ticket',
          earnedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        }
      ];
      
      setUserPoints(mockPoints);
      
      // Load reward catalogs from all vendors
      const activePlugins = VendorPluginService.getActivePlugins();
      const catalogs: RewardCatalog[] = [];
      
      activePlugins.forEach(plugin => {
        const catalog = VendorPluginService.getRewardCatalog(plugin.id);
        if (catalog) {
          catalogs.push(catalog);
        }
      });
      
      setRewardCatalogs(catalogs);
      
      // Mock redemption history
      const mockHistory: RewardRedemption[] = [
        {
          id: 'redemption-1',
          userId: mockUserId,
          vendorId: 'humanitix',
          rewardTierId: 'humanitix-discount-20',
          pointsUsed: 200,
          rewardType: 'discount',
          rewardValue: '20% off',
          rewardDetails: {
            name: '20% Off Any Event',
            description: 'Get 20% discount on any Humanitix event ticket',
            instructions: 'Enter this code at checkout to apply your discount.',
            voucherCode: 'HUMANITIX-1734567890-ABC123'
          },
          redeemedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'confirmed'
        }
      ];
      
      setRedemptionHistory(mockHistory);
      
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
      Alert.alert('Error', 'Failed to load loyalty data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoyaltyData();
    setRefreshing(false);
  };

  const getVendorPoints = (vendorId: string): number => {
    return userPoints
      .filter(point => point.vendorId === vendorId)
      .reduce((total, point) => total + point.points, 0);
  };

  const getTotalPoints = (): number => {
    return userPoints.reduce((total, point) => total + point.points, 0);
  };

  const handleRewardPress = (reward: RewardTier) => {
    setSelectedReward(reward);
    setRedeemModalVisible(true);
  };

  const redeemReward = async () => {
    if (!selectedReward) return;
    
    try {
      const vendorPoints = getVendorPoints(selectedReward.vendorId);
      
      if (vendorPoints < selectedReward.pointsRequired) {
        Alert.alert(
          'Insufficient Points',
          `You need ${selectedReward.pointsRequired} points but only have ${vendorPoints} points from ${selectedReward.vendorId}.`
        );
        return;
      }
      
      const redemption = await VendorPluginService.redeemReward(
        mockUserId,
        selectedReward.id,
        userPoints
      );
      
      // Update local state to reflect point deduction
      setUserPoints(prevPoints => 
        prevPoints.map(point => 
          point.vendorId === selectedReward.vendorId
            ? { ...point, points: Math.max(0, point.points - selectedReward.pointsRequired) }
            : point
        ).filter(point => point.points > 0)
      );
      
      // Add to redemption history
      setRedemptionHistory(prev => [redemption, ...prev]);
      
      setRedeemModalVisible(false);
      setSelectedReward(null);
      
      Alert.alert(
        'Reward Redeemed!',
        `Your ${selectedReward.name} has been redeemed successfully. ${redemption.rewardDetails.voucherCode ? `Your code: ${redemption.rewardDetails.voucherCode}` : 'Check your email for details.'}`
      );
      
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      Alert.alert('Error', 'Failed to redeem reward. Please try again.');
    }
  };

  const renderUserTier = () => {
    const totalPoints = getTotalPoints();
    let tier = 'Bronze';
    let tierColor = '#CD7F32';
    let nextTierPoints = 500;
    
    if (totalPoints >= 2000) {
      tier = 'Platinum';
      tierColor = '#E5E4E2';
      nextTierPoints = 0;
    } else if (totalPoints >= 1000) {
      tier = 'Gold';
      tierColor = '#FFD700';
      nextTierPoints = 2000;
    } else if (totalPoints >= 500) {
      tier = 'Silver';
      tierColor = '#C0C0C0';
      nextTierPoints = 1000;
    }
    
    return (
      <View style={styles.tierCard}>
        <View style={styles.tierHeader}>
          <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
            <Ionicons name="star" size={20} color="white" />
          </View>
          <View style={styles.tierInfo}>
            <Text style={styles.tierTitle}>{tier} Member</Text>
            <Text style={styles.tierSubtitle}>
              {nextTierPoints > 0 
                ? `${nextTierPoints - totalPoints} points to ${nextTierPoints === 500 ? 'Silver' : nextTierPoints === 1000 ? 'Gold' : 'Platinum'}`
                : 'Highest tier achieved!'
              }
            </Text>
          </View>
          <Text style={styles.totalPoints}>{totalPoints.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const renderPointsBalance = () => {
    return (
      <View style={styles.pointsContainer}>
        <Text style={styles.sectionTitle}>Your Points Balance</Text>
        {userPoints.map((point, index) => (
          <View key={point.id} style={styles.pointCard}>
            <View style={styles.pointHeader}>
              <Text style={styles.vendorName}>{point.vendorName}</Text>
              <Text style={styles.pointAmount}>{point.points}</Text>
            </View>
            <Text style={styles.pointSource}>From: {point.earnedFrom}</Text>
            <Text style={styles.pointDate}>
              {point.earnedAt.toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRewardCard = (reward: RewardTier) => {
    const vendorPoints = getVendorPoints(reward.vendorId);
    const canRedeem = vendorPoints >= reward.pointsRequired;
    const isLimited = reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions;
    
    return (
      <TouchableOpacity
        key={reward.id}
        style={[
          styles.rewardCard,
          !canRedeem && styles.rewardCardDisabled,
          isLimited && styles.rewardCardLimited
        ]}
        onPress={() => canRedeem && !isLimited && handleRewardPress(reward)}
        disabled={!canRedeem || isLimited}
      >
        <View style={styles.rewardHeader}>
          <View style={styles.rewardType}>
            <Ionicons 
              name={getRewardIcon(reward.rewardType)} 
              size={24} 
              color={canRedeem ? '#4CAF50' : '#9E9E9E'} 
            />
            <Text style={[styles.rewardTypeText, !canRedeem && styles.disabledText]}>
              {reward.rewardType.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.rewardPoints, !canRedeem && styles.disabledText]}>
            {reward.pointsRequired} pts
          </Text>
        </View>
        
        <Text style={[styles.rewardName, !canRedeem && styles.disabledText]}>
          {reward.name}
        </Text>
        <Text style={[styles.rewardDescription, !canRedeem && styles.disabledText]}>
          {reward.description}
        </Text>
        <Text style={[styles.rewardValue, !canRedeem && styles.disabledText]}>
          Value: {reward.value}
        </Text>
        
        {reward.maxRedemptions && (
          <Text style={styles.rewardLimit}>
            {reward.currentRedemptions}/{reward.maxRedemptions} redeemed
          </Text>
        )}
        
        {!canRedeem && (
          <Text style={styles.insufficientPoints}>
            Need {reward.pointsRequired - vendorPoints} more points
          </Text>
        )}
        
        {isLimited && (
          <Text style={styles.limitReached}>Redemption limit reached</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'free_ticket': return 'ticket';
      case 'discount': return 'pricetag';
      case 'upgrade': return 'arrow-up-circle';
      case 'voucher': return 'card';
      case 'experience': return 'star';
      case 'merchandise': return 'gift';
      default: return 'gift';
    }
  };

  const renderRedemptionHistory = () => {
    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Redemption History</Text>
        {redemptionHistory.length === 0 ? (
          <Text style={styles.emptyText}>No redemptions yet</Text>
        ) : (
          redemptionHistory.map((redemption) => (
            <View key={redemption.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyRewardName}>
                  {redemption.rewardDetails.name}
                </Text>
                <Text style={styles.historyDate}>
                  {redemption.redeemedAt.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyValue}>
                Value: {redemption.rewardValue}
              </Text>
              <Text style={styles.historyPoints}>
                -{redemption.pointsUsed} points
              </Text>
              {redemption.rewardDetails.voucherCode && (
                <View style={styles.voucherContainer}>
                  <Text style={styles.voucherLabel}>Code:</Text>
                  <Text style={styles.voucherCode}>
                    {redemption.rewardDetails.voucherCode}
                  </Text>
                </View>
              )}
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(redemption.status) }
              ]}>
                <Text style={styles.statusText}>
                  {redemption.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'used': return '#2196F3';
      case 'expired': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rewards':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderUserTier()}
            {renderPointsBalance()}
            
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {rewardCatalogs.map(catalog => (
              <View key={catalog.vendorId} style={styles.catalogSection}>
                <View style={styles.catalogHeader}>
                  <Text style={styles.catalogTitle}>{catalog.vendorName}</Text>
                  <Text style={styles.catalogPoints}>
                    {getVendorPoints(catalog.vendorId)} points
                  </Text>
                </View>
                
                <Text style={styles.catalogSubtitle}>Regular Rewards</Text>
                {catalog.tiers.map(reward => renderRewardCard(reward))}
                
                {catalog.specialOffers.length > 0 && (
                  <>
                    <Text style={styles.catalogSubtitle}>🌟 Special Offers</Text>
                    {catalog.specialOffers.map(reward => renderRewardCard(reward))}
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        );
      
      case 'history':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderRedemptionHistory()}
          </ScrollView>
        );
      
      case 'profile':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderUserTier()}
            <View style={styles.profileStats}>
              <Text style={styles.sectionTitle}>Your Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Points Earned:</Text>
                <Text style={styles.statValue}>{getTotalPoints().toLocaleString()}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Rewards Redeemed:</Text>
                <Text style={styles.statValue}>{redemptionHistory.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Active Vendors:</Text>
                <Text style={styles.statValue}>{rewardCatalogs.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Available Rewards:</Text>
                <Text style={styles.statValue}>
                  {rewardCatalogs.reduce((total, catalog) => 
                    total + catalog.tiers.length + catalog.specialOffers.length, 0
                  )}
                </Text>
              </View>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loyalty & Rewards</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['rewards', 'history', 'profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Reward Redemption Modal */}
      <Modal
        visible={redeemModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRedeemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReward && (
              <>
                <Text style={styles.modalTitle}>Redeem Reward</Text>
                <Text style={styles.modalRewardName}>{selectedReward.name}</Text>
                <Text style={styles.modalRewardDescription}>
                  {selectedReward.description}
                </Text>
                <Text style={styles.modalRewardValue}>
                  Value: {selectedReward.value}
                </Text>
                <Text style={styles.modalPointsCost}>
                  Cost: {selectedReward.pointsRequired} points
                </Text>
                {selectedReward.terms && (
                  <Text style={styles.modalTerms}>
                    Terms: {selectedReward.terms}
                  </Text>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setRedeemModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.redeemButton}
                    onPress={redeemReward}
                  >
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tierCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tierSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  totalPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    marginTop: 10,
  },
  pointsContainer: {
    marginBottom: 20,
  },
  pointCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pointAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointSource: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  pointDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  catalogSection: {
    marginBottom: 30,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catalogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  catalogPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  catalogSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 15,
  },
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  rewardCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  rewardCardLimited: {
    borderColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  rewardLimit: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  insufficientPoints: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
    marginTop: 5,
  },
  limitReached: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
    marginTop: 5,
  },
  disabledText: {
    color: '#999',
  },
  historyContainer: {
    marginTop: 10,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    position: 'relative',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyRewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyValue: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  historyPoints: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 10,
  },
  voucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  voucherLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  profileStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalRewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalRewardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalRewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalPointsCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalTerms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  redeemButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  redeemButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoyaltyScreen; 