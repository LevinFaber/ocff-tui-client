import { Fetcher } from 'openapi-typescript-fetch'
import { components, paths } from '../generated/fulfillmenttools'
import { Order } from '../model/order'
import { createPerfectPickPayload } from '../model/pickjob'
import { getAuthToken } from './authentication'
import { environment } from './environment'
import { waitThen } from './utils'

type ApiInstance = ReturnType<typeof Fetcher.for<paths>>;

export async function getApiInstance () {
  const api = Fetcher.for<paths>();

  api.configure({
    baseUrl: environment.API_URL,
    init: {
      headers: {
        authorization: `Bearer ${await getAuthToken()}`
      }
    }
  })

  return {
    status: status(api),
    dispatchOrder: dispatchOrder(api),
    getOrder: getOrder(api),
    performPerfectPick: performPerfectPick(api),
    waitForPickJob: waitForPickJob(api),
    dispatchPerfectPick: dispatchPerfectPick(api),
  }
}

function status(api: ApiInstance) {
  const fetchStatus = api.path("/api/status").method("get").create()({});
  return fetchStatus;
}

function dispatchOrder(api: ApiInstance) {
  const postOrder = api.path("/api/orders").method("post").create();
  return (order: Order) => {
    return postOrder(order);
  }
}

function getOrder(api: ApiInstance) {
  const fetchOrder = api.path("/api/orders/{orderId}").method("get").create();
  return (orderId: string) => {
    return fetchOrder({
      orderId
    });
  }
}

function performPerfectPick(api: ApiInstance) {
  return async (orderRef: string) => {
    const pickJob = await waitForPickJob(api)(orderRef);

    if (!pickJob) {
      throw new Error("Unable to find pick job");
    }

    const pickPerformed = await dispatchPerfectPick(api)(pickJob);

    return pickPerformed;
  }
}

function waitForPickJob(api: ApiInstance) {
  /* 
    A subscription functionality is available, but not usefull for this client application. 
   */

  return async (orderId: string, maxTries = 20) => {
    const findPickJob = api.path("/api/pickjobs").method("get").create();

    let pickJob: undefined | components["schemas"]["StrippedPickJob"] = undefined;
    let tries = 0;

    while (tries < maxTries) { 
      // This code is not very nice, but waiting and retrying is never nice. I like this version better then a recursive version, since its easy to understand whats happening.
      const response = await waitThen<Promise<any>>(() => findPickJob({ orderRef: orderId}));
      if (response.data.pickjobs && response.data.pickjobs[0]) {
        pickJob = response.data.pickjobs[0];
        break;
      }

      tries += 1;
    }
    return pickJob;
  }
}

function dispatchPerfectPick(api: ApiInstance) {
  const postPickJob = api.path("/api/pickjobs/{pickJobId}").method("patch").create();
  return async (pickJob: components["schemas"]["StrippedPickJob"]) => {
    // Set In Progress:

    const inProgress = await postPickJob({
      pickJobId: pickJob.id,
      version: pickJob.version,
      actions: [ // Code Generation of openapi-typescript-fetch seems to fail here, proposes type never[]. Have to do some coercion.
        {
          action: "ModifyPickJob",
          status: "IN_PROGRESS" as components["schemas"]["PickJobStatus"]
        } as never
      ]
    });

    const perfectPickPayload = createPerfectPickPayload(inProgress.data.pickLineItems);

    const closed = await postPickJob({
      pickJobId: pickJob.id,
      version: inProgress.data.version,
      actions: perfectPickPayload
    });

    return closed.data.status === "CLOSED";
  }
}

