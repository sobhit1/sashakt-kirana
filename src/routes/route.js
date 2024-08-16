import express from 'express'
import { numberCheck ,otpVerify} from '../controllers/authCtrl.js';
import { addItem } from '../controllers/control.js';
const router = express.Router() 

router.post('/login', numberCheck);
router.post('/optverify',otpVerify);
router.post('/additem', addItem);
export default router