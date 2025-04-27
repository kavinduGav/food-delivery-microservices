
import Feedback from "../models/feedback.model.js";






export const addFeedback=async(req,res,next)=>{
    const {userId,
        name,
        u_email,
        reviews,
        selectraiting,
   
        }=req.body;

    //create auto id for orderid
    function idGen(userId){
        const randomString=Math.random().toString(36).substring(2,10);
        const id='ORD'+randomString+userId;
        return id;
    }
    const petId=idGen(userId)
   

    const newItem=new Feedback({petId,userId,
        name,
        u_email,
        reviews,
        selectraiting,
        });
    try{
        await newItem.save();
        res.status(202).json({message:"feedback created successfully"});
    }catch(error){
        next(error);
    }
   
}


//get items by userid
export const getFeedbackByAuth = async (req, res, next) => {
    try{
       const customerId=req.params.id;
        const orders=await Feedback.find({userId:customerId})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};


//all items
export const allFeedback = async (req, res, next) => {
    try{
    
        const orders=await Feedback.find({})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};




export const updateFeedback =async(req,res)=>{
    const {id,...rest}=req.body
    const data=await Feedback.updateOne({_id:id},rest)
    res.send({success:true,message:"updated successfuly",data:data})
}

export const deleteFeedback = async (req, res, next) => {
    let petId=req.params.id;
    console.log(petId)
    try {
        await Feedback.findByIdAndDelete(petId);
        res.status(200).json('The Order has been deleted');
    } catch (error) {
        next(error);
    }
}

export const getFeedbackForUpdate= async (req, res) => {
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
