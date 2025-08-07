import { SuiClient,getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const client = new SuiClient({
  url: getFullnodeUrl('testnet')
});

const PACKAGE_ID = '0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f';
const ADMIN_ADDRESS = '0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f';

//Minting &Listing Tickets
export const mintTicket = async (eventName, eventDate, ipfsCid, walletProvider) => {
    console.log('Minting Ticket for:', { eventName, eventDate, ipfsCid });
    const txb = new TransactionBlock();

    // Create the TicketIssuer object
    const ticket = txb.moveCall({
        target: `${PACKAGE_ID}::ticket::mint_ticket`,
        arguments: [
            txb.pure(eventName),
            txb.pure(eventDate),
            txb.pure(ipfsCid),
        ],
    });

    // Transfer ticket to user
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
};

export const listTicket = async (ticketObjectId,sellerProfileId,price,walletProvider) => {
    console.log('Creating listing for ticket:', {ticketObjectId, sellerProfileId, price});
    const txb = new TransactionBlock();

    const listing = txb.moveCall({
        target: `${PACKAGE_ID}::ticket::list_ticket`,
        arguments: [
            txb.object(ticketObjectId),
            txb.object(sellerProfileId),
            txb.pure(price),
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
    console.log('✅ List response:', response);
    return response;
};



//Seller verification

//Creates SellerProfile object
export const grantSellerBadge = async (sellerAddress, walletProvider) => {
    console.log('🏅 Granting seller badge to:', sellerAddress);

    const txb = new TransactionBlock();

    //Creates and transfers the SellerProfile object to the seller
    const sellerProfile = txb.moveCall({
        target: `${PACKAGE_ID}::ticket::grant_seller_badge`,
        arguments: [
            txb.pure(ADMIN_ADDRESS),
            txb.pure(sellerAddress)
        ],
    });

    const response= await walletProvider.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
        },
    });

    console.log('✅ Badge grant response:', response);
    return response;
};

//Purchase ticket
export const purchaseTicket = async (listingId, ticketId, paymentAmount, walletProvider) => {
    console.log('💰 Purchasing ticket:', {listingId,ticketId,paymentAmount});

    const txb = new TransactionBlock();

    //split coins for exact payment
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
};

//Data Fetching Functions
export const fetchUserSellerProfile = async (userAddress) => {
    console.log('👤 Fetching seller profile for:', userAddress);

    try{
        const response = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: `${PACKAGE_ID}::ticket::SellerProfile`
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        if (response.data.length > 0) {
            const profileData = response.data[0].data.content.fields;
            return {
                id:response.data[0].data.objectId,
                seller_address: profileData.seller_address, 
                verified_badge: profileData.verified_badge,
            };
        }

        return null; // No seller profile found
    } catch (error) {
        console.error('❌ Error fetching seller profile:', error);
        return null;
    }
};

export const fetchActiveListings = async () => {
    console.log('🛒 Fetching all active listings...');

    try {
        const response = await client.queryObjects({
            query: {
                StructType: `${PACKAGE_ID}::ticket::Listing`
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

        //fetch the actual ticket details
        const enrichedListings = await Promise.all(listings.map(async (listing) => {
            const ticketData = await fetchTicketById(listing.ticket_id);
            return {
                ...listing,
                ticket: ticketData
            };
        }));

        console.log('✅ Found', enrichedListings.length, 'listings');
        return enrichedListings;
    } catch (error) {
        console.error('❌ Error fetching listings:', error);
        return [];
    }
};

export const fetchTicketById = async (ticketId) => {
    console.log('🎫 Fetching ticket:', ticketId);

    try {
        const response = await client.getObject({
            id: ticketId,
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        if (response.data) {
            const fields = response.data.content.fields;
            return {
                id: response.data.objectId,
                event_name: new TextDecoder().decode(new Uint8Array(fields.event_name)),
                event_date: new TextDecoder().decode(new Uint8Array(fields.event_date)),
                ipfs_cid: new TextDecoder().decode(new Uint8Array(fields.ipfs_cid)),
                original_issuer_verified: fields.original_issuer_verified
            };
        }

        return null; // Ticket not found
    } catch (error) {
        console.error('❌ Error fetching ticket:', error);
        return null;
    }
};

export const fetchUserTickets = async (userAddress) => {
    console.log('🎫 Fetching tickets for user:', userAddress);

    try {
        const response = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: `${PACKAGE_ID}::ticket::Ticket`
            },
            options: {
                showContent: true,
                showDisplay: true,
            }
        });

        return response.data.map(obj => {
            const fields = obj.data.content.fields;
            return {
                id: obj.data.objectId,
                event_name: new TextDecoder().decode(new Uint8Array(fields.event_name)),
                event_date: new TextDecoder().decode(new Uint8Array(fields.event_date)),
                ipfs_cid: new TextDecoder().decode(new Uint8Array(fields.ipfs_cid)),
                original_issuer_verified: fields.original_issuer_verified
            };
        });
    } catch (error) {
        console.error('❌ Error fetching user tickets:', error);
        return [];
    }
};

export const fetchUserListings = async (userAddress) => {
    console.log('📋 Fetching listings for user:', userAddress);

    try {
        const response = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
                StructType: `${PACKAGE_ID}::ticket::Listing`
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

        //enrich with ticket data
        const enrichedListings = await Promise.all(listings.map(async (listing) => {
            const ticketData = await fetchTicketById(listing.ticket_id);
            return {
                ...listing,
                ticket: ticketData
            };
        }));

        return enrichedListings;
    } catch (error) {
        console.error('❌ Error fetching user listings:', error);
        return [];
    }
};

//Utility Functions
export const convertSuiToMist = (suiAmount) => {
    return Math.floor(parseFloat(suiAmount) * 1000000000);
};

export const convertMistToSui = (mistAmount) => {
    return (parseInt(mistAmount) / 1000000000).toFixed(4);
};

export const extractObjectIdFromResponse = (response, objectType) => {
    if (!response?.effects?.created) {
        console.error('No created objects in response:', response);
        throw new Error('No created objects found in transaction response');
    }

    const createdObjects = response.effects.created;

    if(!objectType) {
        return createdObjects[0]?.reference?.objectId;
    }

    const targetObject = createdObjects.find(obj => obj.objectType && obj.objectType.includes(objectType));

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
    console.log('📄 File:',ticketFile?.name);
    console.log('🔢 Confirmation Number:', confirmationNumber);

    // Simulate an API call to an external verification service
    await new Promise(resolve => setTimeout(resolve, 3000));

    const verified=true;

    console.log('✅ Oracle verification result:', verified);
    return verified;
};




