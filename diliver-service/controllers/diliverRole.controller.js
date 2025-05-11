
import DiliverOrder from "../models/diliverRole.model.js"; 

import bodyParser  from 'body-parser';
import nodemailer  from 'nodemailer';





export const addDelivery = async (req, res, next) => {
    const {
      email,
        customerName,
        restaurantName,
        pickupTime,
        deliveryTime,
        deliveryAddress,
        totalAmount,
        createdAt,
        paymentMethod,
        paymentStatus,
      } = req.body;
    
      // Ensure that req.user contains the userId from the decoded token
      const userId = req.user.id; // 🟢 Get userId from the decoded token
    
      // Make sure userId is not undefined or null
      if (!userId) {
        return res.status(400).json({ message: "User ID is missing from token" });
      }
    
      const newItem = new DiliverOrder({
        userId, // 🟢 Store the userId in the database
        email,
        customerName,
        restaurantName,
        pickupTime,
        deliveryTime,
        deliveryAddress,
        totalAmount,
        createdAt,
        paymentMethod,
        paymentStatus,
      });
    
      try {
        await newItem.save();
        res.status(202).json({ message: "Delivery created successfully" });
        
      } catch (error) {
        next(error); // Pass the error to your error handling middleware
      }
  };
  

  export const sendMail=async (req, res) => {
    try {
      const { email } = req.body;
  
     console.log(email+"==========================");
  
      // Create a Nodemailer transporter
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shehansalitha1999@gmail.com',
          pass: 'hxjs rkrt bocu bdvj'
        }
      });
  
      // Send a thank you email
      await transporter.sendMail({
        from: 'shehansalitha1999@gmail.com',
        to: email,
        subject: 'Thank You for Selected Dilivery!',
        text: 'Your Dilivery is Started!'
        //         subject: 'Thank You for Your valuable feedback!',
        // text: 'Thank you for placing your order with us!'
      });
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };




  export const CompleteDiliverysendMail=async (req, res) => {
    try {
      const { email } = req.body;
  
     console.log(email+"==========================");
  
      // Create a Nodemailer transporter
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'shehansalitha1999@gmail.com',
          pass: 'hxjs rkrt bocu bdvj'
        }
      });
  
      // Send a thank you email
      await transporter.sendMail({
        from: 'shehansalitha1999@gmail.com',
        to: email,
        subject: 'Thank You for Selected Dilivery!',
        text: 'Your Dilivery  Successfull!'
        //         subject: 'Thank You for Your valuable feedback!',
        // text: 'Thank you for placing your order with us!'
      });
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

//get items by userid
export const getDiliveryByAuth = async (req, res) => {
    try {
        const userId = req.user.id; // 🟢 Decoded from token (req.user set by verifyToken)
    
        // Find deliveries for this user
        const deliveries = await DiliverOrder.find({ userId: userId });
    
        res.status(200).json(deliveries);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    
  };
  

//all items
export const allDilivery = async (req, res, next) => {
    try{
    
        const orders=await DiliverOrder.find({})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};




export const updateDilivery =async(req,res)=>{
    const {id,...rest}=req.body
    const data=await DiliverOrder.updateOne({_id:id},rest)
    res.send({success:true,message:"updated successfuly",data:data})
}

export const deleteDilivery = async (req, res, next) => {
    let petId=req.params.id;
    console.log(petId)
    try {
        await DiliverOrder.findByIdAndDelete(petId);
        res.status(200).json('The Order has been deleted');
    } catch (error) {
        next(error);
    }
}

export const getForupdateDilivery = async (req, res) => {
    const id = req.params.id;


    try {
        const delivery = await DiliverOrder.findById(id);

        if (!delivery) {
            return res.status(404).send({ success: false, message: "Delivery not found" });
        }

        res.send({ success: true, message: "Delivery fetched successfully", data: delivery });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};
