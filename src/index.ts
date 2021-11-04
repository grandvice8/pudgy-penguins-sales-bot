import moment from 'moment';
import Web3 from 'web3';
import * as dotenv from 'dotenv';
dotenv.config();

// import { getSales } from './opensea/opensea';
import { postTweet } from './twitter-bot/twitter';
import { Penguin } from './models/penguin';
import { request } from './utilities/request';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

const ETHERSCAN_ABI_URL = process.env.ETHERSCAN_ENDPOINT || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

let fromTime = moment().unix();

// async function main() {
//   try {
//     await getSales(fromTime).then((completedSales: any) => {
//       completedSales.reverse().forEach(async (sale: Penguin, i: number) => {
//         const newMoment = moment.utc(sale.timestamp).unix();
//         console.log(sale);
//         await postTweet(sale).catch(() => console.log('Error tweeting'));
//         if (i === completedSales.length - 1) {
//           fromTime = newMoment + 1;
//         }
//       });
//     });
//   } catch (e) {
//     console.log(`Failed to load penguins`);
//   }
// }

// setInterval(main, 10000);
async function getContractAbi() {
  const abi = await request(
    `${ETHERSCAN_ABI_URL}${CONTRACT_ADDRESS}`
  );
  return JSON.parse(JSON.parse(abi).result);
}

async function mainNew() {
  const abi = await getContractAbi();

  const provider = new ethers.providers.WebSocketProvider('wss://mainnet.infura.io/ws/v3/6b4db4e825064a46a1d48a5237a97259');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  contract.on("Transfer", (from, to, amount, value, event) => {
    console.log('New Sale');
    console.log(`${ from.substring(0, 8) } sent ${ value } for ${ formatEther(amount) } to ${ to.substring(0, 8) }`);
    console.log(amount);
    console.log(JSON.stringify(value));
    // The event object contains the verbatim log data, the
    // EventFragment and functions to fetch the block,
    // transaction and receipt and event functions
});

  // let web3 = new Web3(
  //   new Web3.providers.WebsocketProvider(
  //     'wss://mainnet.infura.io/ws/v3/6b4db4e825064a46a1d48a5237a97259'
  //   )
  // );

  // const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

  // console.log(contract);

  // contract.getPastEvents('Transfer').then((events) => {
  //   // console.log(events); // same results as the optional callback above
  //   events.forEach((event) => {
  //     console.log(event);
  //   });
  // });

  // contract.events
  //   .Transfer({})
  //   .on('connected', (subscriptionId: any) => {
  //     console.log(subscriptionId);
  //   })
  //   .on('data', (event: any) => {
  //     console.log(event);
  //   })
  //   .on('changed', (event: any) => {
  //     // remove event from local database
  //     console.log('changed');
  //   })
  //   .on('error', (error: any, receipt: any) => {
  //     // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
  //     console.log('error');
  //   });
}

mainNew();
