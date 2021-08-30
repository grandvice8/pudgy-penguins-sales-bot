import moment from "moment";
import * as dotenv from "dotenv";
dotenv.config();

import { getSales } from "./opensea/opensea";
import { postTweet } from "./twitter-bot/twitter";
import { Penguin } from "./models/penguin";

let fromTime = moment().unix();

async function main() {
  try {
    await getSales(fromTime).then((completedSales: any) => {
      completedSales.reverse().forEach(async (sale: Penguin, i: number) => {
        const newMoment = moment.utc(sale.timestamp).unix();
        console.log(sale);
        await postTweet(sale).catch(() => console.log("Error tweeting"));
        if (i === completedSales.length - 1) {
          fromTime = newMoment + 1;
        }
      });
    });
  } catch (e) {
    console.log(`Failed to load penguins`);
  }
}

setInterval(main, 10000);
