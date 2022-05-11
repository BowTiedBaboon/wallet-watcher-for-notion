import config from '../config'
import { Client } from '@notionhq/client'
import { Wallet, NotionWallet, NotionQueryResult } from './types'
import { getPlainText } from './notion-utils'

const notion = new Client({ auth: config.notionApiKey })

export async function getWallets(databaseId: string, filter: any): Promise<Wallet[]> {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: filter,
  })
  return queryResultsToWallets(results as NotionQueryResult[])
}

function queryResultsToWallets(queryResults: NotionQueryResult[]): Wallet[] {
    return queryResults.reduce((outputArray: Wallet[], result) => {
      if ('properties' in result)
        outputArray.push({
          pageId: result.id,
          address: getPlainText(result.properties.Address) ?? '',
        })
      return outputArray
    }, [])
}

export async function updateWallet(pageId: string, data: NotionWallet) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      DeBank: { url: data.DeBank ?? '' },
      Zapper: { url: data.Zapper ?? '' },
    },
  })
  return response
}
