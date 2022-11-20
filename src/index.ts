import inquirer from "inquirer";
import { createOrder, Order } from './model/order'
import { getApiInstance } from './lib/platform-connector'
import { promptForConsumerData } from "./lib/tui/consumer";
import { promptForOrderLines } from "./lib/tui/article";
import { promptForPickJob } from "./lib/tui/pickjob";
async function main () {
  const api = await getApiInstance();

  const consumerData = await promptForConsumerData();
  const orderLines = await promptForOrderLines();

  const orderData = createOrder({
    consumer: consumerData,
    orderLineItems: orderLines
  });

  const created = await api.dispatchOrder(orderData);

  const performPick = await promptForPickJob();

  if (performPick) {
    await api.performPerfectPick(created.data.id);
  } 
}


main()
