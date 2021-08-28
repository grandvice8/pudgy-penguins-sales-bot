import moment from "moment";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { getSales } from "./opensea/opensea";
import { postTweet } from "./twitter-bot/twitter";
import { Penguin } from "./models/penguin";

const fromTime = moment().unix();
const paramsPath = path.join(__dirname, "../src/opensea/params.json");

function writeParams(data: any) {
  fs.writeFileSync(paramsPath, JSON.stringify(data));
}

function readParams() {
  const data = fs.readFileSync(paramsPath);
  return JSON.parse(data.toString());
}

async function main() {
  try {
    const params = readParams() || fromTime;
    await getSales(params.fromTime).then((completedSales: any) => {
      completedSales.reverse().forEach(async (sale: Penguin, i: number) => {
        const newMoment = moment.utc(sale.timestamp).unix();
        await postTweet(sale).catch(() => console.log("Error tweeting"));
        if (i === completedSales.length - 1) {
          params.fromTime = newMoment + 1;
          writeParams(params);
        }
      });
    });
  } catch (e) {
    console.log(`Failed to load penguins`);
  }
}

setInterval(main, 10000);