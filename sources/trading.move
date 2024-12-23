module tf_overflow::trading {
  use tf_overflow::admin::AdminCap;
  use sui::tx_context::{Self, TxContext};
  use sui::object::{Self, UID};
  use sui::transfer;
  use std::string::String;

  use sui::kiosk::{Self, KioskOwnerCap};
  use sui::package;
  use sui::transfer_policy::{Self as tp, TransferPolicy, TransferPolicyCap};
  struct PHONE has drop {}
  struct Central has key {
    id: UID,
    kiosk_cap: KioskOwnerCap,
    empty_policy: TransferPolicy<Phone>,
    policy_cap: TransferPolicyCap<Phone>
  }

  struct Phone has key, store {
    id: UID,
    tier: u8,
    model: String,
    color: String,
    url: String,
    
  }
  fun init(witness: PHONE, ctx: &mut TxContext){
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
  }

}