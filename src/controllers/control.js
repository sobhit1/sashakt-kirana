// Import models
import User from '../models/user_schema.js'
import Item from '../models/item_schema.js'

// sendResponse function with status code flexibility
function sendResponse(success, message, data, res, statusCode = 200) {
  res.status(statusCode).send({
    success: success,
    message: message,
    data: data,
  })
  return
}

// Load item database
let itemDatabase
async function loadData() {
  try {
    itemDatabase = await Item.find({})
    console.log('Item Database Loaded', itemDatabase.length)
  } catch (error) {
    console.log(error)
  }
}
loadData()

// Add item to a customer's bill
export const addItem = async (req, res) => {
  const { sellerid, customer_name, customer_number, item, paid } = req.body
  if (sellerid) {
    try {
      const UserData = await User.findOne({ _id: sellerid })
      let custmr = UserData.customers.findIndex(
        (cust) => cust.customerNumber === customer_number
      )
      const customer = {
        customerName: customer_name,
        customerNumber: customer_number,
        billArray: [
          {
            bill: item,
            date: Date.now().toString(),
            paid: paid,
          },
        ],
      }
      if (custmr === -1) {
        UserData.customers.push(customer)
      } else {
        UserData.customers[custmr].billArray.push(customer.billArray[0])
      }
      await UserData.save()
      sendResponse(true, 'Item added successfully', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Get all customers of a seller
export const getCustomers = async (req, res) => {
  const { sellerid } = req.body
  if (sellerid) {
    try {
      const UserData = await User.findOne({ _id: sellerid })
      let custData = []
      for (let i = 0; i < UserData.customers.length; i++) {
        custData.push({
          cust_name: UserData.customers[i].customerName,
          cust_number: UserData.customers[i].customerNumber,
        })
      }
      sendResponse(true, 'Customers data fetched successfully', custData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Toggle 'paid' status for all bills
export const toggleAllPaid = async (req, res) => {
  const { sellerid, custid } = req.body
  if (sellerid) {
    try {
      await User.updateMany(
        { _id: sellerid, 'customers.billArray.paid': false },
        { $set: { 'customers.$[].billArray.$[].paid': true } }
      )
      const UserData = await User.findOne({ _id: custid })
      sendResponse(true, 'Customer bills paid', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Fetch customer data
export const getUserData = async (req, res) => {
  const { sellerid, custid } = req.body
  if (sellerid) {
    try {
      const UserData = await User.findOne({ _id: custid })
      sendResponse(true, 'User data fetched successfully', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Toggle 'paid' status for a specific bill
export const togglePaid = async (req, res) => {
  const { sellerid, custid } = req.body
  if (sellerid) {
    try {
      const result = await User.updateOne(
        { 'customers.billArray._id': custid },
        { $set: { 'customers.$[].billArray.$[billElem].paid': true } },
        { arrayFilters: [{ 'billElem._id': custid }] }
      )
      if (result.modifiedCount > 0) {
        const UserData = await User.findOne({ _id: sellerid })
        sendResponse(true, 'Toggled successfully', UserData, res)
      } else {
        sendResponse(false, 'No bills to update', null, res)
      }
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not logged in', null, res)
  }
}

// Update user name
export const updateName = async (req, res) => {
  const { sellerid, name } = req.body
  if (sellerid) {
    try {
      const UserData = await User.updateOne(
        { _id: sellerid },
        { $set: { name: name } }
      )
      sendResponse(true, 'Name updated successfully', UserData, res)
    } catch (error) {
      console.log(error)
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Fetch total quantity sold for a specific item of a seller
export const inventorySoldItemQuantity = async (req, res) => {
  const { itemName, sellerid } = req.body
  if (sellerid) {
    try {
      const itemData = await User.find({
        _id: sellerid,
        'customers.billArray.bill.itemName': itemName,
      })
      let totalQuantity = 0
      itemData.forEach((bills) => {
        bills.customers.forEach((customer) => {
          customer.billArray.forEach((billData) => {
            billData.bill.forEach((item) => {
              if (item.itemName === itemName) {
                totalQuantity += item.quantity
              }
            })
          })
        })
      })
      sendResponse(
        true,
        'Item quantity fetched successfully',
        totalQuantity,
        res
      )
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}

// Add a new item from barcode
export const addNewItemFromBarCode = async (req, res) => {
  const { barCodeNumber, itemName, itemPrice } = req.body
  try {
    const itemData = await Item.findOne({ barCodeNumber: barCodeNumber })
    if (itemData) {
      sendResponse(false, 'Item already exists', itemData, res)
    } else {
      const item = new Item({
        barCodeNumber: barCodeNumber,
        itemName: itemName,
        itemPrice: itemPrice,
      })
      await item.save()
      sendResponse(true, 'Item added successfully', item, res)
    }
  } catch (error) {
    sendResponse(false, 'Error encountered', error, res)
  }
}

// Search for an item using barcode
export const searchItemFromBarcode = async (req, res) => {
  const { barCodeNumber } = req.body
  try {
    for (let i = 0; i < itemDatabase.length; i++) {
      if (itemDatabase[i].EAN === barCodeNumber) {
        sendResponse(true, 'Item found', itemDatabase[i], res)
        return
      }
    }
    sendResponse(false, 'Item not found', null, res)
  } catch (error) {
    sendResponse(false, 'Error encountered', error, res)
  }
}

// Delete a user
export const deleteUser = async (req, res) => {
  const { sellerid } = req.body
  if (!sellerid) {
    return sendResponse(false, 'User not logged in', null, res, 400) // Bad Request
  }
  try {
    const result = await User.deleteOne({ _id: sellerid })

    if (result.deletedCount === 0) {
      return sendResponse(false, 'User not found', null, res, 404) // Not Found
    }
    sendResponse(true, 'User deleted successfully', result, res, 200) // OK
  } catch (error) {
    sendResponse(false, 'Error encountered', error, res, 500) // Internal Server Error
  }
}
