import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Event, User, WalletData, SocialImpact } from '../types';
import CivicAuthService from '../services/CivicAuthService';
import VendorPluginService from '../services/VendorPluginService';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Purchase: { event: Event };
  SocialImpact: { socialImpact: SocialImpact };
  Main: undefined;
};

type PurchaseScreenRouteProp = RouteProp<RootStackParamList, 'Purchase'>;
type PurchaseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Purchase'>;

interface TicketOption {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  loyaltyPoints: number;
}

const PurchaseScreen: React.FC = () => {
  const route = useRoute<PurchaseScreenRouteProp>();
  const navigation = useNavigation<PurchaseScreenNavigationProp>();
  const { event } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'details' | 'verify' | 'payment' | 'confirm'>('details');

  // Mock ticket types for the event
  const ticketOptions: TicketOption[] = [
    {
      id: 'general',
      name: 'General Admission',
      price: event.price,
      description: 'Standard access to the event',
      benefits: ['Event access', 'Basic amenities', 'Social impact contribution'],
      loyaltyPoints: event.loyaltyPointsReward,
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: event.price * 2.5,
      description: 'Premium experience with exclusive benefits',
      benefits: ['Priority entry', 'Premium seating', 'Meet & greet', 'Welcome drink', 'Double impact contribution'],
      loyaltyPoints: event.loyaltyPointsReward * 2,
    },
    {
      id: 'impact',
      name: 'Impact Champion',
      price: event.price * 1.5,
      description: 'Extra donation to amplify social impact',
      benefits: ['Standard access', 'Triple impact contribution', 'Impact certificate', 'Exclusive updates'],
      loyaltyPoints: event.loyaltyPointsReward * 1.5,
    },
  ];

  useEffect(() => {
    loadUserData();
    setSelectedTicketType(ticketOptions[0]); // Default to general admission
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = CivicAuthService.getCurrentUser();
      const wallet = await CivicAuthService.getWalletData();
      
      setUser(currentUser);
      setWalletData(wallet);
      setIsVerified(currentUser?.isVerified || false);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleVerifyIdentity = async () => {
    try {
      setIsVerifying(true);
      const verified = await CivicAuthService.verifyIdentity();
      
      if (verified) {
        setIsVerified(true);
        setCurrentStep('payment');
        Alert.alert(
          'Identity Verified! ✓',
          'Your identity has been verified with Civic Pass. You can now proceed with your purchase.',
          [{ text: 'Continue' }]
        );
      } else {
        Alert.alert(
          'Verification Required',
          'Please complete identity verification to purchase tickets for this event.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: handleVerifyIdentity },
          ]
        );
      }
    } catch (error) {
      console.error('Identity verification failed:', error);
      Alert.alert('Error', 'Identity verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTicketType || !user || !walletData) {
      Alert.alert('Error', 'Missing required information for purchase');
      return;
    }

    const totalCost = selectedTicketType.price * quantity;
    const totalCostSOL = totalCost / 23.45; // Convert USD to SOL (mock rate)

    if (walletData.balance < totalCostSOL) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${totalCostSOL.toFixed(4)} SOL but only have ${walletData.balance.toFixed(4)} SOL in your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => Alert.alert('Info', 'Redirecting to add funds...') },
        ]
      );
      return;
    }

    try {
      setIsPurchasing(true);

      // Simulate ticket purchase through vendor
      const ticket = await VendorPluginService.purchaseTicketThroughPlugin(
        event.vendorId || 'civic-platform',
        event.id,
        user.id,
        selectedTicketType.id
      );

      // Mock successful purchase
      const purchaseResult = {
        ...ticket,
        ticketType: selectedTicketType.name,
        quantity,
        totalPrice: totalCost,
        loyaltyPointsEarned: selectedTicketType.loyaltyPoints * quantity,
        transactionHash: `0x${Math.random().toString(16).substring(2, 42)}`,
        purchaseDate: new Date(),
      };

      setPurchasedTicket(purchaseResult);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Unable to complete your purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('Main');
  };

  const calculateTotal = () => {
    if (!selectedTicketType) return 0;
    return selectedTicketType.price * quantity;
  };

  const calculateImpact = () => {
    if (!event.socialImpact || !selectedTicketType) return null;

    const impactMultiplier = selectedTicketType.id === 'impact' ? 3 : selectedTicketType.id === 'vip' ? 2 : 1;
    
    if (event.socialImpact.type === 'trees') {
      return `${quantity * impactMultiplier} trees planted`;
    } else if (event.socialImpact.type === 'charity') {
      return `$${(calculateTotal() * 0.1 * impactMultiplier).toFixed(2)} donated`;
    } else if (event.socialImpact.type === 'carbon-offset') {
      return `${(quantity * 2 * impactMultiplier).toFixed(1)} kg CO2 offset`;
    }
    return event.socialImpact.impactMetrics.impactPerTicket;
  };

  const renderTicketSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Ticket Type</Text>
      {ticketOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.ticketOption,
            selectedTicketType?.id === option.id && styles.selectedTicketOption
          ]}
          onPress={() => setSelectedTicketType(option)}
        >
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketName}>{option.name}</Text>
            <Text style={styles.ticketPrice}>${option.price.toFixed(2)}</Text>
          </View>
          <Text style={styles.ticketDescription}>{option.description}</Text>
          <View style={styles.benefitsList}>
            {option.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          <View style={styles.loyaltyInfo}>
            <Icon name="stars" size={16} color="#FFD700" />
            <Text style={styles.loyaltyText}>+{option.loyaltyPoints} loyalty points</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quantity</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Icon name="remove" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.min(10, quantity + 1))}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIdentityVerification = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Identity Verification</Text>
      <View style={styles.verificationCard}>
        <View style={styles.verificationHeader}>
          <Icon 
            name={isVerified ? "verified-user" : "warning"} 
            size={32} 
            color={isVerified ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={styles.verificationTitle}>
            {isVerified ? "Verified with Civic Pass" : "Verification Required"}
          </Text>
        </View>
        <Text style={styles.verificationDescription}>
          {isVerified 
            ? "Your identity has been verified. You can purchase tickets without restrictions."
            : "This event requires identity verification to prevent scalping and ensure fair access."
          }
        </Text>
        {!isVerified && (
          <TouchableOpacity 
            style={styles.verifyButton} 
            onPress={handleVerifyIdentity}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="verified-user" size={20} color="#fff" />
                <Text style={styles.verifyButtonText}>Verify with Civic Pass</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentCard}>
        <View style={styles.walletInfo}>
          <Icon name="account-balance-wallet" size={24} color="#2E7D32" />
          <View style={styles.walletDetails}>
            <Text style={styles.walletLabel}>Civic Wallet</Text>
            <Text style={styles.walletBalance}>
              Balance: {walletData?.balance?.toFixed(4) || '0.0000'} SOL
            </Text>
          </View>
          <Icon name="check-circle" size={24} color="#4CAF50" />
        </View>
        <Text style={styles.paymentNote}>
          Payment will be processed using your Solana wallet
        </Text>
      </View>
    </View>
  );

  const renderSocialImpact = () => {
    if (!event.socialImpact) return null;

    return (
      <TouchableOpacity 
        style={styles.section}
        onPress={() => navigation.navigate('SocialImpact', { socialImpact: event.socialImpact! })}
      >
        <View style={styles.impactHeader}>
          <Text style={styles.sectionTitle}>Social Impact</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </View>
        <View style={styles.impactCard}>
          <Icon name="eco" size={32} color="#4CAF50" />
          <View style={styles.impactDetails}>
            <Text style={styles.impactTitle}>{event.socialImpact.description}</Text>
            <Text style={styles.impactAmount}>Your impact: {calculateImpact()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {selectedTicketType?.name} × {quantity}
          </Text>
          <Text style={styles.summaryValue}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Platform fee</Text>
          <Text style={styles.summaryValue}>$0.00</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Total</Text>
          <Text style={styles.summaryTotal}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Loyalty Points</Text>
          <Text style={styles.summaryValue}>
            +{(selectedTicketType?.loyaltyPoints || 0) * quantity}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPurchaseButton = () => {
    const canPurchase = selectedTicketType && (event.isAntiScalpingEnabled ? isVerified : true);
    const buttonText = event.isAntiScalpingEnabled && !isVerified 
      ? 'Verify Identity to Purchase'
      : 'Complete Purchase';

    return (
      <View style={styles.purchaseContainer}>
        <TouchableOpacity
          style={[styles.purchaseButton, !canPurchase && styles.purchaseButtonDisabled]}
          onPress={event.isAntiScalpingEnabled && !isVerified ? handleVerifyIdentity : handlePurchase}
          disabled={isPurchasing || !canPurchase}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon 
                name={event.isAntiScalpingEnabled && !isVerified ? "verified-user" : "payment"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.purchaseButtonText}>{buttonText}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.successModal}>
          <View style={styles.successHeader}>
            <Icon name="check-circle" size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>Purchase Successful!</Text>
          </View>
          
          <View style={styles.successDetails}>
            <Text style={styles.successText}>
              You've successfully purchased {quantity} ticket(s) for {event.name}
            </Text>
            
            <View style={styles.successInfo}>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Transaction ID:</Text>
                <Text style={styles.successValue}>
                  {purchasedTicket?.transactionHash?.substring(0, 10)}...
                </Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Loyalty Points Earned:</Text>
                <Text style={styles.successValue}>
                  +{purchasedTicket?.loyaltyPointsEarned}
                </Text>
              </View>
              {calculateImpact() && (
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Social Impact:</Text>
                  <Text style={styles.successValue}>{calculateImpact()}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.successButton} onPress={handleSuccessClose}>
            <Text style={styles.successButtonText}>View My Tickets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDetails}>
              {event.date.toLocaleDateString()} • {event.venue}
            </Text>
          </View>
        </View>

        {/* Purchase Flow */}
        {renderTicketSelection()}
        {renderQuantitySelector()}
        {event.isAntiScalpingEnabled && renderIdentityVerification()}
        {renderPaymentMethod()}
        {renderSocialImpact()}
        {renderOrderSummary()}
      </ScrollView>

      {renderPurchaseButton()}
      {renderSuccessModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  eventHeader: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventInfo: {
    padding: 16,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ticketOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedTicketOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  benefitsList: {
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  loyaltyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loyaltyText: {
    fontSize: 14,
    color: '#F57F17',
    marginLeft: 4,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#2E7D32',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 32,
    color: '#333',
  },
  verificationCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletDetails: {
    flex: 1,
    marginLeft: 12,
  },
  walletLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  walletBalance: {
    fontSize: 14,
    color: '#666',
  },
  paymentNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    padding: 16,
  },
  impactDetails: {
    flex: 1,
    marginLeft: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  impactAmount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  purchaseContainer: {
    backgroundColor: '#fff',
    padding: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  successDetails: {
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  successInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  successLabel: {
    fontSize: 14,
    color: '#666',
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  successButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PurchaseScreen; 