import express from 'express'
import {addFeedback,FeedbacksendMail,getFeedbackByAuth ,allFeedback,getFeedbackForUpdate,updateFeedback,deleteFeedback} from '../controllers/feedback.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router();

router.post("/addFeedback",verifyToken,addFeedback)
router.get("/getFeedback",verifyToken,getFeedbackByAuth)
router.get('/allFeedbacks',allFeedback);

router.post("/FeedbacksendMail",FeedbacksendMail)

router.get('/getForupdateFeedback/:id', getFeedbackForUpdate);//for update fetch data
router.put("/updateFeedback",verifyToken,updateFeedback)
router.delete("/deleteFeedback/:id",deleteFeedback)

export default router