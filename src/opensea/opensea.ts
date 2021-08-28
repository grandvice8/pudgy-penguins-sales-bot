import { EventType, Network, OpenSeaPort } from "opensea-js";
import Web3 from "web3";

import { Penguin } from "../models/penguin";
import { constants } from "../utilities/constants";

const provider = new Web3.providers.HttpProvider("https://mainnet.infura.io");
const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main,
});

export function getSales(fromTime: number) {
  return new Promise(async (resolve, reject) => {
    let completedSales: Penguin[] = [];
    await seaport.api
      .get("/events", {
        asset_contract_address: constants.OPEN_SEA.ASSET_ID,
        event_type: "successful",
        only_opensea: "false",
        offset: "0",
        occurred_after: fromTime,
      })
      .then((response) => {
        response.asset_events.forEach((penguin: any) => {
          completedSales.push({
            id: penguin.asset.token_id,
            fromAddress: penguin.seller.address,
            price: {
              price:
                parseFloat(penguin.total_price) /
                Math.pow(10, penguin.payment_token.decimals),
              token: penguin.payment_token.symbol,
              usdPrice: +penguin.payment_token.usd_price,
            },
            timestamp: penguin.transaction.timestamp,
            toAddresss: penguin.winner_account.address,
            url: penguin.asset.permalink,
          });
        });
        resolve(completedSales);
      })
      .catch((error) => reject(error));
  });
}
