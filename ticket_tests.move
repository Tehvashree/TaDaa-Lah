#[test_only]
module tadaa_lah::ticket_tests {
    use sui::test_scenario as ts;
    use tadaa_lah::ticket;

    #[test]
    fun test_mint_and_transfer() {
        let mut scenario = ts::begin(@0x1);
        let ctx = ts::ctx(&mut scenario);
        
        let ticket = ticket::mint_ticket(
            b"Concert",
            b"2023-12-31", 
            b"QmXYZ123", 
            ctx
        );
        transfer::public_transfer(ticket, @0x1);
        ts::end(scenario);
    }

    #[test]
    fun test_grant_and_transfer_badge() {
        let mut scenario = ts::begin(@0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f);
        let ctx = ts::ctx(&mut scenario);
        
        let badge = ticket::grant_seller_badge(
            @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f,
            @0x1,
            ctx
        );
        transfer::public_transfer(badge, @0x1);
        ts::end(scenario);
    }

    #[test]
    fun test_list_ticket() {
        let mut scenario = ts::begin(@0x1);
        let ctx = ts::ctx(&mut scenario);
        
        // Create seller (don't transfer yet)
        let seller = ticket::grant_seller_badge(
            @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f,
            @0x1,
            ctx
        );
        
        // Create and list ticket
        let listing_ticket = ticket::mint_ticket(b"Test", b"date", b"cid", ctx);
        let listing = ticket::list_ticket(&listing_ticket, &seller, 1000, ctx);
        
        // Transfer all objects
        transfer::public_transfer(listing, @0x1);
        transfer::public_transfer(listing_ticket, @0x1);
        transfer::public_transfer(seller, @0x1);
        
        ts::end(scenario);
    }
}
