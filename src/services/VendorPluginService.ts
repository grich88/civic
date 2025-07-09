import axios, { AxiosResponse } from 'axios';
import { 
  VendorPlugin, 
  PluginApiResponse, 
  HumanitixIntegration,
  CitizenTicketIntegration,
  TickEthicIntegration,
  TicketeboIntegration,
  Event,
  Ticket,
  SocialImpact,
  RewardCatalog,
  RewardTier,
  RewardRedemption,
  UserLoyaltyProfile,
  LoyaltyPoint
} from '../types';

class VendorPluginService {
  private plugins: Map<string, VendorPlugin> = new Map();

  constructor() {
    this.initializeDefaultPlugins();
  }

  private initializeDefaultPlugins() {
    // Humanitix Plugin with Reward Catalog
    const humanitixRewards: RewardCatalog = {
      vendorId: 'humanitix',
      vendorName: 'Humanitix',
      tiers: [
        {
          id: 'humanitix-free-ticket',
          vendorId: 'humanitix',
          name: 'Free Event Ticket',
          description: 'Get a free ticket to any Humanitix event under $50',
          pointsRequired: 500,
          rewardType: 'free_ticket',
          value: 'Free ticket up to $50',
          isActive: true,
          maxRedemptions: 100,
          currentRedemptions: 23,
          terms: 'Valid for events under $50. Cannot be combined with other offers.'
        },
        {
          id: 'humanitix-discount-20',
          vendorId: 'humanitix',
          name: '20% Off Any Event',
          description: 'Get 20% discount on any Humanitix event ticket',
          pointsRequired: 200,
          rewardType: 'discount',
          value: '20% off',
          isActive: true,
          maxRedemptions: 500,
          currentRedemptions: 127,
          terms: 'Valid for 30 days from redemption.'
        },
        {
          id: 'humanitix-charity-match',
          vendorId: 'humanitix',
          name: 'Double Charity Impact',
          description: 'We will double your charity contribution on your next purchase',
          pointsRequired: 300,
          rewardType: 'experience',
          value: '2x charity impact',
          isActive: true,
          maxRedemptions: 200,
          currentRedemptions: 45,
          terms: 'Applied automatically to your next ticket purchase.'
        }
      ],
      specialOffers: [
        {
          id: 'humanitix-vip-upgrade',
          vendorId: 'humanitix',
          name: 'VIP Experience Upgrade',
          description: 'Upgrade to VIP access at select events',
          pointsRequired: 1000,
          rewardType: 'upgrade',
          value: 'VIP upgrade',
          isActive: true,
          maxRedemptions: 50,
          currentRedemptions: 8,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          terms: 'Subject to availability. Valid at participating venues only.'
        }
      ]
    };

    const humanitix: VendorPlugin = {
      id: 'humanitix',
      name: 'Humanitix',
      type: 'ticketing',
      description: 'Tickets for good, not greed. 100% of profits go to charity.',
      logoUrl: 'https://humanitix.com/logo.png',
      websiteUrl: 'https://humanitix.com',
      apiEndpoint: 'https://api.humanitix.com/v1',
      isActive: true,
      socialImpact: {
        type: 'charity',
        description: '100% of booking fee profits donated to education and healthcare charities',
        beneficiary: 'Various education and healthcare charities worldwide',
        impactMetrics: {
          totalImpact: '$10M+ donated to date',
          impactPerTicket: '100% of booking fees'
        }
      },
      configuration: {
        supportedFeatures: ['ticket-sales', 'charity-donation', 'impact-tracking', 'anti-scalping', 'loyalty-rewards']
      },
      rewardCatalog: humanitixRewards
    };

    // Citizen Ticket Plugin with Environmental Rewards
    const citizenTicketRewards: RewardCatalog = {
      vendorId: 'citizen-ticket',
      vendorName: 'Citizen Ticket',
      tiers: [
        {
          id: 'citizen-free-eco-event',
          vendorId: 'citizen-ticket',
          name: 'Free Eco-Friendly Event',
          description: 'Free ticket to any sustainable event',
          pointsRequired: 400,
          rewardType: 'free_ticket',
          value: 'Free sustainable event ticket',
          isActive: true,
          maxRedemptions: 75,
          currentRedemptions: 31,
          terms: 'Valid for certified eco-friendly events only.'
        },
        {
          id: 'citizen-plant-tree',
          vendorId: 'citizen-ticket',
          name: 'Plant a Tree in Your Name',
          description: 'We will plant an additional tree in your name',
          pointsRequired: 150,
          rewardType: 'experience',
          value: 'Extra tree planted',
          isActive: true,
          maxRedemptions: 1000,
          currentRedemptions: 89,
          terms: 'Tree will be planted in The National Forest.'
        },
        {
          id: 'citizen-carbon-offset',
          vendorId: 'citizen-ticket',
          name: 'Carbon Offset Voucher',
          description: 'Offset 1 ton of CO2 emissions',
          pointsRequired: 250,
          rewardType: 'voucher',
          value: '1 ton CO2 offset',
          isActive: true,
          maxRedemptions: 300,
          currentRedemptions: 67,
          terms: 'Verified carbon offset through certified programs.'
        }
      ],
      specialOffers: [
        {
          id: 'citizen-backstage-pass',
          vendorId: 'citizen-ticket',
          name: 'Eco-Festival Backstage Pass',
          description: 'Behind-the-scenes access at eco-friendly festivals',
          pointsRequired: 800,
          rewardType: 'upgrade',
          value: 'Backstage access',
          isActive: true,
          maxRedemptions: 25,
          currentRedemptions: 3,
          validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          terms: 'Valid at select eco-festivals. Must be 18+.'
        }
      ]
    };

    const citizenTicket: VendorPlugin = {
      id: 'citizen-ticket',
      name: 'Citizen Ticket',
      type: 'ticketing',
      description: 'Sustainable ticketing platform that plants trees for every event.',
      logoUrl: 'https://citizenticket.com/logo.png',
      websiteUrl: 'https://citizenticket.com',
      apiEndpoint: 'https://api.citizenticket.com/v1',
      isActive: true,
      socialImpact: {
        type: 'trees',
        description: 'Plants native woodland trees to create sustainable ecosystems',
        treesPlanted: 3000,
        beneficiary: 'The National Forest Company (UK)',
        impactMetrics: {
          totalImpact: '3,000+ trees planted',
          impactPerTicket: 'Variable tree planting per event'
        }
      },
      configuration: {
        supportedFeatures: ['ticket-sales', 'tree-planting', 'sustainability-tracking', 'carbon-offset', 'eco-rewards']
      },
      rewardCatalog: citizenTicketRewards
    };

    // TickEthic Plugin with Tree-focused Rewards
    const tickEthicRewards: RewardCatalog = {
      vendorId: 'tickethic',
      vendorName: 'TickEthic',
      tiers: [
        {
          id: 'tickethic-free-green-event',
          vendorId: 'tickethic',
          name: 'Free Green Event Ticket',
          description: 'Complimentary ticket to any eco-conscious event',
          pointsRequired: 350,
          rewardType: 'free_ticket',
          value: 'Free eco-event ticket',
          isActive: true,
          maxRedemptions: 60,
          currentRedemptions: 18,
          terms: 'Automatically plants 1 additional tree.'
        },
        {
          id: 'tickethic-10-trees',
          vendorId: 'tickethic',
          name: 'Plant 10 Extra Trees',
          description: 'Plant 10 additional trees through WeForest',
          pointsRequired: 300,
          rewardType: 'experience',
          value: '10 trees planted',
          isActive: true,
          maxRedemptions: 200,
          currentRedemptions: 54,
          terms: 'Trees planted in verified reforestation projects.'
        },
        {
          id: 'tickethic-discount-eco',
          vendorId: 'tickethic',
          name: 'Eco-Event Discount',
          description: '25% off any environmentally certified event',
          pointsRequired: 180,
          rewardType: 'discount',
          value: '25% off eco-events',
          isActive: true,
          maxRedemptions: 150,
          currentRedemptions: 72,
          terms: 'Valid for events with environmental certification.'
        }
      ],
      specialOffers: [
        {
          id: 'tickethic-forest-visit',
          vendorId: 'tickethic',
          name: 'Forest Project Visit',
          description: 'Guided tour of WeForest reforestation project',
          pointsRequired: 1200,
          rewardType: 'experience',
          value: 'Forest project tour',
          isActive: true,
          maxRedemptions: 10,
          currentRedemptions: 1,
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          terms: 'Transportation not included. Must be booked 30 days in advance.'
        }
      ]
    };

    const tickEthic: VendorPlugin = {
      id: 'tickethic',
      name: 'TickEthic',
      type: 'ticketing',
      description: '10 tickets sold = 1 tree planted. Eco-responsible ticketing.',
      logoUrl: 'https://tickethic.fr/logo.png',
      websiteUrl: 'https://tickethic.fr',
      apiEndpoint: 'https://api.tickethic.fr/v1',
      isActive: true,
      socialImpact: {
        type: 'trees',
        description: 'Plants one tree for every 10 tickets sold through WeForest partnership',
        beneficiary: 'WeForest reforestation projects',
        impactMetrics: {
          totalImpact: '11,500+ trees planted',
          impactPerTicket: '1 tree per 10 tickets'
        }
      },
      configuration: {
        supportedFeatures: ['ticket-sales', 'tree-planting', 'environmental-impact', 'sustainability-reporting', 'green-rewards']
      },
      rewardCatalog: tickEthicRewards
    };

    // Ticketebo Plugin with Carbon-focused Rewards
    const ticketeboRewards: RewardCatalog = {
      vendorId: 'ticketebo',
      vendorName: 'Ticketebo',
      tiers: [
        {
          id: 'ticketebo-free-carbon-neutral',
          vendorId: 'ticketebo',
          name: 'Free Carbon Neutral Event',
          description: 'Free ticket to any carbon neutral certified event',
          pointsRequired: 450,
          rewardType: 'free_ticket',
          value: 'Free carbon neutral ticket',
          isActive: true,
          maxRedemptions: 80,
          currentRedemptions: 29,
          terms: 'Valid for carbon negative certified events.'
        },
        {
          id: 'ticketebo-mangrove-trees',
          vendorId: 'ticketebo',
          name: 'Plant 5 Mangrove Trees',
          description: 'Plant 5 mangrove trees for coastal restoration',
          pointsRequired: 200,
          rewardType: 'experience',
          value: '5 mangrove trees',
          isActive: true,
          maxRedemptions: 250,
          currentRedemptions: 91,
          terms: 'Planted in verified coastal restoration projects.'
        },
        {
          id: 'ticketebo-paperless-bonus',
          vendorId: 'ticketebo',
          name: 'Paperless Event Bonus',
          description: 'Extra points for choosing paperless tickets',
          pointsRequired: 100,
          rewardType: 'voucher',
          value: '+50 bonus points',
          isActive: true,
          maxRedemptions: 500,
          currentRedemptions: 156,
          terms: 'Applied when you choose SMS delivery over email.'
        }
      ],
      specialOffers: [
        {
          id: 'ticketebo-climate-summit',
          vendorId: 'ticketebo',
          name: 'Climate Action Summit VIP',
          description: 'VIP access to climate action conferences',
          pointsRequired: 900,
          rewardType: 'upgrade',
          value: 'Climate summit VIP',
          isActive: true,
          maxRedemptions: 15,
          currentRedemptions: 4,
          validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          terms: 'Includes networking reception and speaker meet & greet.'
        }
      ]
    };

    const ticketebo: VendorPlugin = {
      id: 'ticketebo',
      name: 'Ticketebo',
      type: 'ticketing',
      description: 'Carbon negative ticketing with Trees for Change program.',
      logoUrl: 'https://ticketebo.co.uk/logo.png',
      websiteUrl: 'https://ticketebo.co.uk',
      apiEndpoint: 'https://api.ticketebo.co.uk/v1',
      isActive: true,
      socialImpact: {
        type: 'carbon-offset',
        description: 'Carbon negative business with mangrove reforestation projects',
        beneficiary: 'Mangrove reforestation and carbon offset projects',
        impactMetrics: {
          totalImpact: 'Carbon negative since 2020',
          impactPerTicket: 'Up to 3 trees per paperless ticket'
        }
      },
      configuration: {
        supportedFeatures: ['ticket-sales', 'carbon-offset', 'tree-planting', 'paperless-incentives', 'climate-rewards']
      },
      rewardCatalog: ticketeboRewards
    };

    // Add plugins to the map
    this.plugins.set('humanitix', humanitix);
    this.plugins.set('citizen-ticket', citizenTicket);
    this.plugins.set('tickethic', tickEthic);
    this.plugins.set('ticketebo', ticketebo);
  }

  /**
   * Get all available vendor plugins
   */
  getAllPlugins(): VendorPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get active vendor plugins
   */
  getActivePlugins(): VendorPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.isActive);
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): VendorPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get reward catalog for a vendor
   */
  getRewardCatalog(vendorId: string): RewardCatalog | null {
    const plugin = this.plugins.get(vendorId);
    return plugin?.rewardCatalog || null;
  }

  /**
   * Get all available rewards across vendors
   */
  getAllAvailableRewards(): RewardTier[] {
    const allRewards: RewardTier[] = [];
    
    this.getActivePlugins().forEach(plugin => {
      if (plugin.rewardCatalog) {
        allRewards.push(...plugin.rewardCatalog.tiers);
        allRewards.push(...plugin.rewardCatalog.specialOffers);
      }
    });

    return allRewards.filter(reward => reward.isActive);
  }

  /**
   * Redeem a reward for a user
   */
  async redeemReward(
    userId: string, 
    rewardTierId: string, 
    userPoints: LoyaltyPoint[]
  ): Promise<RewardRedemption> {
    // Find the reward tier
    const allRewards = this.getAllAvailableRewards();
    const reward = allRewards.find(r => r.id === rewardTierId);
    
    if (!reward) {
      throw new Error('Reward not found');
    }

    // Check if user has enough points for this vendor
    const vendorPoints = userPoints
      .filter(p => p.vendorId === reward.vendorId)
      .reduce((total, p) => total + p.points, 0);

    if (vendorPoints < reward.pointsRequired) {
      throw new Error('Insufficient points for this reward');
    }

    // Check redemption limits
    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      throw new Error('Reward redemption limit reached');
    }

    // Check if reward is still valid
    if (reward.validUntil && new Date() > reward.validUntil) {
      throw new Error('Reward has expired');
    }

    try {
      // Call vendor API to process redemption
      const plugin = this.plugins.get(reward.vendorId);
      if (!plugin) {
        throw new Error('Vendor plugin not found');
      }

      const redemptionData = {
        userId,
        rewardTierId,
        pointsUsed: reward.pointsRequired,
        timestamp: new Date().toISOString()
      };

      let voucherCode: string | undefined;
      let instructions: string | undefined;

      // Generate voucher code for certain reward types
      if (['discount', 'voucher', 'free_ticket'].includes(reward.rewardType)) {
        voucherCode = `${reward.vendorId.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }

      // Set instructions based on reward type
      switch (reward.rewardType) {
        case 'free_ticket':
          instructions = 'Use this code when purchasing your next ticket. The discount will be applied automatically.';
          break;
        case 'discount':
          instructions = 'Enter this code at checkout to apply your discount.';
          break;
        case 'upgrade':
          instructions = 'Present this code at the venue for your upgrade. Subject to availability.';
          break;
        case 'voucher':
          instructions = 'This voucher can be redeemed according to the terms specified.';
          break;
        case 'experience':
          instructions = 'Your experience reward has been activated. You will receive further instructions via email.';
          break;
      }

      const redemption: RewardRedemption = {
        id: `redemption-${Date.now()}-${userId}`,
        userId,
        vendorId: reward.vendorId,
        rewardTierId,
        pointsUsed: reward.pointsRequired,
        rewardType: reward.rewardType,
        rewardValue: reward.value,
        rewardDetails: {
          name: reward.name,
          description: reward.description,
          instructions,
          voucherCode,
          validUntil: reward.validUntil
        },
        redeemedAt: new Date(),
        status: 'confirmed'
      };

      // Update redemption count
      reward.currentRedemptions += 1;

      // In a real implementation, you would:
      // 1. Deduct points from user's balance
      // 2. Store redemption in database
      // 3. Send confirmation email
      // 4. Notify vendor system

      console.log(`Reward redeemed successfully:`, redemption);

      return redemption;
    } catch (error) {
      console.error(`Failed to redeem reward:`, error);
      throw error;
    }
  }

  /**
   * Enable/disable a plugin
   */
  setPluginStatus(pluginId: string, isActive: boolean): boolean {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.isActive = isActive;
      return true;
    }
    return false;
  }

  /**
   * Fetch events from a vendor plugin
   */
  async fetchVendorEvents(pluginId: string): Promise<Event[]> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isActive) {
      throw new Error(`Plugin ${pluginId} not found or inactive`);
    }

    try {
      const response: AxiosResponse<PluginApiResponse<Event[]>> = await axios.get(
        `${plugin.apiEndpoint}/events`,
        {
          headers: {
            'Authorization': `Bearer ${plugin.configuration.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data) {
        // Add vendor ID and social impact to each event
        const events = response.data.data.map(event => ({
          ...event,
          vendorId: pluginId,
          socialImpact: plugin.socialImpact
        }));

        return events;
      }

      throw new Error(response.data.error || 'Failed to fetch events');
    } catch (error) {
      console.error(`Failed to fetch events from ${plugin.name}:`, error);
      
      // Return mock data for demo purposes
      return this.getMockEventsForPlugin(pluginId, plugin);
    }
  }

  /**
   * Purchase a ticket through a vendor plugin
   */
  async purchaseTicketThroughPlugin(
    pluginId: string, 
    eventId: string, 
    userId: string,
    ticketType: string = 'general'
  ): Promise<Ticket> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isActive) {
      throw new Error(`Plugin ${pluginId} not found or inactive`);
    }

    try {
      const purchaseData = {
        eventId,
        userId,
        ticketType,
        timestamp: new Date().toISOString()
      };

      const response: AxiosResponse<PluginApiResponse<Ticket>> = await axios.post(
        `${plugin.apiEndpoint}/tickets/purchase`,
        purchaseData,
        {
          headers: {
            'Authorization': `Bearer ${plugin.configuration.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data) {
        const ticket = {
          ...response.data.data,
          socialImpact: plugin.socialImpact
        };

        // Track social impact
        if (response.data.socialImpact) {
          await this.trackSocialImpact(pluginId, ticket.id, response.data.socialImpact);
        }

        return ticket;
      }

      throw new Error(response.data.error || 'Failed to purchase ticket');
    } catch (error) {
      console.error(`Failed to purchase ticket through ${plugin.name}:`, error);
      
      // Return mock ticket for demo purposes
      return this.createMockTicket(pluginId, eventId, userId, plugin);
    }
  }

  /**
   * Get social impact metrics for a plugin
   */
  async getPluginImpactMetrics(pluginId: string): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    try {
      const response: AxiosResponse<PluginApiResponse> = await axios.get(
        `${plugin.apiEndpoint}/impact/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${plugin.configuration.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data || plugin.socialImpact.impactMetrics;
    } catch (error) {
      console.error(`Failed to fetch impact metrics for ${plugin.name}:`, error);
      
      // Return plugin's default metrics
      return plugin.socialImpact.impactMetrics;
    }
  }

  /**
   * Track social impact from ticket purchases
   */
  private async trackSocialImpact(pluginId: string, ticketId: string, impactData: any): Promise<void> {
    try {
      // This would send impact data to our analytics service
      console.log(`Social impact tracked for ${pluginId}:`, {
        ticketId,
        impact: impactData
      });
      
      // In a real implementation, you'd store this in a database
      // and aggregate the impact metrics
    } catch (error) {
      console.error('Failed to track social impact:', error);
    }
  }

  /**
   * Mock events for demo purposes
   */
  private getMockEventsForPlugin(pluginId: string, plugin: VendorPlugin): Event[] {
    const baseEvents = [
      {
        id: `${pluginId}-event-1`,
        name: `Charity Concert via ${plugin.name}`,
        description: `A benefit concert supporting ${plugin.socialImpact.beneficiary}`,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        venue: 'Community Arts Center',
        organizer: plugin.name,
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        price: 35,
        maxCapacity: 500,
        ticketsSold: 120,
        isAntiScalpingEnabled: true,
        loyaltyPointsReward: 10,
        vendorId: pluginId,
        socialImpact: plugin.socialImpact
      },
      {
        id: `${pluginId}-event-2`,
        name: `Sustainable Tech Conference via ${plugin.name}`,
        description: `Technology for good conference with ${plugin.socialImpact.type} impact`,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        venue: 'Green Convention Center',
        organizer: plugin.name,
        imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop',
        price: 85,
        maxCapacity: 300,
        ticketsSold: 85,
        isAntiScalpingEnabled: true,
        loyaltyPointsReward: 25,
        vendorId: pluginId,
        socialImpact: plugin.socialImpact
      }
    ];

    return baseEvents;
  }

  /**
   * Create mock ticket for demo purposes
   */
  private createMockTicket(pluginId: string, eventId: string, userId: string, plugin: VendorPlugin): Ticket {
    return {
      id: `${pluginId}-ticket-${Date.now()}`,
      eventId,
      eventName: `Event via ${plugin.name}`,
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'Demo Venue',
      price: 50,
      ticketType: 'general',
      userId,
      qrCode: `QR-${pluginId}-${Date.now()}`,
      isUsed: false,
      metadata: {
        description: `Ticket purchased through ${plugin.name}`,
        image: 'https://example.com/ticket.png',
        attributes: [
          { trait_type: 'Vendor', value: plugin.name },
          { trait_type: 'Social Impact', value: plugin.socialImpact.type },
          { trait_type: 'Beneficiary', value: plugin.socialImpact.beneficiary }
        ]
      },
      socialImpact: plugin.socialImpact
    };
  }

  /**
   * Configure plugin API credentials
   */
  configurePlugin(pluginId: string, configuration: any): boolean {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.configuration = { ...plugin.configuration, ...configuration };
      return true;
    }
    return false;
  }

  /**
   * Get all events from all active plugins with proper fallback to mock data
   */
  async getAllEvents(): Promise<Event[]> {
    const allEvents: Event[] = [];
    const plugins = this.getActivePlugins();
    
    // Get events from each active plugin
    for (const plugin of plugins) {
      try {
        const pluginEvents = await this.fetchVendorEvents(plugin.id);
        allEvents.push(...pluginEvents);
      } catch (error) {
        console.warn(`Failed to load events from ${plugin.name}, using mock data:`, error);
        // Fallback to mock data
        const mockEvents = this.getMockEventsForPlugin(plugin.id, plugin);
        allEvents.push(...mockEvents);
      }
    }

    // Add some native platform events for demo
    const nativeEvents: Event[] = [
      {
        id: 'native-1',
        name: 'Civic Tech Meetup',
        description: 'Monthly meetup for civic technology enthusiasts',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        venue: 'Tech Hub',
        organizer: 'Civic Impact',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
        price: 0,
        maxCapacity: 100,
        ticketsSold: 25,
        isAntiScalpingEnabled: false,
        loyaltyPointsReward: 5,
        socialImpact: {
          type: 'education',
          description: 'Promoting civic engagement through technology education',
          beneficiary: 'Local community',
          impactMetrics: {
            totalImpact: 'Educational workshops for 500+ participants',
            impactPerTicket: 'Contributing to digital literacy'
          }
        }
      },
      {
        id: 'native-2',
        name: 'Green Finance Summit',
        description: 'Sustainable finance and impact investing conference',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        venue: 'Convention Center',
        organizer: 'Civic Impact',
        imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=800&h=600&fit=crop',
        price: 150,
        maxCapacity: 300,
        ticketsSold: 89,
        isAntiScalpingEnabled: true,
        loyaltyPointsReward: 50,
        socialImpact: {
          type: 'education',
          description: 'Advancing sustainable finance practices',
          beneficiary: 'Climate action initiatives',
          impactMetrics: {
            totalImpact: '$1M+ in sustainable investments facilitated',
            impactPerTicket: 'Supporting green finance education'
          }
        }
      }
    ];

    allEvents.push(...nativeEvents);

    // Sort events by date
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return allEvents;
  }

  /**
   * Get aggregated social impact across all plugins
   */
  getAggregatedSocialImpact(): any {
    const activePlugins = this.getActivePlugins();
    
    let totalTreesPlanted = 0;
    let totalMoneyDonated = 0;
    let carbonOffsetPrograms = 0;
    let totalRewardsAvailable = 0;

    activePlugins.forEach(plugin => {
      if (plugin.socialImpact.treesPlanted) {
        totalTreesPlanted += plugin.socialImpact.treesPlanted;
      }
      if (plugin.socialImpact.amountDonated) {
        totalMoneyDonated += plugin.socialImpact.amountDonated;
      }
      if (plugin.socialImpact.type === 'carbon-offset') {
        carbonOffsetPrograms++;
      }
      if (plugin.rewardCatalog) {
        totalRewardsAvailable += plugin.rewardCatalog.tiers.length + plugin.rewardCatalog.specialOffers.length;
      }
    });

    return {
      totalTreesPlanted,
      totalMoneyDonated,
      carbonOffsetPrograms,
      totalRewardsAvailable,
      activePlugins: activePlugins.length,
      impactTypes: [...new Set(activePlugins.map(p => p.socialImpact.type))]
    };
  }
}

export default new VendorPluginService(); 