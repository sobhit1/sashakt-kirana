import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  barCodeNumber: {
    type: String,
  },
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
});

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerNumber: {
    type: String,
    required: true,
  },
  billArray: [
    {
      bill: [billSchema],
      date: {
        type: String,
        required: true,
      },
      paid: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  loginAttempt: {
    otp: {
      type: Number,
    },
    timeStamp: {
      type: Number,
    },
  },
  customers: [customerSchema],
});

const User = mongoose.model('User', userSchema);

export default User;
