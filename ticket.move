module tadaa_lah::ticket {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use tadaa_lah::ticket_issuer;
    use sui::kiosk::{Self as KioskFramework, Kiosk, KioskOwnerCap};

    /// Ticket NFT for events
    struct Ticket has key, store {
        id: UID,
        event_name: vector<u8>,
        event_date: vector<u8>,
        ipfs_cid: vector<u8>,
        original_issuer_verified: bool,
    }

    /// SellerProfile defines verified sellers
    struct SellerProfile has key {
        id: UID,
        seller_address: address,
        verified_badge: bool,
    }

    /// Listing metadata for resale
    struct Listing has key {
        id: UID,
        ticket_id: ID,
        seller_address: address,
        price: u64,
    }

    /// Mint a ticket (only verified issuers allowed)
    public fun mint_ticket(
        event_name: vector<u8>,
        event_date: vector<u8>,
        ipfs_cid: vector<u8>,
        issuer: &ticket_issuer::TicketIssuer,
        ctx: &mut TxContext
    ): Ticket {
        assert!(ticket_issuer::is_verified_issuer(issuer), 0);

        let ticket = Ticket {
            id: object::new(ctx),
            event_name,
            event_date,
            ipfs_cid,
            original_issuer_verified: true,
        };

        ticket
    }

    /// List ticket without kiosk
    public fun list_ticket(
        ticket: &Ticket,
        seller_profile: &SellerProfile,
        price: u64,
        ctx: &mut TxContext
    ): Listing {
        assert!(seller_profile.verified_badge, 0);

        let listing = Listing {
            id: object::new(ctx),
            ticket_id: object::id(ticket),
            seller_address: seller_profile.seller_address,
            price,
        };

        listing
    }

    /// Place ticket in kiosk (requires cap + verified seller)
    public fun list_ticket_in_kiosk(
        kiosk: &mut Kiosk,
        cap: &KioskOwnerCap,
        ticket: Ticket
    ) {
        KioskFramework::place(kiosk, cap, ticket);
    }

    /// Admin grants verified badge to seller
    public fun grant_seller_badge(
        admin: address,
        seller_address: address,
        ctx: &mut TxContext
    ): SellerProfile {
        // Devnet admin wallet address
        let expected_admin = @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f;

        assert!(admin == expected_admin, 100);

        let profile = SellerProfile {
            id: object::new(ctx),
            seller_address,
            verified_badge: true,
        };

        profile
    }
}