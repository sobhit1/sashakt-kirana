import User from '../models/user_schema.js'
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
      let custmr = UserData.customers.findIndex(
        (cust) => cust.customerNumber === customer_number
      )
      console.log(custmr)
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
      // UserData.customers.push(customer)
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
      //   for(let i=0;i<UserData.customers.length;i++){
      //     for(let j=0;j<UserData.customers[i].billArray.length;j++){
      //       UserData.customers[i].billArray[j].paid = true
      //     }
      //   }
      const result = await User.updateMany(
        { 'customers.billArray.paid': false },
        { $set: { 'customers.$[].billArray.$[].paid': true } }
      )
      await UserData.save()
      sendResponse(true, 'Customers bills paid', UserData, res)
    }
    catch (error) {
      sendResponse(false, 'Error encountered', error, res)
    }
  } else {
    sendResponse(false, 'User not loggedin', null, res)
  }
}
