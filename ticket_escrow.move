#[allow(unused_variable, duplicate_alias, lint(coin_field), unused_use, unused_const)]
module tadaa_lah::ticket_escrow {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};

    const ENOT_BUYER: u64 = 1;
    const ENOT_SELLER: u64 = 2;
    const EESCROW_NOT_CONFIRMED: u64 = 3;

    public struct Escrow has key, store {
        id: UID,
        seller: address,
        buyer: address,
        payment: Coin<SUI>,
        ticket_id: ID,
        status: u8 // 0 = created, 1 = confirmed, 2 = refunded
    }

    public struct EscrowAdminCap has key { 
        id: UID 
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            EscrowAdminCap { id: object::new(ctx) },
            tx_context::sender(ctx)
        );
    }

    public entry fun create(
        seller: address,
        buyer: address,
        ticket_id: ID,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let escrow = Escrow {
            id: object::new(ctx),
            seller,
            buyer,
            payment,
            ticket_id,
            status: 0
        };
        transfer::public_transfer(escrow, seller);
    }

    public entry fun confirm_and_release(
        escrow: Escrow,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == escrow.buyer, ENOT_BUYER);
        
        let Escrow {
            id,
            payment,
            seller,
            buyer: _,
            ticket_id: _,
            status: _
        } = escrow;
        
        object::delete(id);
        transfer::public_transfer(payment, seller);
    }

    public entry fun refund(
        escrow: Escrow,
        cap: EscrowAdminCap,
        ctx: &mut TxContext
    ) {
        let Escrow {
            id,
            payment,
            seller: _,
            buyer,
            ticket_id: _,
            status: _
        } = escrow;
        
        let EscrowAdminCap { id: cap_id } = cap;
        object::delete(id);
        object::delete(cap_id);
        transfer::public_transfer(payment, buyer);
    }
}