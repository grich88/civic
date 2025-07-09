import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WalletData } from '../types';

// Mock Civic Auth for testing purposes
interface MockCivicUser {
  userId: string;
  email: string;
  name: string;
  isVerified: boolean;
}

class CivicAuthService {
  private connection: Connection;
  private currentUser: User | null = null;
  private walletKeypair: Keypair | null = null;

  constructor() {
    // Connect to Solana devnet for testing
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  }

  /**
   * Initialize the Civic Auth service
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Mock Civic Auth Service...');
      
      // Try to restore user session
      const storedUser = await AsyncStorage.getItem('civic_user');
      const storedWallet = await AsyncStorage.getItem('civic_wallet');
      
      if (storedUser && storedWallet) {
        this.currentUser = JSON.parse(storedUser);
        // Note: In production, you'd securely restore the wallet keypair
        console.log('Restored user session:', this.currentUser?.email);
      }
    } catch (error) {
      console.error('Failed to initialize Civic Auth:', error);
    }
  }

  /**
   * Sign in user with mock Civic Auth
   */
  async signInWithEmail(email: string): Promise<User> {
    try {
      console.log(`Signing in with email: ${email}`);
      
      // Mock Civic Auth response
      const mockCivicUser: MockCivicUser = {
        userId: `civic-${Date.now()}`,
        email,
        name: email.split('@')[0],
        isVerified: true
      };

      // Generate a new Solana wallet for the user
      const wallet = await this.createEmbeddedWallet();
      
      const user: User = {
        id: mockCivicUser.userId,
        email: mockCivicUser.email,
        name: mockCivicUser.name,
        walletAddress: wallet.publicKey.toString(),
        civicUserId: mockCivicUser.userId,
        isVerified: mockCivicUser.isVerified,
        createdAt: new Date()
      };

      this.currentUser = user;
      
      // Store user session
      await AsyncStorage.setItem('civic_user', JSON.stringify(user));
      await AsyncStorage.setItem('civic_wallet', JSON.stringify({
        publicKey: wallet.publicKey.toString(),
        // Note: In production, encrypt the private key
        secretKey: Array.from(wallet.secretKey)
      }));

      console.log('User signed in successfully:', user.email);
      return user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Failed to sign in with Civic Auth');
    }
  }

  /**
   * Sign in with Google (mock)
   */
  async signInWithGoogle(): Promise<User> {
    // Mock Google user
    return this.signInWithEmail('testuser@gmail.com');
  }

  /**
   * Sign in with passkey (mock)
   */
  async signInWithPasskey(): Promise<User> {
    // Mock passkey user
    return this.signInWithEmail('passkey@example.com');
  }

  /**
   * Create an embedded Solana wallet
   */
  private async createEmbeddedWallet(): Promise<Keypair> {
    try {
      const wallet = Keypair.generate();
      this.walletKeypair = wallet;
      
      console.log('Created embedded wallet:', wallet.publicKey.toString());
      
      // In a real implementation, you might request some SOL for testing
      // await this.requestAirdrop(wallet.publicKey);
      
      return wallet;
    } catch (error) {
      console.error('Failed to create embedded wallet:', error);
      throw error;
    }
  }

  /**
   * Request SOL airdrop for testing (devnet only)
   */
  async requestAirdrop(publicKey: PublicKey, amount: number = 1): Promise<string> {
    try {
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * 1000000000 // Convert SOL to lamports
      );
      
      await this.connection.confirmTransaction(signature);
      console.log(`Airdropped ${amount} SOL to ${publicKey.toString()}`);
      
      return signature;
    } catch (error) {
      console.error('Airdrop failed:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      this.currentUser = null;
      this.walletKeypair = null;
      
      await AsyncStorage.removeItem('civic_user');
      await AsyncStorage.removeItem('civic_wallet');
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  /**
   * Get wallet data
   */
  async getWalletData(): Promise<WalletData | null> {
    try {
      if (!this.walletKeypair) {
        return null;
      }

      const publicKey = this.walletKeypair.publicKey;
      const balance = await this.connection.getBalance(publicKey);
      
      // Mock token and NFT data
      const walletData: WalletData = {
        address: publicKey.toString(),
        balance: balance / 1000000000, // Convert lamports to SOL
        tokens: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            amount: balance,
            decimals: 9,
            symbol: 'SOL'
          }
        ],
        nfts: []
      };

      return walletData;
    } catch (error) {
      console.error('Failed to get wallet data:', error);
      return null;
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      if (!this.walletKeypair) {
        throw new Error('No wallet available for signing');
      }

      transaction.sign(this.walletKeypair);
      console.log('Transaction signed successfully');
      
      return transaction;
    } catch (error) {
      console.error('Transaction signing failed:', error);
      throw error;
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(transaction: Transaction): Promise<string> {
    try {
      if (!this.walletKeypair) {
        throw new Error('No wallet available');
      }

      // Sign the transaction
      transaction.sign(this.walletKeypair);
      
      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize()
      );
      
      // Confirm the transaction
      await this.connection.confirmTransaction(signature);
      
      console.log('Transaction sent:', signature);
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Verify user identity for anti-scalping
   */
  async verifyIdentity(): Promise<boolean> {
    try {
      // Mock identity verification
      if (!this.currentUser) {
        return false;
      }

      // In production, this would use Civic Pass
      const isVerified = this.currentUser.isVerified;
      console.log(`Identity verification: ${isVerified ? 'PASSED' : 'FAILED'}`);
      
      return isVerified;
    } catch (error) {
      console.error('Identity verification failed:', error);
      return false;
    }
  }

  /**
   * Get Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get wallet public key
   */
  getWalletPublicKey(): PublicKey | null {
    return this.walletKeypair?.publicKey || null;
  }
}

export default new CivicAuthService(); 