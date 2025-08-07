#[allow(unused_use, duplicate_alias)]
module tadaa_lah::ticket {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::kiosk::{Self as kiosk, Kiosk, KioskOwnerCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use tadaa_lah::ticket_escrow;

    const ADMIN_ADDRESS: address = @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f;
    const EWRONG_PAYMENT_AMOUNT: u64 = 0;
    const ETICKET_ID_MISMATCH: u64 = 1;
    const ESELLER_NOT_VERIFIED: u64 = 2;

    public struct Ticket has key, store {
        id: UID,
        event_name: vector<u8>,
        event_date: vector<u8>,
        ipfs_cid: vector<u8>,
        original_issuer_verified: bool,
    }

    public struct SellerProfile has key, store {
        id: UID,
        seller_address: address,
        verified_badge: bool,
    }

    public struct Listing has key, store {
        id: UID,
        ticket_id: ID,
        seller_address: address,
        price: u64,
    }

    public fun mint_ticket(
        event_name: vector<u8>,
        event_date: vector<u8>,
        ipfs_cid: vector<u8>,
        ctx: &mut TxContext
    ): Ticket {
        Ticket {
            id: object::new(ctx),
            event_name,
            event_date,
            ipfs_cid,
            original_issuer_verified: true,
        }
    }

    public fun list_ticket(
        ticket: &Ticket,
        seller_profile: &SellerProfile,
        price: u64,
        ctx: &mut TxContext
    ): Listing {
        assert!(seller_profile.verified_badge, ESELLER_NOT_VERIFIED);
        Listing {
            id: object::new(ctx),
            ticket_id: object::id(ticket),
            seller_address: seller_profile.seller_address,
            price,
        }
    }

    public entry fun purchase_ticket(
        listing: Listing,
        ticket: Ticket,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(&payment) == listing.price, EWRONG_PAYMENT_AMOUNT);
        assert!(object::id(&ticket) == listing.ticket_id, ETICKET_ID_MISMATCH);

        let Listing {
            id: listing_id,
            ticket_id: _,
            seller_address,
            price: _
        } = listing;
        
        object::delete(listing_id);

        // Create escrow through the ticket_escrow module's create function
        ticket_escrow::create(
            seller_address,
            tx_context::sender(ctx),
            object::id(&ticket),
            payment,
            ctx
        );

        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }

    public entry fun list_ticket_in_kiosk(
        _kiosk: &mut Kiosk,
        _cap: &KioskOwnerCap,
        ticket: Ticket
    ) {
        kiosk::place(_kiosk, _cap, ticket);
    }

    public fun grant_seller_badge(
        admin: address,
        seller_address: address,
        ctx: &mut TxContext
    ): SellerProfile {
        assert!(admin == ADMIN_ADDRESS, 100);
        SellerProfile {
            id: object::new(ctx),
            seller_address,
            verified_badge: true,
        }
    }
}
