import { z } from "zod";
import { Order } from "./order";

type ConsumerBaseAddress = Order["consumer"]["addresses"][0];
type ConsumerPrivateAdress = ConsumerBaseAddress & Required<Pick<ConsumerBaseAddress, "lastName">>;
type ConsumerBusinessAdress = ConsumerBaseAddress & Required<Pick<ConsumerBaseAddress, "companyName">>;


export function createConsumer({email: rawEmail, address}: {email: string, address: ConsumerBusinessAdress | ConsumerPrivateAdress}): Order["consumer"] {
  const email = z.string().email().parse(rawEmail);  
  return {
    addresses: [address], 
    email
  }
}