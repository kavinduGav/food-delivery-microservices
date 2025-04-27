import express from 'express'
import {addDilivery,getDiliveryByAuth ,allDilivery,getForupdateDilivery,updateDilivery,deleteDilivery} from '../controllers/diliverRole.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router();

router.post("/addDilivery",addDilivery)
router.get("/getDilivery/:id",getDiliveryByAuth)
router.get('/allDiliveries',allDilivery);


router.get('/getForupdateDilivery/:id', getForupdateDilivery);//for update fetch data
router.put("/updateDilivery",updateDilivery)
router.delete("/deleteDilivery/:id",deleteDilivery)

export default router