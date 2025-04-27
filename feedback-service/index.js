import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js'
import authroutes from './routes/auth.routes.js'

import feedbackRoutes from './routes/feedback.routes.js'
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=>{
    console.log('Connected to Mongodb')
}).catch((err)=>{
    console.log(err)
})

const app = express();
app.use(express.json());
app.use(cookieParser());

app.listen(3001, () => {
    console.log('server listen on port 3001! -> feedback service')
});


app.use("/api/user",userRoutes)
app.use("/api/auth",authroutes)

app.use("/api/feedback",feedbackRoutes)


app.use((err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const message=err.message||'internal server error'
    return res.status(statusCode).json({
        success:false,
        message,
        statusCode,
    })
})