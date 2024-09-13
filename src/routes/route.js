import express from 'express'
import { numberCheck ,otpVerify} from '../controllers/authCtrl.js';
import { addItem, getCustomers, toggleAllPaid, getUserData, togglePaid, updateName, inventorySoldItemQuantity, addNewItemFromBarCode, searchItemFromBarcode, deleteUser } from '../controllers/control.js';

const router = express.Router() 

router.post('/login', numberCheck);
router.post('/optverify',otpVerify);
router.post('/additem', addItem);
router.post('/getcustomers', getCustomers);
router.post('/toggleallpaid', toggleAllPaid);
router.post('/getuserdata', getUserData);
router.post('/togglepaid', togglePaid);
router.post('/updatename', updateName);
router.post('/inventorysolditemquantity', inventorySoldItemQuantity);
router.post('/addnewitemfrombarcode', addNewItemFromBarCode);
router.post('/searchitemfrombarcode', searchItemFromBarcode);
router.post('/deleteuser', deleteUser);
export default router