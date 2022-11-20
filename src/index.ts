import inquirer from "inquirer";
import { createOrder, Order } from './model/order'
import { getApiInstance } from './lib/platform-connector'
import { createConsumer } from './model/consumer';
import { promptForConsumer } from "./lib/tui";
async function main () {
  // const api = await getApiInstance();

  const address = await promptForConsumer();






 /*  const created = await api.dispatchOrder(createSampleOrder());

  const pickjob = await api.awaitPickjob(created.data.id);

  if (!pickjob) {
    throw new Error("Was not able to find pickjob.");
  }

  const pp = await api.dispatchPerfectPick(pickjob); */
}

function createSampleOrder(): Order {
  const consumer = createConsumer({
    email: "levinfaberwork@gmail.com",
    address: {
      city: 'Cologne',
      country: 'DE',
      houseNumber: '7',
      postalCode: '50667',
      street: 'xxx',
      companyName: "ACME Corp"
    }
  });
  
  const orderLineItems: Order['orderLineItems'] = [
    {
      article: {
        tenantArticleId: '4711',
        title: 'Kölsche Wasser'
      },
      quantity: 10
    }
  ]

  const order = createOrder({
    consumer,
    orderLineItems
  })

  return order
}

main()
