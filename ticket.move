module tadaa_lah::ticket {
    // Cleaned imports (only what's actually needed)
    use sui::balance;
    use sui::sui::SUI;
    use sui::kiosk::{Self as KioskFramework, Kiosk, KioskOwnerCap};

    const ADMIN_ADDRESS: address = @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f;

    /// Ticket NFT for events
    public struct Ticket has key, store {
        id: UID,
        event_name: vector<u8>,
        event_date: vector<u8>,
        ipfs_cid: vector<u8>,
        original_issuer_verified: bool,
    }

    /// SellerProfile defines verified sellers
    public struct SellerProfile has key, store {
        id: UID,
        seller_address: address,
        verified_badge: bool,
    }

    /// Listing metadata for resale
    public struct Listing has key, store {
        id: UID,
        ticket_id: ID,
        seller_address: address,
        price: u64,
    }

    /// Mint a new ticket
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

    /// List a ticket for sale
    public fun list_ticket(
        ticket: &Ticket,
        seller_profile: &SellerProfile,
        price: u64,
        ctx: &mut TxContext
    ): Listing {
        assert!(seller_profile.verified_badge, 0);
        Listing {
            id: object::new(ctx),
            ticket_id: object::id(ticket),
            seller_address: seller_profile.seller_address,
            price,
        }
    }

    /// List ticket in a kiosk
    public fun list_ticket_in_kiosk(
        kiosk: &mut Kiosk,
        cap: &KioskOwnerCap,
        ticket: Ticket
    ) {
        KioskFramework::place(kiosk, cap, ticket);
    }

    /// Grant seller badge (admin only)
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
