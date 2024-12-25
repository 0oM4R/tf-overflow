import { signAndExecute, address, updateConstants } from "../utils";
import { constants } from "../constants";
import {
  TransferPolicyTransaction,
  percentageToBasisPoints,
} from "@mysten/kiosk";
import { Transaction } from "@mysten/sui/transactions";
import { kioskClient } from "../helpers";

// Admin call only once after publish. Could be added in publishPakcage.ts script.

// We create a transfer policy with 3% royalty, no minimum royalty.
const createTransferPolicy = async () => {
  const tx = new Transaction();
  const tpTx = new TransferPolicyTransaction({
    kioskClient,
    transaction: tx,
  });
  await tpTx.create({
    type: `${constants.packageId}::trading::Phone`,
    publisher: constants.publisher,
  })
  tpTx
    .addLockRule()
    .addFloorPriceRule(1000n)
    .addRoyaltyRule(percentageToBasisPoints(10), 100)
    .addPersonalKioskRule()
    .shareAndTransferCap(address);

  const response = await signAndExecute(tx);
  const created = response?.effects?.created;
  let policyId = "";
  let capId = "";
  created?.forEach((c: any) => {
    if (c.owner.Shared)
      policyId = c.reference.objectId;
    if (c.owner.AddressOwner)
      capId = c.reference.objectId;
  });
  constants.transferPolicy = policyId;
  constants.transferPolicyCap = capId;
  updateConstants(constants);
};

createTransferPolicy().catch(console.error);

