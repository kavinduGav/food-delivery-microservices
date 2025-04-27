
import DiliverOrder from "../models/diliverRole.model.js"; 






export const addDilivery=async(req,res,next)=>{
    const {userId,
        customerName,
        restaurantName,
        pickupTime,
        deliveryTime,
        deliveryAddress,
        totalAmount,
        createdAt,
        paymentMethod,
        paymentStatus
        }=req.body;

    //create auto id for orderid
    function idGen(userId){
        const randomString=Math.random().toString(36).substring(2,10);
        const id='ORD'+randomString+userId;
        return id;
    }
    const currentId=idGen(userId)
   

    const newItem=new DiliverOrder({currentId,userId,
        customerName,
        restaurantName,
        pickupTime,
        deliveryTime,
        deliveryAddress,
        totalAmount,
        createdAt,
        paymentMethod,
        paymentStatus
        });
    try{
        await newItem.save();
        res.status(202).json({message:"diliver  successfully"});
    }catch(error){
        next(error);
    }
   
}


//get items by userid
export const getDiliveryByAuth = async (req, res, next) => {
    try{
       const customerId=req.params.id;
        const orders=await DiliverOrder.find({userId:customerId})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
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

export const getForupdateDilivery= async (req, res) => {
    const id = req.params.id;

    try {
        const discount = await DiliverOrder.findById(id);

        if (!discount) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        res.send({ success: true, message: "User fetched successfully", data: discount });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};

