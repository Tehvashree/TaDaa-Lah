import { getWallets } from '@mysten/wallet-standard';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

export class SuiWallet {
    constructor() {
        this.wallet = null;
        this.account = null;
        this.connected = false;
        this.client = new SuiClient({
            url: getFullnodeUrl('testnet')
        });
    }

    async connect() {
        try {
            console.log('🔌 Connecting to Sui wallet...');
            
            const wallets = getWallets();
            const suiWallet = wallets.find(wallet => wallet.name === 'Sui Wallet');
            
            if (!suiWallet) {
                throw new Error('Sui Wallet not found. Please install Sui Wallet extension.');
            }

            this.wallet = suiWallet;

            // Request connection
            const { accounts } = await this.wallet.features['standard:connect'].connect();
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found in Sui wallet');
            }

            this.account = accounts[0];
            this.connected = true;
            
            console.log('✅ Connected to Sui wallet:', this.account.address);
            return this.account.address;

        } catch (error) {
            console.error('❌ Failed to connect to Sui wallet:', error);
            throw new Error(error.message || 'Failed to connect to Sui wallet');
        }
    }

    async getAddress() {
        if (!this.connected || !this.account) {
            await this.connect();
        }
        return this.account.address;
    }

    async signAndExecuteTransactionBlock({ transactionBlock, options }) {
        try {
            if (!this.wallet || !this.connected) {
                throw new Error('Wallet not connected');
            }

            console.log('📝 Signing transaction with Sui wallet...');

            const result = await this.wallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock({
                transactionBlock: transactionBlock,
                account: this.account,
                options: options || {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                }
            });

            console.log('✅ Transaction signed and executed:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Transaction failed:', error);
            throw new Error(error.message || 'Transaction failed');
        }
    }

    async disconnect() {
        try {
            if (this.wallet && this.wallet.features['standard:disconnect']) {
                await this.wallet.features['standard:disconnect'].disconnect();
            }
            
            this.wallet = null;
            this.account = null;
            this.connected = false;
            
            console.log('👋 Disconnected from Sui wallet');
        } catch (error) {
            console.error('❌ Error disconnecting:', error);
            throw error;
        }
    }

    isConnected() {
        return this.connected && this.account && this.wallet;
    }

    async getBalance() {
        try {
            if (!this.account) {
                throw new Error('Wallet not connected');
            }

            const balance = await this.client.getBalance({
                owner: this.account.address,
            });

            return balance;
        } catch (error) {
            console.error('❌ Error getting balance:', error);
            throw error;
        }
    }

    // Listen for account changes
    onAccountChange(callback) {
        if (this.wallet && this.wallet.features['standard:events']) {
            this.wallet.features['standard:events'].on('change', ({ accounts }) => {
                if (accounts && accounts.length > 0) {
                    this.account = accounts[0];
                    callback(this.account.address);
                } else {
                    this.account = null;
                    this.connected = false;
                    callback(null);
                }
            });
        }
    }
}

export const suiWallet = new SuiWallet();