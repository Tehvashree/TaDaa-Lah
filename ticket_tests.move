#[test_only]
module tadaa_lah::ticket_tests {
    use sui::test_scenario as ts;
    use sui::transfer;
    use sui::coin::{Self, zero};
    use tadaa_lah::ticket;
    use tadaa_lah::ticket_escrow;

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
        
        let seller = ticket::grant_seller_badge(
            @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f,
            @0x1,
            ctx
        );
        
        let listing_ticket = ticket::mint_ticket(b"Test", b"date", b"cid", ctx);
        let listing = ticket::list_ticket(&listing_ticket, &seller, 1000, ctx);
        
        transfer::public_transfer(listing, @0x1);
        transfer::public_transfer(listing_ticket, @0x1);
        transfer::public_transfer(seller, @0x1);
        
        ts::end(scenario);
    }

    #[test]
fun test_purchase_and_confirm_escrow() {
    let mut scenario = ts::begin(@0x1);
    let ctx = ts::ctx(&mut scenario);

    let ticket = ticket::mint_ticket(b"Festival", b"2025-12-31", b"QmCID", ctx);

    let seller_badge = ticket::grant_seller_badge(
        @0x8dc5596ec77296eda91193077a08a57928e6b586378bd8ed794305ee93bf142f,
        @0x1,
        ctx
    );

    let listing = ticket::list_ticket(&ticket, &seller_badge, 0, ctx); // price = 0

    let dummy_payment = zero(ctx); // dummy Coin<SUI>

    ticket::purchase_ticket(listing, ticket, dummy_payment, ctx);

    // Transfer seller_badge to satisfy ownership rules
    transfer::public_transfer(seller_badge, @0x1);

    ts::end(scenario);
}
}
