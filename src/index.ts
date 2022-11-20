import { createOrder as createOrderData, Order } from './model/order'
import { promptForConsumerData } from './lib/tui/consumer'
import { promptForOrderLines } from './lib/tui/article'
import { promptForPickJob } from './lib/tui/pickjob'
import { createSpinner } from 'nanospinner'
import { getBackendPlatform } from './lib/platform'

main()

async function main () {
  const consumerData = await promptForConsumerData()
  const orderLines = await promptForOrderLines()

  const orderData = createOrderData({
    consumer: consumerData,
    orderLineItems: orderLines
  })

  const created = await createOrder(orderData)

  if (created !== false) {
    const performPick = await promptForPickJob()
    if (performPick) {
      await performPerfectPick(created.data.id)
    }
  }
}

async function createOrder (order: Order) {
  const creationSpinner = createSpinner('Creating Order...').start()
  try {
    const api = await getBackendPlatform()

    const created = await api.dispatchOrder(order)
    creationSpinner.success({
      text: `Order created successfully: ${created.data.id}`
    })
    return created
  } catch (e) {
    creationSpinner.error({ text: 'Failed to create order' })
    console.error(e)
    return false
  }
}

async function performPerfectPick (orderId: string) {
  const pickSpinner = createSpinner('Creating Perfect pick...').start()
  try {
    const api = await getBackendPlatform()

    const perfectPickSuccessful = await api.performPerfectPick(orderId)

    if (perfectPickSuccessful) {
      pickSpinner.success({ text: 'Successfully picked order' })
    } else {
      pickSpinner.error({ text: 'Failed to pick order' })
    }
  } catch (e) {
    pickSpinner.error({ text: 'Failed to pick order' })
    console.error(e)
    return false
  }
}
