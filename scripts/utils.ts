import * as fs from "fs";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui/keypairs/secp256k1";
import { Secp256r1Keypair } from "@mysten/sui/keypairs/secp256r1";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { fromBase64 } from "@mysten/sui/utils";
import { constants } from "./constants";
import * as dotenv from "dotenv";
import { Transaction } from "@mysten/sui/transactions";
dotenv.config({ path: __dirname + '/.env' });
import path from "path";

export const client = new SuiClient({ url: "https://mysten-rpc.testnet.sui.io:443" });

// We're getting the key from ~/.sui/sui_confing/sui.keystore
const keyBase64 = process.env.ADMIN_KEY;
if (!keyBase64) {
  throw new Error("ADMIN_KEY is not set");
}
console.log("keyBase64: ", keyBase64);
const keyWithFlag = fromBase64(keyBase64);
const keyArray = Array.from(keyWithFlag);

const flag = keyArray.shift(); // remove the first byte
console.log("flag: ", flag);
const keyBuffer = Uint8Array.from(keyArray);
let keypair: Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair | undefined;
if (flag === 0) {
  keypair = Ed25519Keypair.fromSecretKey(keyBuffer);
} else if (flag === 1) {
  keypair = Secp256k1Keypair.fromSecretKey(keyBuffer);
} else if (flag === 2) {
  keypair = Secp256r1Keypair.fromSecretKey(keyBuffer);
}

if (!keypair) {
  throw new Error("Failed to initialize keypair");
}

export const address = keypair.toSuiAddress();


export const signAndExecute = async (tx: Transaction) => {
  const res = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: {
      showEffects: true,
    },
    requestType: "WaitForLocalExecution"
  });
  return res;
}

export const updateConstants = (newValues: any) => {
  const constantsFile = path.join(__dirname, "constants.ts");
  const data = fs.readFileSync(constantsFile, "utf8");
  const result = data.replace(/export const constants = {[^}]+}/, `export const constants = ${JSON.stringify(newValues, null, 2)}`);
  fs.writeFileSync(constantsFile, result, "utf8");
}