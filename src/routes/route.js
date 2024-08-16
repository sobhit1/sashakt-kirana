import express from 'express'
import { numberCheck ,otpVerify} from '../controllers/authCtrl.js';
import { addItem, getCustomers, toggleAllPaid } from '../controllers/control.js';
const router = express.Router() 

router.post('/login', numberCheck);
router.post('/optverify',otpVerify);
router.post('/additem', addItem);
router.post('/getcustomers', getCustomers);
router.post('/toggleallpaid', toggleAllPaid);
export default router