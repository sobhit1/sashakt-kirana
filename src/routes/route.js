import express from 'express'
import { numberCheck ,otpVerify} from '../controllers/authCtrl.js';
import { addItem, getCustomers, toggleAllPaid, getUserData, togglePaid, updateName, itemQuantity, addItemBarCode, searchItem } from '../controllers/control.js';

const router = express.Router() 

router.post('/login', numberCheck);
router.post('/optverify',otpVerify);
router.post('/additem', addItem);
router.post('/getcustomers', getCustomers);
router.post('/toggleallpaid', toggleAllPaid);
router.post('/getuserdata', getUserData);
router.post('/togglepaid', togglePaid);
router.post('/updatename', updateName);
router.post('/itemquantity', itemQuantity);
router.post('/additembarcode', addItemBarCode);
router.post('/searchitem', searchItem);

export default router