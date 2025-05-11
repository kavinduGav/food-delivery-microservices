import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
 
   userId: {
           type: mongoose.Schema.Types.ObjectId, // If userId is a reference to the User collection
           required: true,
         },
   
    name : {
        type: String,
        required: true,
        trim: true
    },
    u_email:{
        type: String,
        required: true,
        trim: true
    },
   
    reviews : {
        type: String||null,
        trim: true
    },
   
   
    selectraiting: {
        type: String||null,
      
        trim: true
    },
   
   
  
  
}, { timestamps: true });

const Feedback = mongoose.model("FeedbackNew11", itemSchema);

export default Feedback;
