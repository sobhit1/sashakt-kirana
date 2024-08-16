import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      itemName: {
        type: String,
        required: true,
      },
      itemPrice: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      dateTime: {
        type: Date,
        default: Date.now,
      },
      total: {
        type: Number,
        required: true,
      },
      paid: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
