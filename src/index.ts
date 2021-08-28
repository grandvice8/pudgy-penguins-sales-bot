import * as dotenv from "dotenv";
dotenv.config();

import { getSales } from "./opensea/opensea";
import { postTweet } from "./twitter-bot/twitter";

async function main() {
  try {
    await getSales().then((response: any) => {
      response.asset_events.forEach((penguin: any) => {
        console.log(penguin.asset.token_id);
      });
    });
    // Post tweet after making async call to get penguin sales. Example below
    // await postTweet("1234", "3.2").then(() => {
    //   console.log("Tweet succeeded");
    // });
  } catch (e) {
    console.log(`Tweet failed ${e}`);
  }
}

// setInterval(main, 10000);
main();
