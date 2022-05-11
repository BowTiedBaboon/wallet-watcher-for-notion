export type NotionQueryResult = {
  object: 'page',
  id: string,
  created_time: string,
  last_edited_time: string,
  archived: boolean,
  url: string,
  properties: Record<string, NotionProperty>
}

export type NotionProperty = {
  id: string,
  type: string,
  rich_text?: Array<{ plain_text: string }>,
  checkbox?: boolean,
  url?: string,
}

export type NotionSetProperty = Omit<NotionProperty, 'id' | 'type'>

export type NotionWallet = {
  Address: string,
  DeBank?: string,
  Zapper?: string,
}

/**
 * Token document with balance
 * Used in database and as results from blockchian/apis
 */
 export type TokenBalance = {
  symbol: string,
  network: string,
  balance: number,
  price?: number,
}

export type Wallet = {
  pageId: string, 
  address: string,
  tokens?: TokenBalance[]
}

export type zapperApiToken = { network: string; symbol: string; balance: number }
export type zapperApiWallet = { products: [{ assets: zapperApiToken[] }] }