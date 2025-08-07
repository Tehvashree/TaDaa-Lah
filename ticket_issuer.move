module tadaa_lah::ticket_issuer {
    public struct TicketIssuer has key {
        id: UID,
        issuer_address: address,
        verified: bool,
    }

    public fun is_verified_issuer(issuer: &TicketIssuer): bool {
        issuer.verified
    }
}
