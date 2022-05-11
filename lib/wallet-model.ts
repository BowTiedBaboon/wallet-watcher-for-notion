import { Schema } from 'mongoose'
import { connection } from './db-connection'

/**
 * Sub-schema for tokens array
 */
const walletTokenSchema = new Schema({
  network: String,
  symbol: String,
  balance: Number,
}, {_id: false})

/**
 * id_ = wallet address
 */
const walletSchema = new Schema({
  _id: String,
  notionPageId: String,
  tokens: [walletTokenSchema]
})

export const Wallet = connection.model('Wallet', walletSchema)