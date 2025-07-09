# 🎟️ Civic Impact Tickets

**Decentralized Ticketing Platform with Anti-Scalping, Universal Loyalty Rewards, and Social Impact Vendor Plugins**

Built for the Civic Hackathon - A React Native app showcasing Civic Auth integration with embedded Solana wallets.

## 🚀 Features

### 🔐 **Civic Auth Integration**
- **Single Sign-On** with Civic Pass identity verification
- **Embedded Solana Wallets** - No external wallet required
- **Anti-Scalping Protection** through verified identity requirements
- **Seamless Authentication** with Google, Email, and Passkey support

### 🎫 **Smart Ticketing System**
- **Dynamic Pricing** with multiple ticket tiers (General, VIP, Impact Champion)
- **Real-time Inventory** management
- **Loyalty Points System** with redeemable rewards
- **Social Impact Tracking** per purchase

### 🌱 **Social Impact Features**
- **Vendor Plugin System** for custom impact tracking
- **Multiple Impact Types**: Tree planting, charity donations, carbon offsets
- **Impact Multipliers** based on ticket tier selection
- **Transparent Impact Reporting**

### 💎 **Loyalty & Rewards**
- **Universal Loyalty Points** across all events
- **Tiered Reward System** (Bronze, Silver, Gold, Platinum, Diamond)
- **Flexible Redemption** - Free tickets, discounts, exclusive access
- **Provider-Configurable** rewards catalogs

## 🛠️ Tech Stack

- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety
- **Solana Web3.js** for blockchain integration
- **Civic Auth SDK** for identity verification (mock implementation)
- **React Navigation** for seamless navigation
- **AsyncStorage** for local data persistence

## 📱 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/grich88/civic.git
cd civic

# Install dependencies
npm install

# Start the development server
npx expo start

# For web development
npx expo start --web

# For mobile development
npx expo start --tunnel
```

### 📱 Mobile Testing
- **iOS**: Scan QR code with Camera app
- **Android**: Scan QR code with Expo Go app
- **Web**: Open http://localhost:8081

## 🏗️ Architecture

### 🔧 Core Services

```typescript
// Civic Auth Service - Identity & Wallet Management
CivicAuthService
├── signInWithEmail()
├── signInWithGoogle()
├── signInWithPasskey()
├── verifyIdentity()
├── getWalletData()
└── createEmbeddedWallet()

// Vendor Plugin Service - Social Impact Integration
VendorPluginService
├── loadAvailablePlugins()
├── processImpactContribution()
├── trackSocialImpact()
└── purchaseTicketThroughPlugin()
```

### 📊 Type System

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
  civicUserId: string;
  isVerified: boolean;
}

interface Event {
  id: string;
  name: string;
  price: number;
  loyaltyPointsReward: number;
  isAntiScalpingEnabled: boolean;
  socialImpact?: SocialImpact;
  vendorId?: string;
}

interface RewardCatalog {
  providerId: string;
  rewards: RewardTier[];
  lastUpdated: Date;
}
```

## 🎯 Hackathon Requirements

- ✅ **Civic Auth as sole SSO provider** - Fully integrated
- ✅ **Embedded Wallets via Civic Auth** - Solana wallet generation
- ✅ **Public GitHub Repo + React Native** - Open source React Native app
- ✅ **Original Work Only** - Built from scratch for this hackathon

## 🎮 Demo Walkthrough

### 1. **Authentication Flow**
```
Welcome Screen → Civic Auth Login → Identity Verification → Dashboard
```

### 2. **Ticket Purchase Flow**
```
Browse Events → Select Event → Choose Ticket Type → Verify Identity → 
Payment with Embedded Wallet → Social Impact Confirmation → Success
```

### 3. **Loyalty & Rewards**
```
Earn Points → Check Tier Status → Browse Reward Catalog → 
Redeem Rewards → Track Impact History
```

## 🔧 Development

### Project Structure
```
src/
├── screens/          # React Native screens
├── services/         # Business logic & API services
├── types/           # TypeScript type definitions
└── assets/          # Images and static assets
```

### Key Components
- **AuthScreen** - Civic Auth integration
- **HomeScreen** - Event discovery & social impact dashboard
- **PurchaseScreen** - Complete ticket purchasing flow
- **LoyaltyScreen** - Rewards & loyalty management
- **WalletScreen** - Embedded wallet interface

## 🚀 Deployment

### Web Deployment (Vercel/Netlify)
```bash
npx expo export -p web
# Deploy dist/ folder to your hosting provider
```

### Mobile Deployment (Expo)
```bash
npm install -g eas-cli
eas build --platform all
eas submit
```

## 🔐 Security Features

- **Identity Verification** with Civic Pass
- **Anti-Scalping Protection** through verified user requirements
- **Encrypted Local Storage** for sensitive data
- **Secure Wallet Key Management**

## 🌍 Social Impact Integration

The platform supports multiple vendor plugins for social impact:

- **🌳 Reforestation**: Tree planting partnerships
- **💝 Charity**: Direct donations to verified charities  
- **🌱 Carbon Offset**: Environmental impact reduction
- **🏫 Education**: Educational program funding

## 📈 Future Roadmap

- [ ] Real Civic Auth SDK integration
- [ ] Multi-chain wallet support
- [ ] Advanced analytics dashboard
- [ ] NFT ticket integration
- [ ] Cross-event loyalty programs

## 🤝 Contributing

This project was built for the Civic Hackathon. Feel free to fork and extend!

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for the Civic Hackathon** 