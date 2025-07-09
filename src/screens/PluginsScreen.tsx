import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import VendorPluginService from '../services/VendorPluginService';
import { VendorPlugin } from '../types';

const PluginsScreen: React.FC = () => {
  const [plugins, setPlugins] = useState<VendorPlugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<VendorPlugin | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [aggregatedImpact, setAggregatedImpact] = useState<any>(null);

  useEffect(() => {
    loadPlugins();
    loadAggregatedImpact();
  }, []);

  const loadPlugins = () => {
    const allPlugins = VendorPluginService.getAllPlugins();
    setPlugins(allPlugins);
  };

  const loadAggregatedImpact = () => {
    const impact = VendorPluginService.getAggregatedSocialImpact();
    setAggregatedImpact(impact);
  };

  const togglePlugin = (pluginId: string, isActive: boolean) => {
    VendorPluginService.setPluginStatus(pluginId, isActive);
    loadPlugins();
    loadAggregatedImpact();
  };

  const openPluginDetails = (plugin: VendorPlugin) => {
    setSelectedPlugin(plugin);
    setModalVisible(true);
  };

  const openPluginWebsite = (url: string) => {
    Linking.openURL(url);
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

  const renderPluginCard = ({ item: plugin }: { item: VendorPlugin }) => (
    <TouchableOpacity
      style={styles.pluginCard}
      onPress={() => openPluginDetails(plugin)}
      activeOpacity={0.7}
    >
      <View style={styles.pluginHeader}>
        <View style={styles.pluginInfo}>
          <View style={styles.pluginLogoContainer}>
            <Icon
              name={getSocialImpactIcon(plugin.socialImpact.type)}
              size={24}
              color={getSocialImpactColor(plugin.socialImpact.type)}
            />
          </View>
          <View style={styles.pluginDetails}>
            <Text style={styles.pluginName}>{plugin.name}</Text>
            <Text style={styles.pluginType}>{plugin.type.toUpperCase()}</Text>
          </View>
        </View>
        <Switch
          value={plugin.isActive}
          onValueChange={(value) => togglePlugin(plugin.id, value)}
          trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
          thumbColor={plugin.isActive ? '#2E7D32' : '#9E9E9E'}
        />
      </View>

      <Text style={styles.pluginDescription} numberOfLines={2}>
        {plugin.description}
      </Text>

      <View style={styles.socialImpactRow}>
        <Icon
          name={getSocialImpactIcon(plugin.socialImpact.type)}
          size={16}
          color={getSocialImpactColor(plugin.socialImpact.type)}
        />
        <Text style={styles.socialImpactText} numberOfLines={1}>
          {plugin.socialImpact.description}
        </Text>
      </View>

      <View style={styles.impactMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Total Impact:</Text>
          <Text style={styles.metricValue}>
            {plugin.socialImpact.impactMetrics.totalImpact}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Per Ticket:</Text>
          <Text style={styles.metricValue}>
            {plugin.socialImpact.impactMetrics.impactPerTicket}
          </Text>
        </View>
      </View>

      <View style={styles.pluginFooter}>
        <View style={styles.featuresList}>
          {plugin.configuration.supportedFeatures.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureBadge}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {plugin.configuration.supportedFeatures.length > 2 && (
            <Text style={styles.moreFeatures}>
              +{plugin.configuration.supportedFeatures.length - 2} more
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => openPluginDetails(plugin)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Icon name="arrow-forward" size={16} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Impact Vendors</Text>
      <Text style={styles.headerSubtitle}>
        Connect with socially responsible ticketing partners
      </Text>

      {aggregatedImpact && (
        <View style={styles.impactSummary}>
          <Text style={styles.impactSummaryTitle}>Combined Impact</Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Icon name="park" size={20} color="#4CAF50" />
              <Text style={styles.impactStatNumber}>
                {aggregatedImpact.totalTreesPlanted.toLocaleString()}
              </Text>
              <Text style={styles.impactStatLabel}>Trees Planted</Text>
            </View>
            <View style={styles.impactStat}>
              <Icon name="favorite" size={20} color="#E91E63" />
              <Text style={styles.impactStatNumber}>
                ${aggregatedImpact.totalMoneyDonated.toLocaleString()}
              </Text>
              <Text style={styles.impactStatLabel}>Donated</Text>
            </View>
            <View style={styles.impactStat}>
              <Icon name="eco" size={20} color="#2196F3" />
              <Text style={styles.impactStatNumber}>
                {aggregatedImpact.carbonOffsetPrograms}
              </Text>
              <Text style={styles.impactStatLabel}>Carbon Programs</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderPluginModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{selectedPlugin?.name}</Text>
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={() => selectedPlugin && openPluginWebsite(selectedPlugin.websiteUrl)}
          >
            <Icon name="open-in-new" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedPlugin && (
            <>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{selectedPlugin.description}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Social Impact</Text>
                <View style={styles.impactDetailCard}>
                  <View style={styles.impactDetailHeader}>
                    <Icon
                      name={getSocialImpactIcon(selectedPlugin.socialImpact.type)}
                      size={32}
                      color={getSocialImpactColor(selectedPlugin.socialImpact.type)}
                    />
                    <Text style={styles.impactType}>
                      {selectedPlugin.socialImpact.type.replace('-', ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.impactDescription}>
                    {selectedPlugin.socialImpact.description}
                  </Text>
                  <Text style={styles.beneficiary}>
                    Beneficiary: {selectedPlugin.socialImpact.beneficiary}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Impact Metrics</Text>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricCardTitle}>Total Impact</Text>
                    <Text style={styles.metricCardValue}>
                      {selectedPlugin.socialImpact.impactMetrics.totalImpact}
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricCardTitle}>Per Ticket</Text>
                    <Text style={styles.metricCardValue}>
                      {selectedPlugin.socialImpact.impactMetrics.impactPerTicket}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featuresGrid}>
                  {selectedPlugin.configuration.supportedFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Icon name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureItemText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Active</Text>
                  <Switch
                    value={selectedPlugin.isActive}
                    onValueChange={(value) => {
                      togglePlugin(selectedPlugin.id, value);
                      setSelectedPlugin({...selectedPlugin, isActive: value});
                    }}
                    trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
                    thumbColor={selectedPlugin.isActive ? '#2E7D32' : '#9E9E9E'}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={plugins}
        renderItem={renderPluginCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {renderPluginModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 20,
  },
  impactSummary: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 15,
  },
  impactSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
    textAlign: 'center',
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 5,
  },
  impactStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pluginCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pluginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pluginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pluginLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pluginDetails: {
    flex: 1,
  },
  pluginName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  pluginType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  pluginDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  socialImpactRow: {
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
  impactMetrics: {
    marginBottom: 15,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  pluginFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuresList: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  featureBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  featureText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '500',
  },
  moreFeatures: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
    textAlign: 'center',
  },
  websiteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  impactDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  impactDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 10,
  },
  impactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  beneficiary: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    flex: 0.48,
  },
  metricCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  metricCardValue: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: 'bold',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureItemText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  statusLabel: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '500',
  },
});

export default PluginsScreen; 