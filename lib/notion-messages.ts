import config from '../config'
import { Client } from '@notionhq/client'
import { twoDecimalsAbs } from './utils'
import { TokenBalance } from './types'

const notion = new Client({ auth: config.notionApiKey })

async function newMessage(
  databaseId: string,
  message: string,
  data: any,
  walletPageId: string
) {
  await notion.pages.create({
    parent: { database_id: databaseId },
    icon: { type: 'emoji', emoji: data.emoji },
    properties: {
      Message: { title: [{ text: { content: message } }] },
      Token: { rich_text: [{ type: 'text', text: { content: data.symbol } }] },
      Wallet: { relation: [{ id: walletPageId }] },
      $Delta: { number: twoDecimalsAbs(data.deltaUSD) },
      $Balance: { number: twoDecimalsAbs(data.balanceUSD) },
      Delta: { number: twoDecimalsAbs(data.delta) },
      Action: { select: { name: data.verb } },
    },
  })
}

 export async function postTokenBalanceChangeMessage(old: TokenBalance, current: TokenBalance, notionPageId: string) {
  if (config.ignoredTokens.includes(current.symbol)) return

  const data = { 
    emoji: '💀', 
    verb: 'Liquidated',
    deltaUSD: 0,
    symbol: current.symbol,
    delta: current.balance-old.balance,
    balance: current.balance,
    balanceUSD: 0
  }

  if (current.price !== undefined) {
    data.deltaUSD = data.delta * current.price
    data.balanceUSD = data.balance * current.price
  }

  if (data.delta > 0) {
    data.verb = 'Added'
    data.emoji = '💰'
  }
  
  if (data.delta < 0 && current.balance > 0) {
    data.verb = 'Removed'
    data.emoji = '💸'
  }

  const message = `${data.symbol} | ${old.balance.toFixed(3)} → ${current.balance.toFixed(3)}`
  newMessage(config.notionDatabases.messages, message, data, notionPageId)
  console.log(message)
}

/**
 * Output message for new tokens added
 */
export async function postNewTokenMessage(token: TokenBalance, notionPageId: string) {
  if (config.ignoredTokens.includes(token.symbol)) return

  const data = { 
    emoji: '💎', 
    verb: 'New',
    deltaUSD: 0,
    symbol: token.symbol,
    delta: token.balance,
    balance: token.balance,
    balanceUSD: 0
  }

  if (token.price !== undefined) {
    data.deltaUSD = data.delta * token.price
    data.balanceUSD = token.balance * token.price
  }

  const message = `${token.symbol} | Added ${token.balance.toFixed(3)}`
  newMessage(config.notionDatabases.messages, message, data, notionPageId)
  console.log(message)
}
