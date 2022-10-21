import { Payment } from "./payment";

export interface Rod {
  id: string;
  price: Payment;
  fromAddress: string;
  toAddresss: string;
  url: string;
}
