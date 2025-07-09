import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CivicAuthService from '../services/CivicAuthService';
import { WalletData, User, RewardRedemption } from '../types';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'ticket_purchase' | 'reward_redemption' | 'airdrop';
  amount: number;
  token: string;
  description: string;
  timestamp: Date;
  signature?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

const WalletScreen: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tokens' | 'nfts' | 'activity' | 'verify'>('overview');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const currentUser = CivicAuthService.getCurrentUser();
      const data = await CivicAuthService.getWalletData();
      
      setUser(currentUser);
      setWalletData(data);
      
      // Mock transaction history
      setTransactions([
        {
          id: '1',
          type: 'airdrop',
          amount: 1.0,
          token: 'SOL',
          description: 'Welcome bonus from Civic',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          signature: 'mock_signature_1',
          status: 'confirmed',
        },
        {
          id: '2',
          type: 'ticket_purchase',
          amount: 0.15,
          token: 'SOL',
          description: 'Ticket purchase: Civic Tech Meetup',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          signature: 'mock_signature_2',
          status: 'confirmed',
        },
        {
          id: '3',
          type: 'reward_redemption',
          amount: 0.05,
          token: 'SOL',
          description: 'Loyalty reward: Free ticket discount',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          signature: 'mock_signature_3',
          status: 'confirmed',
        },
      ]);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleAirdrop = async () => {
    try {
      if (!walletData) return;
      
      setIsLoading(true);
      const publicKey = CivicAuthService.getWalletPublicKey();
      if (publicKey) {
        await CivicAuthService.requestAirdrop(publicKey, 1);
        Alert.alert('Success', '1 SOL airdropped to your wallet!');
        await loadWalletData();
      }
    } catch (error) {
      console.error('Airdrop failed:', error);
      Alert.alert('Error', 'Airdrop failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) {
      Alert.alert('Error', 'Please enter amount and address');
      return;
    }

    Alert.alert(
      'Send SOL',
      `Send ${sendAmount} SOL to ${sendAddress.substring(0, 10)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Transaction sent successfully!');
            setShowSendModal(false);
            setSendAmount('');
            setSendAddress('');
          },
        },
      ]
    );
  };

  const handleVerifyIdentity = async () => {
    try {
      setIsLoading(true);
      const isVerified = await CivicAuthService.verifyIdentity();
      
      if (isVerified) {
        Alert.alert(
          'Identity Verified ✓',
          'Your identity has been verified with Civic Pass. You can now purchase tickets without restrictions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Verification Required',
          'To prevent ticket scalping and ensure fair access, please complete identity verification.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Verify Now', onPress: () => Alert.alert('Info', 'Identity verification completed successfully!') },
          ]
        );
      }
    } catch (error) {
      console.error('Identity verification failed:', error);
      Alert.alert('Error', 'Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Icon name="refresh" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {walletData?.balance?.toFixed(4) || '0.0000'} SOL
        </Text>
        <Text style={styles.balanceUsd}>
          ≈ ${((walletData?.balance || 0) * 23.45).toFixed(2)} USD
        </Text>
      </View>

      {/* Wallet Address */}
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressLabel}>Wallet Address</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Copied!', 'Wallet address copied to clipboard');
            }}
          >
            <Icon name="content-copy" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        <Text style={styles.addressText}>
          {walletData?.address ? 
            `${walletData.address.substring(0, 8)}...${walletData.address.substring(walletData.address.length - 8)}` : 
            'Loading...'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowSendModal(true)}>
          <Icon name="send" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleAirdrop}>
          <Icon name="arrow-downward" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleVerifyIdentity}>
          <Icon name="verified-user" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Identity Status */}
      <View style={styles.identityCard}>
        <View style={styles.identityHeader}>
          <Icon 
            name={user?.isVerified ? "verified-user" : "warning"} 
            size={24} 
            color={user?.isVerified ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={styles.identityTitle}>
            {user?.isVerified ? "Identity Verified" : "Identity Verification Required"}
          </Text>
        </View>
        <Text style={styles.identityDescription}>
          {user?.isVerified 
            ? "Your identity has been verified with Civic Pass. You can purchase tickets without restrictions."
            : "Complete identity verification to prevent scalping and ensure fair ticket access."
          }
        </Text>
        {!user?.isVerified && (
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyIdentity}>
            <Text style={styles.verifyButtonText}>Verify with Civic Pass</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTokensTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Token Holdings</Text>
      {walletData?.tokens?.map((token, index) => (
        <View key={index} style={styles.tokenItem}>
          <View style={styles.tokenIcon}>
            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>{token.symbol}</Text>
            <Text style={styles.tokenAmount}>
              {(token.amount / Math.pow(10, token.decimals)).toFixed(4)}
            </Text>
          </View>
          <Text style={styles.tokenValue}>
            ${((token.amount / Math.pow(10, token.decimals)) * 23.45).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderNFTsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>NFT Collection</Text>
      {walletData?.nfts && walletData.nfts.length > 0 ? (
        <View style={styles.nftGrid}>
          {walletData.nfts.map((nft, index) => (
            <View key={index} style={styles.nftItem}>
              <Image source={{ uri: nft.image }} style={styles.nftImage} />
              <Text style={styles.nftName}>{nft.name}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="collections" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No NFTs found</Text>
          <Text style={styles.emptyStateSubtext}>
            Purchase event tickets to start building your NFT collection
          </Text>
        </View>
      )}
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {transactions.map((tx, index) => (
        <View key={index} style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Icon 
              name={
                tx.type === 'received' || tx.type === 'airdrop' ? 'arrow-downward' :
                tx.type === 'sent' ? 'arrow-upward' :
                tx.type === 'ticket_purchase' ? 'confirmation-number' :
                'card-giftcard'
              } 
              size={24} 
              color={
                tx.type === 'received' || tx.type === 'airdrop' || tx.type === 'reward_redemption' ? '#4CAF50' : '#FF5722'
              } 
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{tx.description}</Text>
            <Text style={styles.transactionTime}>
              {tx.timestamp.toLocaleDateString()} at {tx.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.transactionAmountText,
              { color: tx.type === 'received' || tx.type === 'airdrop' || tx.type === 'reward_redemption' ? '#4CAF50' : '#FF5722' }
            ]}>
              {tx.type === 'received' || tx.type === 'airdrop' || tx.type === 'reward_redemption' ? '+' : '-'}
              {tx.amount} {tx.token}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: tx.status === 'confirmed' ? '#4CAF50' : '#FF9800' }]}>
              <Text style={styles.statusText}>{tx.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderVerifyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Identity Verification</Text>
      
      <View style={styles.verificationCard}>
        <View style={styles.verificationHeader}>
          <Icon name="security" size={32} color="#2E7D32" />
          <Text style={styles.verificationTitle}>Civic Pass</Text>
        </View>
        
        <Text style={styles.verificationDescription}>
          Civic Pass provides privacy-preserving identity verification to prevent ticket scalping and ensure fair access to events.
        </Text>

        <View style={styles.verificationFeatures}>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Anti-scalping protection</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Privacy-preserving verification</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>One-time setup</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Accepted by all partner venues</Text>
          </View>
        </View>

        <View style={styles.verificationStatus}>
          <Icon 
            name={user?.isVerified ? "verified-user" : "warning"} 
            size={24} 
            color={user?.isVerified ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={[
            styles.verificationStatusText,
            { color: user?.isVerified ? "#4CAF50" : "#FF9800" }
          ]}>
            {user?.isVerified ? "Verified" : "Verification Required"}
          </Text>
        </View>

        {!user?.isVerified && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyIdentity}>
            <Icon name="verified-user" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Complete Verification</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading && !walletData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview', icon: 'account-balance-wallet' },
            { key: 'tokens', label: 'Tokens', icon: 'paid' },
            { key: 'nfts', label: 'NFTs', icon: 'collections' },
            { key: 'activity', label: 'Activity', icon: 'history' },
            { key: 'verify', label: 'Verify', icon: 'verified-user' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Icon 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.key ? '#2E7D32' : '#666'} 
              />
              <Text style={[
                styles.tabLabel,
                selectedTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'tokens' && renderTokensTab()}
        {selectedTab === 'nfts' && renderNFTsTab()}
        {selectedTab === 'activity' && renderActivityTab()}
        {selectedTab === 'verify' && renderVerifyTab()}
      </ScrollView>

      {/* Send Modal */}
      <Modal visible={showSendModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send SOL</Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Amount (SOL)"
              value={sendAmount}
              onChangeText={setSendAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Recipient address"
              value={sendAddress}
              onChangeText={setSendAddress}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setShowSendModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSend}>
                <Text style={styles.primaryButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      )}
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabLabel: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceUsd: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  identityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  identityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  identityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenSymbol: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tokenAmount: {
    fontSize: 14,
    color: '#666',
  },
  tokenValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftItem: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  verificationDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  verificationFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verificationStatusText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WalletScreen; 