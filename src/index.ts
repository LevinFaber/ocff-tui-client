import { createOrder, Order } from './model/order'
import { getApiInstance } from './lib/platform-connector'
import { createConsumer } from './model/consumer';

async function main () {
  const api = await getApiInstance()
  const response = await api.path('/api/status').method('get').create()({})

  console.log(response);

  const createOrder = api.path("/api/orders").method("post").create();

  const created = await createOrder(createSampleOrder());

  console.log("Created")
  console.log({created});


  const readOrder = api.path("/api/orders/{orderId}").method("get").create();

  const read = await readOrder({
    orderId: created.data.id
  });

  console.log({read: read.data.orderLineItems[0].article});

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
