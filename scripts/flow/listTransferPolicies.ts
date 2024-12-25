import { client, address } from "../utils";

async function listTransferPolicies() {
  try {
    // Get owned objects (transfer policy caps)
    const ownedPolicyCaps = await client.getOwnedObjects({
      owner: address,
      options: {
        showContent: true
      }
    });

    // Get shared objects (transfer policies)
    // const sharedPolicies = await client.getOwnedObjects({
    //   owner: "0x2",
    //   options: {
    //     showContent: true
    //   }
    // });
    for (const obj of ownedPolicyCaps.data) {
      console.log(obj.data)
    }
    // console.log("Transfer Policy Caps:", ownedPolicyCaps.data);
    // console.log("Shared Transfer Policies:", sharedPolicies.data);
  } catch (error) {
    console.error("Error fetching transfer policies:", error);
  }
}

listTransferPolicies().catch(console.error); 