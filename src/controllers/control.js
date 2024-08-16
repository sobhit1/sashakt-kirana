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
    const { uid,customer_name, customer_number,item,paid } = req.body
    try{
        const UserData = await User.findOne({ _id: uid });
        const customer={
            customerName: customer_name,
            customerNumber: customer_number,
            billArray: [
              {
                bill: item,
                date: Date.now().toString(),
                paid: true,
              },
            ],
          }
        UserData.customers.push(customer);
        await UserData.save();
        sendResponse(true, 'Item added successfully', UserData, res);
    }
    catch(error){
        sendResponse(false, 'Error encountered', error, res);
    }
}