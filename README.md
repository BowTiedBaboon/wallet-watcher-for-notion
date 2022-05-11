# Wallet Watcher for Notion

This is a simple Notion integration I whipped up for tracking balance changes within ERC-20 wallets.

It is part of a larger project for me to improve my overall (Web3 related) development skills.

Plenty of room for improvement here, but I wanted to share it as-is in case anyone can get use out of it. Please report any bugs or feature suggestions on GitHub or by contacting [@BowTiedBaboon](https://twitter.com/BowTiedBaboon) on Twitter.

## Installation Instructions

1. Clone this repo
2. Run `npm install`
3. Rename `config.sample.ts` to `config.ts`

Next, we'll fill in the config options

### Set up a free database with Mongo Atlas

Follow the instructions at https://www.mongodb.com/docs/atlas/getting-started/ to create a free cluster and [get your connection URL for use with the Node.js Driver](https://www.mongodb.com/docs/atlas/tutorial/connect-to-your-cluster/)


It should look something like this:
```
mongodb+srv://<username>:<password>@cluster0.u0a4k.mongodb.net/<database-name>?retryWrites=true&w=majority`
```

Paste that URL into the `mongoUrl` property of `config.ts`

### Get your Notion API key

Follow the instructions at https://developers.notion.com/docs/getting-started to create an internal integration. Once you have done that, copy the API key into the `notionApiKey` property of `config.ts`

### Set up Wallets and Messages Notion databases

1. Duplicate my [Wallet Tracker](https://bowtiedbaboon.notion.site/Shared-Templates-e9ac98d64811495aa5bbaa6a6b5be12c) Notion page template
2. Share it with your internal integration
3. Copy your new page IDs into `notionDatabases` fields for `wallets` and `messages`

### Additional Config Options

* You can add or remove from the `ignoredTokens` array
* The included `zapperApiKey` is a public key, which should work fine

> As of March 2022, Zapper began rate limiting query volume on the public API key. See below for how to get a private API key if you are hitting the rate limit on the public key.

## Running the Watcher

Start with: `npm run watch-wallets`

This will fetch updated token balances from the Zapper API (in batches of 15), then process each fresh wallet data against the cached wallet data in your database.

Any changes will be posted to the Messages database in Notion where you can use all of Notion's sorting, filtering, and note-taking features to help better analyze the data.

The script will continue to check each wallet every 15 minutes.

## Adding New Wallets to Watch

All you need to do track more wallets is add them as a new entry in your Wallets database in Notion. Fill in the address field with an ethereum address and the enable with the `Track Balances` checkbox.

Aside from the Relation to `Wallets` property, all other fields are for your conveience. You can delete/rename them or add new fields as you wish.

You can `npm run populate-wallet-fields` to automatically fill in the DeBank and Zapper URLs for easy access.