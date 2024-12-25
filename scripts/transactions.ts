import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { constants } from "./constants";

const module = "trading"
const pkg = constants.packageId

export const mintMintCap = (
  adminCap: string,
  receiver: string
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${pkg}::${module}::mint_cap`,
    arguments: [
      tx.object(adminCap),
      tx.pure.address(receiver)
    ]
  })
  return tx;
}

export const mintPhone = (centralObj: string, kiosk: string, cap: string, model: string, color: string, price: string) => {
  const tx = new Transaction();

  const pack = tx.moveCall({
    target: `${pkg}::${module}::mint`,
    arguments: [tx.object(cap), tx.pure.string(model), tx.pure.string(color)],
  });

  tx.moveCall({
    target: `${pkg}::${module}::place_and_list_to_kiosk`,
    arguments: [tx.object(cap), tx.object(centralObj), tx.object(kiosk), pack, tx.pure.u64(price)]
  });

  return tx;
}