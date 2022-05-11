import config from '../config'
import { Wallet } from './wallet-model'
import { TokenBalance } from './types'

/**
 * Get the new token balance amount, update it in the dabase, and return a new instance of tokenBalance
 * This is required for checking if a token has been removed in the fresh data (then balance = 0)
 * 
 * @param address wallet address this tokenBalance belongs to
 * @param cachedToken tokenBalance returned from the database
 * @param freshTokens all tokenBalance[] in the wallet, returned from live source
 * @returns copy of cachedToken with updated balance and current token price
 */
export async function updateTokenBalance(address: string, cachedToken: TokenBalance, freshTokens: TokenBalance[]) {
  const token = JSON.parse(JSON.stringify(cachedToken))
  const match = freshTokens.find(fresh => fresh.symbol === token.symbol)
  if (match === undefined) token.balance = 0
  else {
    token.balance = match.balance
    if (match.price !== undefined) token.price = match.price
  }

  await setTokenBalance(address, token.symbol, token.balance)
  return token
}

/**
 * Check for new additions
 */
export function checkForNewTokens(cacheData: TokenBalance[], newData: TokenBalance[]) {
  return newData.filter(n => {
    // Match any that *do not* exist or have zero balance
    return !(cacheData.some(c => n.symbol === c.symbol || n.balance === 0))
  })
}

/**
 * Update the token balance in the database
 */
async function setTokenBalance(address: string, symbol: string, balance: number) {
  await Wallet.findOneAndUpdate(
    {_id: address},
    {$set: {'tokens.$[el].balance': balance}},
    {arrayFilters: [{'el.symbol': symbol}]}
  )
}

