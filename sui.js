import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import QRCode from 'qrcode';

// *** TESTNET CONFIGURATION ***
const NETWORK = 'testnet'; // Change to 'mainnet' for production
const client = new SuiClient({
  url: getFullnodeUrl(NETWORK)
});

// *** UPDATE THESE WITH YOUR DEPLOYED TESTNET CONTRACT INFO ***
const PACKAGE_ID = '0xd0fbe18753601de0ad3de8afc237fce5ae12ecadc3dbd1f2757afe0ef3ad14e7';
const ADMIN_ADDRESS = '0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f';
const ESCROW_ADMIN_CAP_ID = '0xdd4091063dfd4d9336fbcda97a22f1230a61d80d867c38b46152810476e1d1d7';

const OBJECT_TYPES = {
    TICKET: `${PACKAGE_ID}::ticket::Ticket`,
    SELLER_PROFILE: `${PACKAGE_ID}::ticket::SellerProfile`,
    LISTING: `${PACKAGE_ID}::ticket::Listing`,
    ESCROW: `${PACKAGE_ID}::ticket_escrow::Escrow`,
    ESCROW_ADMIN_CAP: `${PACKAGE_ID}::ticket_escrow::EscrowAdminCap`
};

// *** TESTNET HELPER FUNCTIONS ***

// Check if we're running on testnet
export const isTestnet = () => NETWORK === 'testnet';

// Get faucet info for testing
export const getTestnetInfo = () => {
  if (!isTestnet()) return null;
  
  return {
    network: 'Sui Testnet',
    faucets: [
      'https://stakely.io/faucet/sui-testnet-sui',
      'https://faucet.triangleplatform.com/sui/testnet',
      'Discord: #testnet-faucet channel'
    ],
    explorer: 'https://suiexplorer.com/?network=testnet',
    rpcUrl: getFullnodeUrl('testnet')
  };
};

// Check wallet balance (useful for testing)
export const checkWalletBalance = async (walletProvider) => {
  try {
    const address = await walletProvider.getAddress();
    const balance = await client.getBalance({ owner: address });
    
    console.log('💰 [TESTNET] Wallet Balance Check:');
    console.log(`Address: ${address}`);
    console.log(`Balance: ${balance.totalBalance} MIST (${convertMistToSui(balance.totalBalance)} SUI)`);
    
    if (isTestnet() && parseInt(balance.totalBalance) < 100000000) { // Less than 0.1 SUI
      console.warn('⚠️ Low testnet balance! Get more tokens from faucet.');
      const info = getTestnetInfo();
      console.log('Faucets available:', info.faucets);
    }
    
    return balance;
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    throw error;
  }
};

// Testing version of transaction execution with better error handling
export const executeTestTransaction = async (txb, walletProvider, description = 'Transaction') => {
  try {
    console.log(`🧪 [${NETWORK.toUpperCase()}] Executing: ${description}`);
    
    // Check balance first on testnet
    if (isTestnet()) {
      await checkWalletBalance(walletProvider);
    }
    
    const response = await walletProvider.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    
    console.log(`✅ [${NETWORK.toUpperCase()}] ${description} successful:`, response);
    
    // Show explorer link
    const explorerUrl = isTestnet() 
      ? `https://suiexplorer.com/?network=testnet/txblock/${response.digest}`
      : `https://suiexplorer.com/txblock/${response.digest}`;
    console.log(`🔍 View transaction: ${explorerUrl}`);
    
    return response;
  } catch (error) {
    console.error(`❌ [${NETWORK.toUpperCase()}] ${description} failed:`, error);
    
    if (error.message?.includes('Insufficient gas') && isTestnet()) {
      console.log('💡 Get more testnet SUI from faucets:');
      getTestnetInfo()?.faucets.forEach(faucet => console.log(`  • ${faucet}`));
    }
    
    throw error;
  }
};

// Enhanced error handling for testnet
const handleSuiError = (error, operation) => {
    console.error(`❌ [${NETWORK.toUpperCase()}] ${operation} failed:`, error);
    
    if (error.message?.includes('Insufficient gas')) {
        const message = isTestnet() 
            ? 'Insufficient testnet SUI for gas fees. Get more from faucet!' 
            : 'Insufficient SUI balance for gas fees';
        throw new Error(message);
    }
    if (error.message?.includes('Object not found')) {
        throw new Error('The requested item no longer exists');
    }
    if (error.message?.includes('Invalid signature')) {
        throw new Error('Transaction signature failed. Please try again');
    }
    if (error.message?.includes('ESELLER_NOT_VERIFIED')) {
        throw new Error('Seller is not verified. Please get verified first');
    }
    if (error.message?.includes('EWRONG_PAYMENT_AMOUNT')) {
        throw new Error('Payment amount does not match the ticket price');
    }
    if (error.message?.includes('ETICKET_ID_MISMATCH')) {
        throw new Error('Ticket ID does not match the listing');
    }
    if (error.message?.includes('ENOT_BUYER')) {
        throw new Error('Only the buyer can confirm this escrow');
    }
    
    throw new Error(error.message || `${operation} failed`);
};

// *** CORE BLOCKCHAIN FUNCTIONS ***

//Minting & Listing Tickets
export const mintTicket = async (eventName, eventDate, ipfsCid, walletProvider) => {
    if (!eventName?.trim() || !eventDate?.trim() || !ipfsCid?.trim()) {
        throw new Error('All ticket details are required');
    }
    
    try {
        console.log(`🎫 [${NETWORK.toUpperCase()}] Minting Ticket:`, { eventName, eventDate, ipfsCid });
        const txb = new TransactionBlock();

        const ticket = txb.moveCall({
            target: `${PACKAGE_ID}::ticket::mint_ticket`,
            arguments: [
                txb.pure(eventName),
                txb.pure(eventDate),
                txb.pure(ipfsCid),
            ],
        });

        txb.transferObjects([ticket], txb.pure(await walletProvider.getAddress()));

        const response = await executeTestTransaction(txb, walletProvider, 'Mint Ticket');
        return response;
    } catch (error) {
        handleSuiError(error, 'Ticket minting');
    }
};

export const listTicket = async (ticketObjectId, sellerProfileId, price, walletProvider) => {
    if (!ticketObjectId || !sellerProfileId || !price || price <= 0) {
        throw new Error('Valid ticket ID, seller profile, and price are required');
    }
    
    try {
        console.log(`📋 [${NETWORK.toUpperCase()}] Creating listing:`, { ticketObjectId, sellerProfileId, price });
        const txb = new TransactionBlock();

        const listing = txb.moveCall({
            target: `${PACKAGE_ID}::ticket::list_ticket`,
            arguments: [
                txb.object(ticketObjectId),
                txb.object(sellerProfileId),
                txb.pure(price),
            ],
        });

        txb.transferObjects([listing], txb.pure(await walletProvider.getAddress()));

        const response = await executeTestTransaction(txb, walletProvider, 'List Ticket');
        return response;
    } catch (error) {
        handleSuiError(error, 'Ticket listing');
    }
};

//Seller verification
export const grantSellerBadge = async (sellerAddress, walletProvider) => {
    if (!sellerAddress) {
        throw new Error('Seller address is required');
    }
    
    try {
        console.log(`🏅 [${NETWORK.toUpperCase()}] Granting seller badge to:`, sellerAddress);

        const txb = new TransactionBlock();

        const sellerProfile = txb.moveCall({
            target: `${PACKAGE_ID}::ticket::grant_seller_badge`,
            arguments: [
                txb.pure(ADMIN_ADDRESS),
                txb.pure(sellerAddress)
            ],
        });

        txb.transferObjects([sellerProfile], txb.pure(sellerAddress));

        const response = await executeTestTransaction(txb, walletProvider, 'Grant Seller Badge');
        return response;
    } catch (error) {
        handleSuiError(error, 'Seller badge granting');
    }
};

//Purchase ticket
export const purchaseTicket = async (listingId, ticketId, paymentAmount, walletProvider) => {
    if (!listingId || !ticketId || !paymentAmount || paymentAmount <= 0) {
        throw new Error('Valid listing ID, ticket ID, and payment amount are required');
    }
    
    try {
        console.log(`💰 [${NETWORK.toUpperCase()}] Purchasing ticket:`, { listingId, ticketId, paymentAmount });

        const txb = new TransactionBlock();

        // Split coins for exact payment
        const [coin] = txb.splitCoins(txb.gas, [txb.pure(paymentAmount)]);

        // Call the purchase function
        txb.moveCall({
            target: `${PACKAGE_ID}::ticket::purchase_ticket`,
            arguments: [
                txb.object(listingId),
                txb.object(ticketId),
                coin
            ],
        });

        const response = await executeTestTransaction(txb, walletProvider, 'Purchase Ticket');
        return response;
    } catch (error) {
        handleSuiError(error, 'Ticket purchase');
    }
};

//escrow confirmation
export const confirmEscrow = async (escrowId, walletProvider) => {
    if (!escrowId) {
        throw new Error('Escrow ID is required');
    }
    
    try {
        console.log(`✅ [${NETWORK.toUpperCase()}] Confirming escrow:`, escrowId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::ticket_escrow::confirm_and_release`,
            arguments: [
                txb.object(escrowId)
            ],
        });

        const response = await executeTestTransaction(txb, walletProvider, 'Confirm Escrow');
        return response;
    } catch (error) {
        handleSuiError(error, 'Escrow confirmation');
    }
};

//admin function to refund escrow
export const refundEscrow = async (escrowId, adminWalletProvider) => {
    if (!escrowId) {
        throw new Error('Escrow ID is required');
    }
    
    try {
        console.log(`🔄 [${NETWORK.toUpperCase()}] Refunding escrow:`, escrowId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::ticket_escrow::refund`,
            arguments: [
                txb.object(escrowId),
                txb.object(ESCROW_ADMIN_CAP_ID)
            ],
        });

        const response = await executeTestTransaction(txb, adminWalletProvider, 'Refund Escrow');
        return response;
    } catch (error) {
        handleSuiError(error, 'Escrow refund');
    }
};

// *** QR CODE FUNCTIONS ***

export const generateTicketQRCode = async (ticketId, additionalData = {}) => {
    try {
        const qrData = {
            ticketId,
            platform: 'TadaaLah',
            network: NETWORK, // Include network info
            timestamp: Date.now(),
            packageId: PACKAGE_ID,
            ...additionalData
        };
        
        const qrString = JSON.stringify(qrData);
        const qrCodeDataURL = await QRCode.toDataURL(qrString, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        });
        
        console.log(`✅ [${NETWORK.toUpperCase()}] QR Code generated for ticket:`, ticketId);
        return {
            dataURL: qrCodeDataURL,
            rawData: qrString,
            ticketId,
            network: NETWORK
        };
    } catch (error) {
        console.error('❌ QR Code generation failed:', error);
        throw new Error('Failed to generate QR code');
    }
};

export const validateQRCode = async (qrData) => {
    try {
        let parsedData;
        
        // Try to parse as JSON first
        try {
            parsedData = JSON.parse(qrData);
        } catch {
            // If not JSON, treat as plain ticket ID
            parsedData = { ticketId: qrData };
        }
        
        if (!parsedData.ticketId) {
            throw new Error('Invalid QR code: No ticket ID found');
        }

        // Validate network compatibility
        if (parsedData.network && parsedData.network !== NETWORK) {
            throw new Error(`QR code is for ${parsedData.network} but app is connected to ${NETWORK}`);
        }

        // Validate package ID if present
        if (parsedData.packageId && parsedData.packageId !== PACKAGE_ID) {
            throw new Error('Invalid QR code: Wrong platform or outdated ticket');
        }
        
        // Validate ticket exists and get its details
        const ticketData = await fetchTicketById(parsedData.ticketId);
        
        if (!ticketData) {
            throw new Error('Ticket not found or invalid');
        }
        
        const validation = {
            valid: true,
            ticket: ticketData,
            scannedAt: new Date().toISOString(),
            platform: parsedData.platform || 'Unknown',
            network: NETWORK,
            originalTimestamp: parsedData.originalTimestamp || parsedData.timestamp,
            isOriginalIssuer: ticketData.original_issuer_verified
        };
        
        console.log(`✅ [${NETWORK.toUpperCase()}] QR Code validation successful:`, validation);
        return validation;
        
    } catch (error) {
        console.error(`❌ [${NETWORK.toUpperCase()}] QR Code validation failed:`, error);
        return {
            valid: false,
            error: error.message,
            scannedAt: new Date().toISOString(),
            network: NETWORK
        };
    }
};

// *** DATA FETCHING FUNCTIONS ***

export const fetchUserSellerProfile = async (userAddress) => {
    if (!userAddress) {
        throw new Error('User address is required');
    }
    
    try {
        console.log(`👤 [${NETWORK.toUpperCase()}] Fetching seller profile for:`, userAddress);

        const response = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: OBJECT_TYPES.SELLER_PROFILE
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        if (response.data.length > 0) {
            const profileData = response.data[0].data.content.fields;
            return {
                id: response.data[0].data.objectId,
                seller_address: profileData.seller_address, 
                verified_badge: profileData.verified_badge,
            };
        }

        return null; // No seller profile found
    } catch (error) {
        console.error('❌ Error fetching seller profile:', error);
        throw new Error('Failed to fetch seller profile');
    }
};

export const fetchActiveListings = async () => {
    try {
        console.log(`🛒 [${NETWORK.toUpperCase()}] Fetching all active listings...`);

        const response = await client.queryObjects({
            query: {
                StructType: OBJECT_TYPES.LISTING
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        const listings = response.data.map(obj => ({
            id: obj.data.objectId,
            ticket_id: obj.data.content.fields.ticket_id,
            seller_address: obj.data.content.fields.seller_address,
            price: obj.data.content.fields.price,
        }));

        // Fetch the actual ticket details
        const enrichedListings = await Promise.all(listings.map(async (listing) => {
            try {
                const ticketData = await fetchTicketById(listing.ticket_id);
                return {
                    ...listing,
                    ticket: ticketData
                };
            } catch (error) {
                console.warn(`Failed to fetch ticket ${listing.ticket_id}:`, error);
                return {
                    ...listing,
                    ticket: null
                };
            }
        }));

        // Filter out listings with failed ticket fetches
        const validListings = enrichedListings.filter(listing => listing.ticket !== null);
        
        console.log(`✅ [${NETWORK.toUpperCase()}] Found`, validListings.length, 'valid listings');
        return validListings;
    } catch (error) {
        console.error('❌ Error fetching listings:', error);
        throw new Error('Failed to fetch marketplace listings');
    }
};

export const fetchTicketById = async (ticketId) => {
    if (!ticketId) {
        throw new Error('Ticket ID is required');
    }
    
    try {
        console.log(`🎫 [${NETWORK.toUpperCase()}] Fetching ticket:`, ticketId);

        const response = await client.getObject({
            id: ticketId,
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        if (response.data && response.data.content) {
            const fields = response.data.content.fields;
            return {
                id: response.data.objectId,
                event_name: new TextDecoder().decode(new Uint8Array(fields.event_name)),
                event_date: new TextDecoder().decode(new Uint8Array(fields.event_date)),
                ipfs_cid: new TextDecoder().decode(new Uint8Array(fields.ipfs_cid)),
                original_issuer_verified: fields.original_issuer_verified,
                owner: response.data.owner?.AddressOwner || null
            };
        }

        return null; // Ticket not found
    } catch (error) {
        console.error('❌ Error fetching ticket:', error);
        throw new Error('Failed to fetch ticket details');
    }
};

export const fetchUserPurchases = async (userAddress) => {
    if (!userAddress) {
        throw new Error('User address is required');
    }
    
    try {
        console.log(`🛒 [${NETWORK.toUpperCase()}] Fetching purchases for user:`, userAddress);

        // Get user's tickets
        const ticketsResponse = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: OBJECT_TYPES.TICKET
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        // Get all escrows to find ones where user is the buyer
        const escrowsResponse = await client.queryObjects({
            query: {
                StructType: OBJECT_TYPES.ESCROW
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        // Filter escrows for this buyer
        const userEscrows = escrowsResponse.data.filter(obj => 
            obj.data.content.fields.buyer === userAddress
        );

        const purchases = ticketsResponse.data.map(obj => {
            const fields = obj.data.content.fields;
            
            // Find corresponding escrow
            const escrow = userEscrows.find(escrowObj => 
                escrowObj.data.content.fields.ticket_id === obj.data.objectId
            );

            return {
                id: obj.data.objectId,
                event_name: new TextDecoder().decode(new Uint8Array(fields.event_name)),
                event_date: new TextDecoder().decode(new Uint8Array(fields.event_date)),
                ipfs_cid: new TextDecoder().decode(new Uint8Array(fields.ipfs_cid)),
                original_issuer_verified: fields.original_issuer_verified,
                escrow: escrow ? {
                    id: escrow.data.objectId,
                    status: escrow.data.content.fields.status,
                    seller: escrow.data.content.fields.seller,
                    amount: escrow.data.content.fields.payment.fields?.balance || 0
                } : null
            };
        });

        console.log(`✅ [${NETWORK.toUpperCase()}] Found`, purchases.length, 'purchases');
        return purchases;
    } catch (error) {
        console.error('❌ Error fetching user purchases:', error);
        throw new Error('Failed to fetch user purchases');
    }
};

export const fetchUserListings = async (userAddress) => {
    if (!userAddress) {
        throw new Error('User address is required');
    }
    
    try {
        console.log(`📋 [${NETWORK.toUpperCase()}] Fetching listings for user:`, userAddress);

        const response = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: OBJECT_TYPES.LISTING
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        const listings = response.data.map(obj => ({
            id: obj.data.objectId,
            ...obj.data.content.fields 
        }));

        // Enrich with ticket data
        const enrichedListings = await Promise.all(listings.map(async (listing) => {
            try {
                const ticketData = await fetchTicketById(listing.ticket_id);
                return {
                    ...listing,
                    ticket: ticketData
                };
            } catch (error) {
                console.warn(`Failed to fetch ticket ${listing.ticket_id}:`, error);
                return {
                    ...listing,
                    ticket: null
                };
            }
        }));

        return enrichedListings.filter(listing => listing.ticket !== null);
    } catch (error) {
        console.error('❌ Error fetching user listings:', error);
        throw new Error('Failed to fetch user listings');
    }
};

export const fetchEscrowById = async (escrowId) => {
    if (!escrowId) {
        throw new Error('Escrow ID is required');
    }
    
    try {
        console.log(`💰 [${NETWORK.toUpperCase()}] Fetching escrow:`, escrowId);

        const response = await client.getObject({
            id: escrowId,
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        if (response.data && response.data.content) {
            const fields = response.data.content.fields;
            return {
                id: response.data.objectId,
                seller: fields.seller,
                buyer: fields.buyer,
                ticket_id: fields.ticket_id,
                status: fields.status,
                amount: fields.payment.fields?.balance || 0
            };
        }

        return null;
    } catch (error) {
        console.error('❌ Error fetching escrow:', error);
        throw new Error('Failed to fetch escrow details');
    }
};

// *** UTILITY FUNCTIONS ***

export const convertSuiToMist = (suiAmount) => {
    const amount = parseFloat(suiAmount);
    if (isNaN(amount) || amount < 0) {
        throw new Error('Invalid SUI amount');
    }
    return Math.floor(amount * 1000000000);
};

export const convertMistToSui = (mistAmount) => {
    const amount = parseInt(mistAmount);
    if (isNaN(amount) || amount < 0) {
        throw new Error('Invalid MIST amount');
    }
    return (amount / 1000000000).toFixed(4);
};

export const extractObjectIdFromResponse = (response, objectType) => {
    if (!response?.effects?.created) {
        console.error('No created objects in response:', response);
        throw new Error('No created objects found in transaction response');
    }

    const createdObjects = response.effects.created;

    if (!objectType) {
        return createdObjects[0]?.reference?.objectId;
    }

    const targetObject = createdObjects.find(obj => 
        obj.objectType && obj.objectType.includes(objectType)
    );

    if (targetObject) {
        return targetObject.reference?.objectId;
    }

    console.warn(`Could not find ${objectType} in created objects, using first available`);
    return createdObjects[0]?.reference?.objectId;
};

// *** MOCK FUNCTIONS FOR TESTING ***

//IPFS upload simulation
export const uploadToIPFS = async (file) => {
    if (!file) {
        throw new Error('No file provided for IPFS upload');
    }

    console.log(`📁 [${NETWORK.toUpperCase()}] Uploading file to IPFS:`, file.name);

    // Simulate IPFS upload with a delay
    await new Promise(resolve => setTimeout(resolve, isTestnet() ? 1500 : 3000));

    const fakeCid = `Qm${NETWORK}${Date.now()}${Math.random().toString(36).substr(2,9)}`;
    console.log(`✅ [${NETWORK.toUpperCase()}] IPFS upload complete, CID:`, fakeCid);
    return fakeCid;
};

//demo Oracle verification
export const verifyTicketWithOracle = async (ticketFile, confirmationNumber) => {
    console.log(`🔍 [${NETWORK.toUpperCase()}] Verifying ticket with Oracle API...`);
    console.log('📄 File:', ticketFile?.name);
    console.log('🔢 Confirmation Number:', confirmationNumber);

    // Faster verification on testnet for development
    await new Promise(resolve => setTimeout(resolve, isTestnet() ? 2000 : 4000));
    
    // Higher success rate on testnet for easier testing
    const successRate = isTestnet() ? 0.95 : 0.85;
    const verified = Math.random() < successRate;

    console.log(`✅ [${NETWORK.toUpperCase()}] Oracle verification result:`, verified);
    return verified;
};

// *** TESTING UTILITIES ***

// Quick setup check for developers
export const runTestnetSetup = async () => {
    if (!isTestnet()) {
        console.log('⚠️ Not on testnet - skipping setup check');
        return;
    }
    
    console.log('🧪 TESTNET SETUP CHECK');
    console.log('====================');
    
    const info = getTestnetInfo();
    console.log('Network:', info.network);
    console.log('RPC URL:', info.rpcUrl);
    console.log('Explorer:', info.explorer);
    console.log('Package ID:', PACKAGE_ID);
    console.log('Admin Address:', ADMIN_ADDRESS);
    
    console.log('\n📋 TODO for testing:');
    console.log('1. Install Sui Wallet browser extension');
    console.log('2. Switch wallet to testnet');
    console.log('3. Get testnet SUI from faucets:');
    info.faucets.forEach(faucet => console.log(`   • ${faucet}`));
    console.log('4. Deploy your Move contracts to testnet');
    console.log('5. Update PACKAGE_ID, ADMIN_ADDRESS, ESCROW_ADMIN_CAP_ID above');
};

// Export everything
export { 
    PACKAGE_ID, 
    ADMIN_ADDRESS,
    ESCROW_ADMIN_CAP_ID,
    OBJECT_TYPES, 
    NETWORK, 
    client
};
