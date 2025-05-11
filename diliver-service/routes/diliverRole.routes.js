import express from 'express';
import { 
    addDelivery, 
  getDiliveryByAuth, 
  allDilivery, 
  getForupdateDilivery, 
  updateDilivery, 
  deleteDilivery, 
  sendMail,
CompleteDiliverysendMail

} from '../controllers/diliverRole.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Create (protected)
router.post("/addDilivery", verifyToken, addDelivery);

// Get deliveries by authenticated user (protected)
router.get("/getDilivery", verifyToken, getDiliveryByAuth);

// Get all deliveries (open — you can protect this too if needed)
router.get('/allDiliveries', allDilivery);

// Get delivery by ID for update (protected)
router.get('/getForupdateDilivery/:id', getForupdateDilivery);

// Update delivery (protected)
router.put("/updateDilivery", updateDilivery);
router.post("/sendEmail", sendMail);
router.post("/CompleteDiliverysendEmail", CompleteDiliverysendMail);

// Delete delivery (protected)
router.delete("/deleteDilivery/:id", verifyToken, deleteDilivery);

// docker-compose up --build  
export default router;
