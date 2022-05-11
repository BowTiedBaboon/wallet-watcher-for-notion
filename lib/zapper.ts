import config from '../config'
import axios from 'axios'
import { zapperApiToken, zapperApiWallet } from './types'

export async function getUserTokenBalances(addresses: string | string[]) {
  // Convert addresses array to querystring
  if (typeof addresses === 'string') addresses = [addresses]
  addresses = addresses
    .map((address, index) => `addresses[${index}]=${address}`)
    .join('&')

  // Send api request
  try {
    const { data, status } = await axios.get(
      `https://api.zapper.fi/v1/protocols/tokens/balances?` +
        `api_key=${config.zapperApiKey}&${addresses}`
    )
    return data
  } catch (error: any) {
    console.log(error.response.data)
    console.log(error.response.data.message)
    return
  }
}

export function getTokenBalancesFromZapperObject(
  data: zapperApiWallet
): zapperApiToken[] {
  return data.products[0].assets
}
