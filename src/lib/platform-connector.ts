import { Fetcher } from 'openapi-typescript-fetch'
import { paths } from '../generated/fulfillmenttools'
import { getAuthToken } from './authentication'
import { environment } from './environment'

export async function getApiInstance () {
  const fetcher = Fetcher.for<paths>()

  fetcher.configure({
    baseUrl: environment.API_URL,
    init: {
      headers: {
        authorization: `Bearer ${await getAuthToken()}`
      }
    }
  })

  return fetcher
}
