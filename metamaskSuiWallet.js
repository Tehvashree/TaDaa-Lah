await window.ethereum.request({
  method: 'wallet_requestSnaps',
  params: {
    'npm:@mysten/sui-snap': {}
  }
});


export class MetamaskSuiWallet {
    constructor() {
        this.snapId = 'npm:@mysten/sui-snap';
        this.connected = false;
        this.address = null;
    }

    async connect() {
        try {
            await window.ethereum.request({
                method: 'wallet_requestSnaps',
                params: {
                    [this.snapId]: {},
                }
            });

            const accounts = await window.ethereum.request({
                method: 'wallet_invokeSnap',
                params: {
                    snapId: this.snapId,
                    request: {
                        method: 'getAccounts'
                    }
                }
            });

            this.address = accounts[0];
            this.connected = true;
            console.log('✅ Connected to MetaMask Sui Snap:', this.address);
            return this.address;

        } catch (error) {
            console.error('❌ Failed to connect to MetaMask Sui:', error);
            throw error;
        }
    }

    async getAddress() {
        if (!this.connected) {
            await this.connect();
        }
        return this.address;
    }

    async signAndExecuteTransaction({ transactionBlock, options }) {
        try {
            console.log('📝 Signing transaction with Metamask Sui Snap...');

            const result = await window.ethereum.request({
                method: 'wallet_invokeSnap',
                params: {
                    snapId: this.snapId,
                    request: {
                        method: 'sui_signAndExecuteTransactionBlock',
                        params: {
                            transactionBlock: transactionBlock.serialize(),
                            options: options || {
                                showEffects: true,
                                showEvents: true,
                                showObjectChanges: true,
                            }
                        }
                    }
                }
            });

            console.log('✅ Transaction signed and executed:', result);
            return result;
        } catch (error) {
            console.error('❌ Transaction failed:', error);
            throw error;
        }
    }

    async disconnect() {
        this.connected = false;
        this.address = null;
        console.log('👋 Disconnected from Metamask Sui');
    }

    isConnected() {
        return this.connected && this.address;
    }
}

export const metamaskSuiWallet=new MetamaskSuiWallet();