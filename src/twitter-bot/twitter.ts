import twit from 'twit';
import * as dotenv from 'dotenv';
dotenv.config();

import { Rod } from '../models/rod';

const T = new twit({
  consumer_key: process.env.TWITTER_API_KEY || '',
  consumer_secret: process.env.TWITTER_API_SECRET || '',
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export function postTweet(rod: Rod): Promise<any> {
  return new Promise((resolve, reject) => {
    T.post(
      'statuses/update',
      {
        status: `Rog ${rod.id} bought for ${rod.price.price}${
          rod.price.token
        } (${rod.price.usdPrice}) by ${rod.toAddresss.substring(
          0,
          8
        )} from ${rod.fromAddress.substring(0, 8)} ${rod.url}`,
      },
      (error: any, data: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }
    );
    console.log(
      `Rog ${rod.id} bought for ${rod.price.price}${rod.price.token} (${rod.price.usdPrice})`
    );
  });
}

export function postSweep(
  count: number,
  ethValue: number,
  sweepUrl: string,
  usdValue: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    T.post(
      'statuses/update',
      {
        status: `${count} Pudgy Rods are included in a ${ethValue}ETH sweep (${usdValue}) ${sweepUrl}`,
      },
      (error: any, data: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }
    );
    console.log(
      `${count} Pudgy Rods swept for ${ethValue}ETH (${usdValue}) ${sweepUrl}`
    );
  });
}
