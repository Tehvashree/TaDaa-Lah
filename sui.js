import { SuiClient,getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import QRCode from 'qrcode';

const client = new SuiClient({
  url: getFullnodeUrl('testnet')
});

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

const handleSuiError = (error, operation) => {
    console.error(`❌ ${operation} failed:`, error);
    
    if (error.message?.includes('Insufficient gas')) {
        throw new Error('Insufficient SUI balance for gas fees');
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

//Minting &Listing Tickets
export const mintTicket = async (eventName, eventDate, ipfsCid, walletProvider) => {
    if (!eventName?.trim() || !eventDate?.trim() || !ipfsCid?.trim()) {
        throw new Error('All ticket details are required');
    }
    
    try {
        console.log('Minting Ticket for:', { eventName, eventDate, ipfsCid });
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

        const response = await walletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log('✅ Ticket minted successfully:', response);
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
        console.log('Creating listing for ticket:', { ticketObjectId, sellerProfileId, price });
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

        const response = await walletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });
        
        console.log('✅ List response:', response);
        return response;
    } catch (error) {
        handleSuiError(error, 'Ticket listing');
    }
};

//Seller verification

//Creates SellerProfile object
export const grantSellerBadge = async (sellerAddress, walletProvider) => {
    if (!sellerAddress) {
        throw new Error('Seller address is required');
    }
    
    try {
        console.log('🏅 Granting seller badge to:', sellerAddress);

        const txb = new TransactionBlock();

        const sellerProfile = txb.moveCall({
            target: `${PACKAGE_ID}::ticket::grant_seller_badge`,
            arguments: [
                txb.pure(ADMIN_ADDRESS),
                txb.pure(sellerAddress)
            ],
        });

        txb.transferObjects([sellerProfile], txb.pure(sellerAddress));

        const response = await walletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log('✅ Badge grant response:', response);
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
        console.log('💰 Purchasing ticket:', { listingId, ticketId, paymentAmount });

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

        const response = await walletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log('✅ Purchase response:', response);
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
        console.log('✅ Confirming escrow:', escrowId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::ticket_escrow::confirm_and_release`,
            arguments: [
                txb.object(escrowId)
            ],
        });

        const response = await walletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log('✅ Escrow confirmed:', response);
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
        console.log('🔄 Refunding escrow:', escrowId);

        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${PACKAGE_ID}::ticket_escrow::refund`,
            arguments: [
                txb.object(escrowId),
                txb.object(ESCROW_ADMIN_CAP_ID)
            ],
        });

        const response = await adminWalletProvider.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log('✅ Escrow refunded:', response);
        return response;
    } catch (error) {
        handleSuiError(error, 'Escrow refund');
    }
};

// QR Code Generation Functions
export const generateTicketQRCode = async (ticketId, additionalData = {}) => {
    try {
        const qrData = {
            ticketId,
            platform: 'TadaaLah',
            timestamp: Date.now(),
            packageId: PACKAGE_ID, // Include package ID for validation
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
        
        console.log('✅ QR Code generated for ticket:', ticketId);
        return {
            dataURL: qrCodeDataURL,
            rawData: qrString,
            ticketId
        };
    } catch (error) {
        console.error('❌ QR Code generation failed:', error);
        throw new Error('Failed to generate QR code');
    }
};

//QR Code Validation Function
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

        // Validate package ID if present
        if (parsedData.packageId && parsedData.packageId !== PACKAGE_ID) {
            throw new Error('Invalid QR code: Wrong platform or outdated ticket');
        }
        
        // Validate ticket exists and get its details
        const ticketData = await fetchTicketById(parsedData.ticketId);
        
        if (!ticketData) {
            throw new Error('Ticket not found or invalid');
        }
        
        // Check if this ticket is still owned by someone (not burned/consumed)
        const validation = {
            valid: true,
            ticket: ticketData,
            scannedAt: new Date().toISOString(),
            platform: parsedData.platform || 'Unknown',
            originalTimestamp: parsedData.originalTimestamp || parsedData.timestamp,
            isOriginalIssuer: ticketData.original_issuer_verified
        };
        
        console.log('✅ QR Code validation successful:', validation);
        return validation;
        
    } catch (error) {
        console.error('❌ QR Code validation failed:', error);
        return {
            valid: false,
            error: error.message,
            scannedAt: new Date().toISOString()
        };
    }
};

//Data Fetching Functions
export const fetchUserSellerProfile = async (userAddress) => {
    if (!userAddress) {
        throw new Error('User address is required');
    }
    
    try {
        console.log('👤 Fetching seller profile for:', userAddress);

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
        console.log('🛒 Fetching all active listings...');

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
        
        console.log('✅ Found', validListings.length, 'valid listings');
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
        console.log('🎫 Fetching ticket:', ticketId);

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
                owner: response.data.owner?.AddressOwner || null // Get current owner
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
        console.log('🛒 Fetching purchases for user:', userAddress);

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

        console.log('✅ Found', purchases.length, 'purchases');
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
        console.log('📋 Fetching listings for user:', userAddress);

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

// Get escrow details
export const fetchEscrowById = async (escrowId) => {
    if (!escrowId) {
        throw new Error('Escrow ID is required');
    }
    
    try {
        console.log('💰 Fetching escrow:', escrowId);

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

//Utility Functions
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

//IPFS upload simulation
export const uploadToIPFS = async (file) => {
    if (!file) {
        throw new Error('No file provided for IPFS upload');
    }

    console.log('📁 Uploading file to IPFS:', file.name);

    // Simulate IPFS upload with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fakeCid = `QmSimulated${Date.now()}${Math.random().toString(36).substr(2,9)}`;
    console.log('✅ IPFS upload complete, CID:', fakeCid);
    return fakeCid;
};

//demo Oracle verification
export const verifyTicketWithOracle = async (ticketFile, confirmationNumber) => {
    console.log('🔍 Verifying ticket with Ticketmaster API...');
    console.log('📄 File:', ticketFile?.name);
    console.log('🔢 Confirmation Number:', confirmationNumber);

    await new Promise(resolve => setTimeout(resolve, 3000));
    const verified = Math.random() > 0.1; // 90% success rate for demo

    console.log('✅ Oracle verification result:', verified);
    return verified;
};

export { PACKAGE_ID, OBJECT_TYPES, ESCROW_ADMIN_CAP_ID };


