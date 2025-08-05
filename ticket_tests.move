module tadaa_lah::ticket_tests {
    use std::assert;
    use std::signer;
    use tadaa_lah::ticket;
    use tadaa_lah::ticket_issuer;

    #[test]
    public fun test_mint_ticket() {
        let user = @0x1;
        let event_id = 123;
        let ticket_id = ticket::mint_ticket(&user, event_id);
        assert!(ticket_id > 0, 100); // Ticket ID should be positive
    }

    #[test]
    public fun test_list_ticket() {
        let user = @0x1;
        let event_id = 456;
        let ticket_id = ticket::mint_ticket(&user, event_id);
        ticket::list_ticket(&user, ticket_id);

        let listed = ticket::is_ticket_listed(ticket_id);
        assert!(listed, 101); // Should be listed
    }

    #[test]
    public fun test_list_ticket_in_kiosk() {
        let user = @0x1;
        let event_id = 789;
        let kiosk_id = 42;
        let ticket_id = ticket::mint_ticket(&user, event_id);
        ticket::list_ticket_in_kiosk(&user, ticket_id, kiosk_id);

        let in_kiosk = ticket::is_ticket_in_kiosk(ticket_id, kiosk_id);
        assert!(in_kiosk, 102); // Should appear in kiosk
    }

    #[test]
    public fun test_grant_seller_badge() {
        let admin = @0xA;
        let seller = @0x1;
        ticket_issuer::grant_seller_badge(&admin, seller);

        let badge_ok = ticket_issuer::has_seller_badge(seller);
        assert!(badge_ok, 103); // Seller should now have badge
    }
}