import { postTweet } from '../twitter-bot/twitter';
import { Penguin } from '../models/penguin';
import { request } from '../utilities/request';
import Web3 from 'web3';
import * as dotenv from 'dotenv';
dotenv.config();

const ETHERSCAN_ABI_URL = process.env.ETHERSCAN_ENDPOINT || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const OPENSEA_ADDRESS = process.env.OPENSEA_ADDRESS || '';
const LOOKS_RARE_ADDRESS = process.env.LOOKS_RARE_ADDRESS || '';
const WSS_PROVIDER = process.env.WSS_PROVIDER || '';
const PENGUIN_BASE_URL = 'https://opensea.io/assets/0xbd3531da5cf5857e7cfaa92426877b022e612cf8/';
const TRANSFER_EVENT_HASH = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function getContractAbi() {
  const abi = await request(`${ETHERSCAN_ABI_URL}${CONTRACT_ADDRESS}&apiKey=${ETHERSCAN_API_KEY}`);
  return JSON.parse(JSON.parse(abi).result);
}

async function getTokenInfo(address: string) {
  const tokenInfo = await request(
    `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${address}&page=1&offset=1&apiKey=${ETHERSCAN_API_KEY}`
  );
  return JSON.parse(tokenInfo);
}

const _getNFTReceiver = (logs: any) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider(WSS_PROVIDER));
  for (let log of logs) {
    // ERC-20 Transfer returns the value in `data`, while ERC-721 has the same signature but returns empty data
    if (log.topics[0] === TRANSFER_EVENT_HASH && log.data === '0x') {
      // 2nd parameter of the `Transfer()` event contains the NFT receiver
      return web3.eth.abi.decodeParameter('address', log.topics[2]);
    }
  }
  return null;
};

function tweetSale(event: any, price: number, tokenSymbol: string) {
  const url = `${PENGUIN_BASE_URL}${event.returnValues.tokenId}`;
  const penguin: Penguin = {
    id: event.returnValues.tokenId,
    price: {
      price: price,
      token: tokenSymbol,
      // TODO: find a way to get actual value
      usdPrice: 0,
    },
    fromAddress: event.returnValues.from,
    toAddresss: event.returnValues.to,
    url: url,
  };
  postTweet(penguin);
}

export async function subscribeToSales() {
  const abi = await getContractAbi();
  const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
  };
  const web3 = new Web3(new Web3.providers.WebsocketProvider(WSS_PROVIDER, options));
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);  
  contract.events
    .Transfer({})
    .on('connected', (subscriptionId: any) => {
      console.log('Subscribing to Pudgy Penguins contract');
    })
    .on('data', async (event: any) => {
      console.log('Transfer event');
      const receipt = await web3.eth.getTransactionReceipt(event.transactionHash);
      const nftReceiver = _getNFTReceiver(receipt.logs);
      web3.eth.getTransaction(event.transactionHash).then(async (response) => {
        let tokenSymbol: string;
        let price: number;
        if (response.to === OPENSEA_ADDRESS || response.to === LOOKS_RARE_ADDRESS) {
          if (+response.value != 0) {
            tokenSymbol = 'ETH'
            price = +web3.utils.fromWei(response.value);
            tweetSale(event, price, tokenSymbol);
          } else {
            for (let log of receipt.logs) {
              if (
                // ERC20 sender (1st param of the Transfer event) is the same as the NFT receiver
                log.topics[0] === TRANSFER_EVENT_HASH &&
                web3.eth.abi.decodeParameter('address', log.topics[1]).toLowerCase() === nftReceiver?.toLowerCase() &&
                // ERC-20 Transfer returns the value in `data`, while ERC-721 has the same signature but returns empty data
                log.data !== '0x'
              ) {
                const tokenInfo = await getTokenInfo(log.address);
                tokenSymbol = tokenInfo.result[0].tokenSymbol;
                price =
                  +web3.eth.abi.decodeParameter('uint256', log.data) /
                  Math.pow(10, tokenInfo.result[0].tokenDecimal);
                tweetSale(event, price, tokenSymbol);
                break;
              } else {
                console.log('Broken OpenSea or LooksRare Transfer');
              }
            }
          }
        } else {
          console.log('Non OpenSea or LooksRare Transfer');
        }
      });
    })
    .on('changed', (event: any) => {
      // remove event from local database
      console.log('changed event');
    })
    .on('error', (error: any, receipt: any) => {
      // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      console.log('error');
      console.log(error);
    });
}