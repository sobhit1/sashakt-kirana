import User from '../models/user_schema.js'
import Item from '../models/item_schema.js'

function sendResponse(success, message, data, res) {
  res.status(200).send({
    success: success,
    message: message,
    data: data,
  })
  return
}
export const addItem = async (req, res) => {
  const { uid, customer_name, customer_number, item, paid } = req.body
  if (uid) {
    try {
      const UserData = await User.findOne({ _id: uid })
      // if (paid) {
      //   const currentBill = {
      //     bill: item,
      //     date: Date.now().toString(),
      //   }
      //   UserData.paidBillsArray.push(currentBill)
      // } else {
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
            },
          ],
        }
        if (custmr === -1) {
          UserData.customers.push(customer)
        } else {
          UserData.customers[custmr].billArray.push(customer.billArray[0])
        }
      // }
      await UserData.save()
      sendResponse(true, 'Item added successfully', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}
export const getCustomers = async (req, res) => {
  const { uid } = req.body
  if (uid) {
    try {
      const UserData = await User.findOne({ _id: uid })
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
export const toggleAllPaid = async (req, res) => {
  const { uid } = req.body
  if (uid) {
    try {
      const UserData = await User.findOne({ _id: uid })
      await User.updateMany(
        { 'customers.billArray.paid': false },
        { $set: { 'customers.$[].billArray.$[].paid': true } }
      )
      sendResponse(true, 'Customers bills paid', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}
export const getUserData = async (req, res) => {
  const { uid } = req.body
  if (uid) {
    try {
      const UserData = await User.findOne({ _id: uid })
      sendResponse(true, 'User data fetched successfully', UserData, res)
    } catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}
export const togglePaid = async (req, res) => {
  const { uid, sellerid } = req.body
  if (sellerid) {
    try {
      const result = await User.updateOne(
        { 'customers.billArray._id': uid },
        { $set: { 'customers.$[].billArray.$[billElem].paid': true } },
        { arrayFilters: [{ 'billElem._id': uid }] }
      )
      if (result.modifiedCount > 0) {
        await UserData.save()
        sendResponse(true, 'Toggled successfully', result, res)
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

export const updateName = async (req, res) => {
  const { uid, name } = req.body
  if (uid) {
    try {
      const UserData = await User.updateOne(
        { _id: uid },
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
export const itemQuantity = async (req, res) => {
  const { itemName } = req.body
  try {
    const itemData = await User.find({
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
    sendResponse(true, 'Item quantity fetched successfully', totalQuantity, res)
  } catch (error) {
    sendResponse(false, 'Error encountered', error, res)
  }
}
export const addItemBarCode = async (req, res) => {
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
export const searchItem = async (req, res) => {
  const { barCodeNumber } = req.body
  try {
    const itemData = await Item.findOne({ barCodeNumber: barCodeNumber })
    if (itemData) {
      sendResponse(true, 'Item found successfully', itemData, res)
    } else {
      sendResponse(false, 'Item not found', null, res)
    }
  } catch (error) {
    sendResponse(false, 'Error encountered', error, res)
  }
}
