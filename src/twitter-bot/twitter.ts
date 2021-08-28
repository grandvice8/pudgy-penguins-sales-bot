import twit from "twit";

import { Penguin } from "../models/penguin";

const T = new twit({
  consumer_key: process.env.TWITTER_API_KEY || "",
  consumer_secret: process.env.TWITTER_API_SECRET || "",
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export function postTweet(penguin: Penguin): Promise<any> {
  return new Promise((resolve, reject) => {
    T.post(
      "statuses/update",
      {
        status: `Penguin ${penguin.id} bought for ${penguin.price.price}${
          penguin.price.token
        } ($${(+penguin.price.price * +penguin.price.usdPrice).toFixed(2)} USD) by ${
          penguin.toAddresss.substring(0, 8)
        } from ${penguin.fromAddress.substring(0,8)} ${penguin.url}`,
      },
      (error: any, data: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }
    );
  });
}
