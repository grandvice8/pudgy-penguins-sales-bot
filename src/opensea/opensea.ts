import { Network, OpenSeaPort } from "opensea-js";
import Web3 from "web3";

import { constants } from "../utilities/constants";

const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io");
const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main,
});

export function getSales() {
  return new Promise(async (resolve, reject) => {
    await seaport.api
      .get("/events", {
        asset_contract_address: constants.OPEN_SEA.ASSET_ID,
        event_type: "successful",
        only_opensea: "false",
        offset: "0",
        // occurred_after: "",
      })
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
}
