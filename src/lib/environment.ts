import { config } from 'dotenv'
config()

const requiredConfiguration = {
  API_URL: process.env.API_URL,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_KEY: process.env.AUTH_KEY,
  USERNAME: process.env.AUTH_EMAIL,
  PASSWORD: process.env.AUTH_PASSWORD
}

type ConfigurationType = typeof requiredConfiguration
type FieldsNonNullable<T> = { [key in keyof T]: NonNullable<T[key]> }

function valuesAreStrings (
  obj: ConfigurationType
): obj is FieldsNonNullable<ConfigurationType> {
  return Object.values(obj).every((value) => typeof value === 'string')
}

if (!valuesAreStrings(requiredConfiguration)) {
  throw new Error('Missing Configuration Values in env')
}

export const environment = requiredConfiguration
