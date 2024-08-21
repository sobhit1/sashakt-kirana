import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  barCodeNumber: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemPrice: {
    type: Number,
    required: true,
  }
})

export default mongoose.model('Item', itemSchema)