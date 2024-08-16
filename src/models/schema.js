import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  number: {
    type: Number,
    required: true,
    unique: true,
  }
})

const Users = mongoose.model('User', userSchema)

export default Users
