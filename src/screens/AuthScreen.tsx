import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CivicAuthService from '../services/CivicAuthService';
import { User } from '../types';

const { width, height } = Dimensions.get('window');

interface Props {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await CivicAuthService.signInWithEmail('test@example.com');
      
      Alert.alert(
        'Welcome!',
        `Signed in as ${user.name}`,
        [{ text: 'OK' }]
      );

      onAuthSuccess(user);
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert(
        'Authentication Failed',
        'Please try again or check your connection',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Icon name="confirmation-number" size={60} color="#fff" />
            <Text style={styles.logoText}>Civic Impact</Text>
            <Text style={styles.logoSubtext}>Tickets</Text>
          </View>
          
          <Text style={styles.tagline}>
            Where every ticket makes a difference
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Icon name="loyalty" size={40} color="#4CAF50" />
            <Text style={styles.featureTitle}>Earn Rewards</Text>
            <Text style={styles.featureText}>
              Get loyalty points for every ticket and redeem for exclusive rewards
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Icon name="eco" size={40} color="#4CAF50" />
            <Text style={styles.featureTitle}>Social Impact</Text>
            <Text style={styles.featureText}>
              Support charity, plant trees, and offset carbon with every purchase
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Icon name="security" size={40} color="#4CAF50" />
            <Text style={styles.featureTitle}>Anti-Scalping</Text>
            <Text style={styles.featureText}>
              Fair ticket access with identity verification and fraud prevention
            </Text>
          </View>
        </View>

        {/* Vendor Partners Section */}
        <View style={styles.partnersSection}>
          <Text style={styles.partnersTitle}>Trusted Partners</Text>
          <View style={styles.partnersContainer}>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerName}>Humanitix</Text>
              <Text style={styles.partnerImpact}>$10M+ to charity</Text>
            </View>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerName}>Citizen Ticket</Text>
              <Text style={styles.partnerImpact}>3K+ trees planted</Text>
            </View>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerName}>TickEthic</Text>
              <Text style={styles.partnerImpact}>11K+ trees planted</Text>
            </View>
          </View>
        </View>

        {/* Auth Section */}
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Get Started</Text>
          <Text style={styles.authSubtitle}>
            Sign in with Civic Auth to access your tickets and wallet
          </Text>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="account-circle" size={24} color="#fff" />
                <Text style={styles.signInButtonText}>Sign in with Civic</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Instant wallet creation</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>No crypto knowledge needed</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Secure identity verification</Text>
            </View>
            <View style={styles.benefit}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Support social causes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  logoSubtext: {
    fontSize: 24,
    color: '#E8F5E8',
    fontWeight: '300',
  },
  tagline: {
    fontSize: 18,
    color: '#E8F5E8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 10,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 20,
  },
  partnersSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  partnersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  partnersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  partnerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 12,
    margin: 5,
    alignItems: 'center',
    minWidth: 100,
  },
  partnerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  partnerImpact: {
    fontSize: 10,
    color: '#E8F5E8',
  },
  authSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  signInButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  benefitsContainer: {
    marginTop: 10,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 10,
  },
});

export default AuthScreen; 