import { Payment } from "./payment";

export interface Penguin {
  id: string;
  price: Payment;
  timestamp: string;
  fromAddress: string;
  toAddresss: string;
  url: string;
}
