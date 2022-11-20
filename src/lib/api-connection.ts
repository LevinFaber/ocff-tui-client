import { Fetcher } from 'openapi-typescript-fetch'
import { paths } from '../generated/fulfillmenttools'
import { getAuthToken } from './authentication'
import { environment } from './environment'

export type ApiInstance = ReturnType<typeof Fetcher.for<paths>>

let apiInstance: undefined | ApiInstance
export async function getApiInstance () {
  if (apiInstance === undefined) {
    apiInstance = Fetcher.for<paths>()
    apiInstance.configure({
      baseUrl: environment.API_URL,
      init: {
        headers: {
          authorization: `Bearer ${await getAuthToken()}`
        }
      }
    })
  }

  return apiInstance
}
