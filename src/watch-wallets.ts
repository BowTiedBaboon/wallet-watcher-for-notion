import config from '../config'
import { getWallets } from '../lib/notion-wallets'
import { postNewTokenMessage, postTokenBalanceChangeMessage } from '../lib/notion-messages'
import { Wallet } from '../lib/wallet-model'
import * as zapper from '../lib/zapper'
import * as walletTracker from '../lib/token-balances'
import { delay } from '../lib/utils'
import type { TokenBalance, zapperApiWallet } from '../lib/types'

async function main() {
  // Query Notion for wallet addresses to check
  const filter = { property: 'Track Balances', checkbox: { equals: true } }
  const wallets = await getWallets(config.notionDatabases.wallets, filter)
  const addresses = wallets.map((result) => result.address.toLowerCase())

  // Ensure all addresses are in the database
  wallets.forEach(async (result) => {
    await Wallet.findOneAndUpdate(
      { _id: result.address },
      { $setOnInsert: { _id: result.address, notionPageId: result.pageId } },
      { upsert: true }
    )
  })

  // For each wallet, get token balances from Zapper
  // Limit 15 per call
  const chunkSize = 15
  let walletsArray: { [key: string]: zapperApiWallet }[] = []
  for (let i = 0; i < addresses.length; i += chunkSize) {
    console.log('loop', i / chunkSize + 1)
    const slice = addresses.slice(i, i + chunkSize)
    walletsArray = walletsArray.concat(await zapper.getUserTokenBalances(slice))
    await delay(1500)
  }

  // Combine wallets array into single object
  let zapperWallets: { [key: string]: zapperApiWallet } = walletsArray.reduce((result, current) => {
    return Object.assign(result, current)
  })

  // Loop through all addresses
  for (let address in zapperWallets) {
    console.log('Checking ' + address)
    // Get token balances from Zapper response
    const freshData = zapper.getTokenBalancesFromZapperObject(zapperWallets[address])
    // const freshData = mockNewData
    // address = mockAddress

    // Get token balances from database
    const cachedData: {
      _id: string
      notionPageId: string
      tokens: TokenBalance[]
    } | null = await Wallet.findOne({ _id: address })
    if (cachedData === null) continue

    // Update token balances
    cachedData.tokens.forEach(async (token) => {
      const newToken = await walletTracker.updateTokenBalance(address, token, freshData)
      if (newToken.balance === token.balance) return
      postTokenBalanceChangeMessage(token, newToken, cachedData.notionPageId)
    })

    // Add new tokens to database
    const newTokens = walletTracker.checkForNewTokens(cachedData.tokens, freshData)
    await Wallet.findOneAndUpdate(
      { _id: address },
      { $push: { tokens: { $each: newTokens } } }
    ).then(() => {
      if (cachedData.tokens.length === 0) return
      newTokens.forEach((token) => postNewTokenMessage(token, cachedData.notionPageId))
    })
  }
}

let count = 0
console.log(`Refreshing in ${count + 1} minutes`)
setInterval(async () => {
  if (count > 0) {
    console.log(`Refreshing in ${count--} minutes`)
    return
  }
  main().catch((err) => console.log(err))
  count = 15
}, 60 * 1 * 1000)
