import { components } from '../generated/fulfillmenttools'

type PickJob = components['schemas']['PickJob']
type PickJobLineItem = PickJob['pickLineItems'][0]
/*
Again, the type inference does not work for these types.

  type PickJobLineItemAction = components["schemas"]["ModifyPickLineItemAction"];
  type PickJobAction = components["schemas"]["ModifyPickJobAction"];
  type PickJobAsLastEditorAction = components["schemas"]["ModifyPickJobLastEditorAction"];

  type PickJobActions =
    | PickJobLineItemAction
    | PickJobAction
    | PickJobAsLastEditorAction;
*/

export function createPerfectPickPayload (
  pickLineItems: PickJobLineItem[]
): never[] {
  const closeJob = {
    action: 'ModifyPickJob',
    status: 'CLOSED'
  }

  const lineItems = pickLineItems.map((item: PickJobLineItem) => ({
    id: item.id,
    action: 'ModifyPickLineItem',
    status: 'CLOSED',
    picked: item.quantity
  }))

  return [closeJob as never, ...(lineItems as never[])]
}
