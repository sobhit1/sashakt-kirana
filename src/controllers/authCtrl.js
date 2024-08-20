import User from '../models/user_schema.js'
function sendResponse(success, message, data, res) {
  res.status(200).send({
    success: success,
    message: message,
    data: data,
  })
  return
}
function otpGenerate(){
  return Math.floor(Math.random()*1000000).toString();
}
export const createUser = async (req, res) => {
  const { contactNumber } = req.body
  try {
    const newUser = new User({contactNumber})
    newUser.loginAttempt={
      otp:otpGenerate(),
      timeStamp:Date.now()
    }
    const savedUser = await newUser.save();
    sendResponse(true, 'User created successfully', savedUser, res);
  }
  catch (error) {
    sendResponse(false, 'Error encountered', error, res);
  }
}
export const numberCheck = async (req, res) => {
  const { contactNumber } = req.body
  try {
    const user = await User.findOne({ contactNumber: contactNumber })
    if (!user) {
      await createUser(req,res);
    }
    else {
      user.loginAttempt={
        otp:otpGenerate(),
        timeStamp:Date.now()
      }
      await user.save();
      sendResponse(true, 'User already exists', user, res);
    }
  }
  catch (error) {
    sendResponse(false, 'Error encountered', error, res);
  }
}
export const otpVerify=async(req,res)=>{
  const {contactNumber,otp}=req.body
  try{
    const user=await User.findOne({contactNumber:contactNumber});
    if((Date.now()-user.loginAttempt.timeStamp)/1000<180){
      const user_otp=user.loginAttempt.otp;
      if(user_otp!=otp){
        sendResponse(false,"Invalid otp",user,res);
      }
      else{
        user.loginAttempt={
          timeStamp:Date.now()
        }
        await user.save();
        const data = {
          uid:user._id,
          phonenumber:contactNumber,
          user:user
        }
        sendResponse(true,"otp verified",data,res);
      }
    }
    else{
      user.loginAttempt={
        timeStamp:Date.now()
      }
      await user.save();
      sendResponse(false,"otp expired",user,res);
    }
  }
  catch(error){
    sendResponse(false,"otp error",error,res);
  }
}
