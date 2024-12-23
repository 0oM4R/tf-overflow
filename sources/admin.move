module tf_overflow::admin {
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::{Self, TxContext};

  struct AdminCap has key, store{
  id: UID
}
fun init(ctx: &mut TxContext){
  let cap: AdminCap = AdminCap {
    id: object::new(ctx)
  };
  transfer::public_transfer(cap, tx_context::sender(ctx));
}
// a burn function just in case we need to delete the cap
public fun burn(cap: AdminCap){
  let AdminCap {id} = cap;
  object::delete(id);
} 
}