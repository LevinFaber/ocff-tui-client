import { environment } from './environment'

interface AuthResponse {
  kind: string
  localId: string
  email: string
  displayName: string
  idToken: string
  registered: boolean
  refreshToken: string
  expiresIn: string
}

function getAuthUrl () {
  return environment.AUTH_URL.replace('<AUTHKEY>', environment.AUTH_KEY)
}

export async function getAuthToken () {
  const url = getAuthUrl()
  const body = {
    email: environment.USERNAME,
    password: environment.PASSWORD,
    returnSecureToken: true
  }
  console.log({ test: environment.USERNAME })
  const response: AuthResponse = await (await fetch(url, {
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  })).json() // TODO Promise Rejections;

  console.log(response)

  return response.idToken
}
