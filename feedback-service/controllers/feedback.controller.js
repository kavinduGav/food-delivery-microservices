
import Feedback from "../models/feedback.model.js";

import bodyParser  from 'body-parser';
import nodemailer  from 'nodemailer';







export const addFeedback = async (req, res, next) => {
    const {
        name,
        u_email,
        reviews,
        selectraiting,

    } = req.body;

    //create auto id for orderid
    const userId = req.user.id; // 🟢 Get userId from the decoded token

    // Make sure userId is not undefined or null
    if (!userId) {
        return res.status(400).json({ message: "User ID is missing from token" });
    }

    const newItem = new Feedback({
        userId,
        name,
        u_email,
        reviews,
        selectraiting,
    });
    try {
        await newItem.save();
        res.status(202).json({ message: "feedback created successfully" });
    } catch (error) {
        next(error);
    }

}


//get items by userid
export const getFeedbackByAuth = async (req, res, next) => {
    // try{
    //    const customerId=req.params.id;
    //     const orders=await Feedback.find({userId:customerId})
    //     res.json(orders)
    // }catch(error){
    //     console.log(error)
    //     res.status(500).json({error:'Internal server error'})
    // }


    try {
        const userId = req.user.id; // 🟢 Decoded from token (req.user set by verifyToken)

        // Find deliveries for this user
        const deliveries = await Feedback.find({ userId: userId });

        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


export const FeedbacksendMail = async (req, res) => {
    try {
        const { email } = req.body;

        console.log(email + "==========================");

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
            subject: 'Thank You for Your valuable feedback!',
            text: 'Thank you for placing your order with us!'
        });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//all items
export const allFeedback = async (req, res, next) => {
    try {

        const orders = await Feedback.find({})
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' })
    }
};




export const updateFeedback = async (req, res) => {
    const { id, ...rest } = req.body
    const data = await Feedback.updateOne({ _id: id }, rest)
    res.send({ success: true, message: "updated successfuly", data: data })
}

export const deleteFeedback = async (req, res, next) => {
    let petId = req.params.id;
    console.log(petId)
    try {
        await Feedback.findByIdAndDelete(petId);
        res.status(200).json('The Order has been deleted');
    } catch (error) {
        next(error);
    }
}

export const getFeedbackForUpdate = async (req, res) => {
    const id = req.params.id;

    try {
        const discount = await Feedback.findById(id);

        if (!discount) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        res.send({ success: true, message: "User fetched successfully", data: discount });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};
