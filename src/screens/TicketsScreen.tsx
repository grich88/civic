import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TicketsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tickets</Text>
      <Text style={styles.subtitle}>Your NFT tickets will appear here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default TicketsScreen; 