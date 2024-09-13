import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  Name: String,
  MRP: Number,
  EAN: Number,
  productLink: String
})

export default mongoose.model('EANCODE_DB', itemSchema)