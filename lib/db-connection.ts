import mongoose from 'mongoose'
import config from '../config'

export const connection = mongoose.createConnection(config.mongoUrl)