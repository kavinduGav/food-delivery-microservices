import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js'
import authroutes from './routes/auth.routes.js'
import cors from 'cors';
import diliverRoutes from './routes/diliverRole.routes.js'
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=>{
    console.log('Connected to Mongodb')
}).catch((err)=>{
    console.log(err)
})

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // your frontend URL
    credentials: true, // allow cookies/authorization headers
  }));
app.use(express.json());
app.use(cookieParser());

app.listen(3002, () => {
    console.log('server listen on port 3002 -> diliver service!')
});


app.use("/api/user",userRoutes)
app.use("/api/auth",authroutes)

app.use("/api/diliver",diliverRoutes)


app.use((err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const message=err.message||'internal server error'
    return res.status(statusCode).json({
        success:false,
        message,
        statusCode,
    })
})