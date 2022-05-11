import config from '../config'
import { getWallets, updateWallet } from '../lib/notion-wallets'

async function main() {
  const needsPopulatingFilter = {
    or: [
      { property: 'DeBank', url: { is_empty: true } },
      { property: 'Zapper', url: { is_empty: true } },
    ],
  }
  const results = await getWallets(config.notionDatabases.wallets, needsPopulatingFilter)

  // Update each DeBank URL
  results.forEach((result) => {
    console.log('Updating', result.address)
    updateWallet(result.pageId, {
      Address: `result.address`,
      DeBank: `https://debank.com/profile/${result.address}`,
      Zapper: `https://zapper.fi/account/${result.address}`,
    })
  })
}

main()
  .then(() => console.log('DONE'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
