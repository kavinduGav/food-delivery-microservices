import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    petId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    userId: {
        type: String,
        required: true,
        trim: true
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

const Feedback = mongoose.model("Feedback", itemSchema);

export default Feedback;
