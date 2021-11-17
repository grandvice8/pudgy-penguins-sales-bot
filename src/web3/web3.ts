import { postTweet } from '../twitter-bot/twitter';
import { Penguin } from '../models/penguin';
import { request } from '../utilities/request';
import Web3 from 'web3';
import * as dotenv from 'dotenv';
dotenv.config();

const ETHERSCAN_ABI_URL = process.env.ETHERSCAN_ENDPOINT || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const OPENSEA_ADDRESS = process.env.OPENSEA_ADDRESS || '';
const WSS_PROVIDER = process.env.WSS_PROVIDER || '';
const PENGUIN_BASE_URL = 'https://opensea.io/assets/0xbd3531da5cf5857e7cfaa92426877b022e612cf8/';

async function getContractAbi() {
  const abi = await request(`${ETHERSCAN_ABI_URL}${CONTRACT_ADDRESS}`);
  return JSON.parse(JSON.parse(abi).result);
}

export async function subscribeToSales() {
  const abi = await getContractAbi();
  const web3 = new Web3(new Web3.providers.WebsocketProvider(WSS_PROVIDER));
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
  
  contract.events
    .Transfer({})
    .on('connected', (subscriptionId: any) => {
      console.log(subscriptionId);
    })
    .on('data', (event: any) => {
      web3.eth.getTransaction(event.transactionHash).then((response) => {
        if (response.to === OPENSEA_ADDRESS) {
          const price = web3.utils.fromWei(response.value);
          const url = `${PENGUIN_BASE_URL}${event.returnValues.tokenId}`;
          const penguin: Penguin = {
            id: event.returnValues.tokenId,
            price: {
              price: +price,
              // TODO: find a way to get actual value and unit
              token: 'eth',
              usdPrice: 0
            },
            fromAddress: event.returnValues.from,
            toAddresss: event.returnValues.to,
            url: url
          };
          postTweet(penguin);
        }
      });
    })
    .on('changed', (event: any) => {
      // remove event from local database
      console.log('changed');
    })
    .on('error', (error: any, receipt: any) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log('error');
    });
}