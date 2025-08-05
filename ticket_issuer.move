module tadaa_lah::ticket_issuer {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    // This resource gates minting rights
    struct TicketIssuer has key {
        id: UID,
        issuer_address: address,
        verified: bool,
    }

    public fun init_issuer(
        issuer_address: address,
        ctx: &mut TxContext
    ): TicketIssuer {
        TicketIssuer {
            id: object::new(ctx),
            issuer_address,
            verified: true, // You could later make this dynamic
        }
    }

    public fun is_verified_issuer(
        issuer: &TicketIssuer
    ): bool {
        issuer.verified
    }
}