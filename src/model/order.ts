import { nanoid } from 'nanoid'
import { components } from '../generated/fulfillmenttools'
import { z } from 'zod'

type OrderLineItem = components['schemas']['OrderLineItemForCreation']

export function createOrderLineItem ({
  quantity,
  shopPrice,
  article,
  unitKey
}: {
  article: OrderLineItem['article']
  quantity: number
  shopPrice: number
  unitKey: OrderLineItem['measurementUnitKey']
}): OrderLineItem {
  return {
    article,
    customAttributes: {},
    measurementUnitKey: unitKey,
    quantity,
    shopPrice
  }
}

export type Order = components['schemas']['OrderForCreation']

export function createOrder ({
  orderLineItems: items,
  consumer,
  tags
}: {
  orderLineItems: Order['orderLineItems']
  consumer: Order['consumer']
  tags?: Order['tags']
}): Order {
  const now = (new Date()).toISOString()
  const tennantOrderId = nanoid()

  return {
    consumer,
    customAttributes: {},
    /* "deliveryPreferences": { ... }, Use default "Best effort" */
    orderDate: now,
    orderLineItems: items,
    status: 'OPEN',
    tenantOrderId: tennantOrderId,
    tags
  }
}