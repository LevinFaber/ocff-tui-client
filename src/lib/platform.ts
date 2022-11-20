import { components } from '../generated/fulfillmenttools'
import { Order } from '../model/order'
import { createPerfectPickPayload } from '../model/pickjob'
import { ApiInstance, getApiInstance } from './api-connection'
import { waitThen } from './utils'

export async function getBackendPlatform () {
  const api = await getApiInstance()
  return {
    status: status(api),
    dispatchOrder: dispatchOrder(api),
    getOrder: getOrder(api),
    performPerfectPick: performPerfectPick(api),
    waitForPickJob: waitForPickJob(api),
    dispatchPerfectPick: dispatchPerfectPick(api)
  }
}

async function status (api: ApiInstance) {
  const fetchStatus = api.path('/api/status').method('get').create()({})
  return await fetchStatus
}

function dispatchOrder (api: ApiInstance) {
  const postOrder = api.path('/api/orders').method('post').create()
  return async (order: Order) => {
    return await postOrder(order)
  }
}

function getOrder (api: ApiInstance) {
  const fetchOrder = api.path('/api/orders/{orderId}').method('get').create()
  return async (orderId: string) => {
    return await fetchOrder({
      orderId
    })
  }
}

function performPerfectPick (api: ApiInstance) {
  return async (orderRef: string) => {
    const pickJob = await waitForPickJob(api)(orderRef)

    if (pickJob == null) {
      throw new Error('Unable to find pick job')
    }

    const pickPerformed = await dispatchPerfectPick(api)(pickJob)

    return pickPerformed
  }
}

function waitForPickJob (api: ApiInstance) {
  /*
    A subscription functionality is available, but not usefull for this client application.
   */

  return async (orderId: string, maxTries = 20) => {
    const findPickJob = api.path('/api/pickjobs').method('get').create()

    let pickJob: undefined | components['schemas']['StrippedPickJob']
    let tries = 0

    while (tries < maxTries) {
      // This code is not very nice, but waiting and retrying is never nice. I like this version better then a recursive version, since its easy to understand whats happening.
      const response = await waitThen<Promise<any>>(
        async () => await findPickJob({ orderRef: orderId })
      )
      if (response.data.pickjobs?.[0] !== undefined) {
        pickJob = response.data.pickjobs[0]
        break
      }

      tries += 1
    }
    return pickJob
  }
}

function dispatchPerfectPick (api: ApiInstance) {
  const postPickJob = api
    .path('/api/pickjobs/{pickJobId}')
    .method('patch')
    .create()
  return async (pickJob: components['schemas']['StrippedPickJob']) => {
    // Set In Progress:

    const inProgress = await postPickJob({
      pickJobId: pickJob.id,
      version: pickJob.version,
      actions: [
        // Code Generation of openapi-typescript-fetch seems to fail here, proposes type never[]. Have to do some coercion.
        {
          action: 'ModifyPickJob',
          status: 'IN_PROGRESS' as components['schemas']['PickJobStatus']
        } as never
      ]
    })

    const perfectPickPayload = createPerfectPickPayload(
      inProgress.data.pickLineItems
    )

    const closed = await postPickJob({
      pickJobId: pickJob.id,
      version: inProgress.data.version,
      actions: perfectPickPayload
    })

    return closed.data.status === 'CLOSED'
  }
}
