import  jwt from 'jsonwebtoken'
import { errorHandler } from './error.js';

export const verifyToken=(req,res,next)=>{
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; // Extract token from "Authorization: Bearer <token>"
 
     if (!token) {
       return res.status(401).json({ message: 'No token, authorization denied' });
     }
   
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded.user; // Attach user info to request object (user ID, role, etc.)
       next();
     } catch (err) {
       res.status(401).json({ message: 'Token is not valid' });
     }
}