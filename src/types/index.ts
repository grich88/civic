export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  civicUserId: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: Date;
  venue: string;
  price: number;
  ticketType: string;
  userId: string;
  nftMintAddress?: string;
  qrCode: string;
  isUsed: boolean;
  metadata: {
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  socialImpact?: SocialImpact;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: string;
  organizer: string;
  imageUrl: string;
  price: number;
  maxCapacity: number;
  ticketsSold: number;
  isAntiScalpingEnabled: boolean;
  loyaltyPointsReward: number;
  socialImpact?: SocialImpact;
  vendorId?: string; // For external vendor events
}

export interface LoyaltyPoint {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  points: number;
  tokenMintAddress?: string;
  earnedFrom: string; // event or purchase reference
  earnedAt: Date;
  expiresAt?: Date;
}

export interface RewardTier {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'free_ticket' | 'discount' | 'merchandise' | 'upgrade' | 'voucher' | 'experience';
  value: string; // e.g., "100% off", "$20 discount", "VIP upgrade"
  imageUrl?: string;
  isActive: boolean;
  maxRedemptions?: number;
  currentRedemptions: number;
  validUntil?: Date;
  terms?: string;
}

export interface RewardCatalog {
  vendorId: string;
  vendorName: string;
  tiers: RewardTier[];
  specialOffers: RewardTier[];
}

export interface SocialImpact {
  type: 'charity' | 'trees' | 'carbon-offset' | 'education' | 'healthcare';
  description: string;
  amountDonated?: number;
  treesPlanted?: number;
  carbonOffset?: number;
  beneficiary: string;
  impactMetrics: {
    totalImpact: string;
    impactPerTicket: string;
  };
}

export interface VendorPlugin {
  id: string;
  name: string;
  type: 'ticketing' | 'loyalty' | 'both';
  description: string;
  logoUrl: string;
  websiteUrl: string;
  apiEndpoint: string;
  isActive: boolean;
  socialImpact: SocialImpact;
  configuration: {
    apiKey?: string;
    webhookUrl?: string;
    supportedFeatures: string[];
  };
  rewardCatalog?: RewardCatalog;
}

// Supported external vendor types
export interface HumanitixIntegration {
  eventId: string;
  organizationId: string;
  donationPercentage: number;
  charityBeneficiary: string;
}

export interface CitizenTicketIntegration {
  eventId: string;
  treesPerTicket: number;
  forestProject: string;
}

export interface TickEthicIntegration {
  eventId: string;
  treesPerTenTickets: number;
  partnerOrganization: 'WeForest' | 'Ecotree';
}

export interface TicketeboIntegration {
  eventId: string;
  carbonNeutralCertification: boolean;
  treesForChangeProgram: boolean;
}

export interface WalletData {
  address: string;
  balance: number;
  tokens: Array<{
    mint: string;
    amount: number;
    decimals: number;
    symbol: string;
  }>;
  nfts: Array<{
    mint: string;
    name: string;
    image: string;
    metadata: any;
  }>;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  vendorId: string;
  rewardTierId: string;
  pointsUsed: number;
  rewardType: string;
  rewardValue: string;
  rewardDetails: {
    name: string;
    description: string;
    instructions?: string;
    voucherCode?: string;
    validUntil?: Date;
  };
  redeemedAt: Date;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'used' | 'expired';
}

export interface UserLoyaltyProfile {
  userId: string;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentBalance: LoyaltyPoint[];
  redemptionHistory: RewardRedemption[];
  favoriteVendors: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AntiScalpingVerification {
  userId: string;
  eventId: string;
  isVerified: boolean;
  verificationType: 'email' | 'phone' | 'government-id' | 'civic-pass';
  verificationData: any;
  verifiedAt: Date;
}

export interface PluginApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  socialImpact?: {
    message: string;
    metrics: any;
  };
}

export interface EventMetrics {
  totalTicketsSold: number;
  totalRevenue: number;
  totalSocialImpact: {
    moneyDonated: number;
    treesPlanted: number;
    carbonOffset: number;
  };
  loyaltyPointsDistributed: number;
  uniqueAttendees: number;
} 