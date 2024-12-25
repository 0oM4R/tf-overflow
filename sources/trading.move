module tf_overflow::trading {
  use tf_overflow::admin::AdminCap;
  use sui::tx_context::{Self, TxContext};
  use sui::object::{Self, UID};
  use sui::transfer;
  use std::string::String;
  use std::vector;

  use sui::kiosk::{Self, KioskOwnerCap, Kiosk};
  use sui::package;
  use sui::transfer_policy::{Self as tp, TransferPolicy, TransferPolicyCap};
  use sui::coin;
  use sui::sui::SUI;
  struct TRADING has drop {}
  struct Central has key {
    id: UID,
    kiosk_cap: KioskOwnerCap,
    empty_policy: TransferPolicy<Phone>,
    policy_cap: TransferPolicyCap<Phone>
  }

  struct Phone has key, store {
    id: UID,
    model: String,
    color: String,
    
  }

  struct Present has key {
    id: UID,
    phones: vector<Phone>,
  }

  struct MintCap has key {
        id: UID,
    }
  fun init (witness: TRADING, ctx: &mut TxContext){
    let publisher = package::claim(witness, ctx);
    // create new kiosk
    let (kiosk, kiosk_cap) = kiosk::new(ctx);
    let (policy, policy_cap) = tp::new<Phone>(&publisher, ctx);
    let central = Central {
      id: object::new(ctx),
      kiosk_cap,
      empty_policy: policy,
      policy_cap: policy_cap,
    };
    transfer::public_transfer(publisher, tx_context::sender(ctx));
    transfer::share_object(central);
    transfer::public_share_object(kiosk);
    
  }

  // Admin functions
  public fun mint_cap(_: &AdminCap, recipient: address, ctx: &mut TxContext) {
    let cap = MintCap{
      id: object::new(ctx),
    };
    transfer::transfer(cap, recipient);
  }
  public fun delete_mint_cap(self: MintCap) {
    let MintCap {id} = self;
    object::delete(id);
}
  public fun mint(_: &MintCap, model: String, color: String, ctx: &mut TxContext) :Phone {
    Phone {
      id: object::new(ctx),
      model,
      color,
    }
  }
  public fun place_and_list_to_kiosk(
   _: &MintCap ,
   central: &mut Central,
    kiosk: &mut Kiosk,
    phone: Phone,
    price: u64,
    _ctx: &mut TxContext,
    ) {
    kiosk::place_and_list<Phone>(kiosk, &central.kiosk_cap,phone, price);
    }
    public fun airdrop(
      _: &MintCap,
      phones: vector<Phone>,
      address: address,
      ctx: &mut TxContext,
    ) {
      let present = Present {
        id: object::new(ctx),
        phones,
      };
      transfer::transfer(present, address);
    }
  public fun unwrap(
    present: Present,
    kiosk: &mut Kiosk,
    kiosk_cap: &mut KioskOwnerCap,
    policy: &mut TransferPolicy<Phone>)
    {
      let Present {id, phones} = present;
      object::delete(id);
      while(!vector::is_empty(&phones)) {
       let phone = vector::pop_back(&mut phones);
       kiosk::lock(kiosk, kiosk_cap,  policy, phone);
      };
      vector::destroy_empty<Phone>(phones);
    }
  public fun open_phone_from_kiosk(
    central: &mut Central,
    kiosk: &mut Kiosk,
    kiosk_cap: &mut KioskOwnerCap,
    phone_id: sui::object::ID,
    ctx: &mut TxContext,
  ){
    let purchase_cap = kiosk::list_with_purchase_cap<Phone>(
      kiosk,
      kiosk_cap,
      phone_id,
      0,
      ctx,
    );
    let (phone, transfer_req) = kiosk::purchase_with_cap<Phone>(
      kiosk, purchase_cap, coin::zero<SUI>(ctx)
    );
    tp::confirm_request<Phone>(&central.empty_policy ,transfer_req);
    let Phone {id, model:_, color: _} = phone;
    object::delete(id);
  }

public fun purchase_phone(
    central: &Central,
    kiosk: &mut Kiosk,
    phone_id: sui::object::ID,
    payment: coin::Coin<SUI>,
    ctx: &mut TxContext
) {
    let (phone, transfer_request) = kiosk::purchase<Phone>(
        kiosk,
        phone_id,
        payment
    );
    tp::confirm_request(&central.empty_policy, transfer_request);
    transfer::public_transfer(phone, tx_context::sender(ctx));

}
}

