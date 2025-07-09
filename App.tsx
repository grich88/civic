import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Services
import CivicAuthService from './src/services/CivicAuthService';
import { User } from './src/types';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import TicketsScreen from './src/screens/TicketsScreen';
import LoyaltyScreen from './src/screens/LoyaltyScreen';
import WalletScreen from './src/screens/WalletScreen';
import PluginsScreen from './src/screens/PluginsScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import PurchaseScreen from './src/screens/PurchaseScreen';
import SocialImpactScreen from './src/screens/SocialImpactScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Tickets':
              iconName = 'confirmation-number';
              break;
            case 'Loyalty':
              iconName = 'loyalty';
              break;
            case 'Wallet':
              iconName = 'account-balance-wallet';
              break;
            case 'Plugins':
              iconName = 'extension';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 90 : 60,
        },
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Events',
          headerTitle: '🎫 Civic Impact Tickets'
        }}
      />
      <Tab.Screen 
        name="Tickets" 
        component={TicketsScreen}
        options={{ title: 'My Tickets' }}
      />
      <Tab.Screen 
        name="Loyalty" 
        component={LoyaltyScreen}
        options={{ title: 'Loyalty & Rewards' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ title: 'Wallet' }}
      />
      <Tab.Screen 
        name="Plugins" 
        component={PluginsScreen}
        options={{ title: 'Impact Vendors' }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator for app navigation
function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{ title: 'Purchase Ticket' }}
      />
      <Stack.Screen
        name="SocialImpact"
        component={SocialImpactScreen}
        options={{ title: 'Social Impact' }}
      />
    </Stack.Navigator>
  );
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Civic Auth Service
      await CivicAuthService.initialize();
      
      // Check if user is already authenticated
      const currentUser = CivicAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Continue anyway to show the auth screen
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleSignOut = async () => {
    try {
      await CivicAuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      Alert.alert(
        'Sign Out Failed',
        'Please try again',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#2E7D32"
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Civic Impact Tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2E7D32"
        translucent={false}
      />
      
      <NavigationContainer>
        {user ? (
          <AppStack />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen 
                  {...props} 
                  onAuthSuccess={handleAuthSuccess}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default App; 