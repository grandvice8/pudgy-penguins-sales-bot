import { Payment } from "./payment";

export interface Penguin {
  id: string;
  price: Payment;
  fromAddress: string;
  toAddresss: string;
  url: string;
}
