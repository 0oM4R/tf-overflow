import { SuiClient } from "@mysten/sui/client";
import { constants } from "./constants";
import { address } from "./utils";

async function main() {
  const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
  // const packages = await getOwnedPackages(client, address);
  // console.log("packages: ", packages[0].data?.content);
  const modules = await listModules(client, "0x2");
  if (modules) console.log("modules: ", Object.keys(modules));
}
async function getOwnedPackages(client: SuiClient, address: string) {
  const objects = await client.getOwnedObjects({
    owner: address,
    filter: { StructType: "0x2::package::Publisher" },
    options: { showContent: true }
  });

  console.log("Packages owned by", address);
  objects.data.forEach(obj => {
    if (obj.data?.content?.dataType === "moveObject") {
      const module = obj.data.content.fields as { module_name: string };
      console.log("- Module:", module.module_name);
    }
  });

  return objects.data;
}
async function listModules(client: SuiClient, packageId: string) {
  try {
    const modules = await client.getNormalizedMoveModulesByPackage({
      package: packageId,
    });

    console.log(`\nModules in package ${packageId}:`);
    Object.keys(modules).forEach(moduleName => {
      console.log(`- ${moduleName}`);
    });

    return modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    return null;
  }
}


main();