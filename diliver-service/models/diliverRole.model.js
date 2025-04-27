import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({

    currentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },//default use for auth
    userId: {
        type: String,
        required: true,
        trim: true
    },//default use for auth
   

    
    customerName: {
       type: String,
       // type: mongoose.Schema.Types.ObjectId,
       // ref: 'Customer',
        required: true,
        default: null

    },
    restaurantName: {
        type: String,
        //ref: 'Restaurant',
        // type: mongoose.Schema.Types.ObjectId,
        //  ref: 'DeliveryPerson',
        required: true,
        default: null
    },
  

    pickupTime: {
        type: String,
        default: null
    },

    deliveryTime: {
        type: String,
        default: null
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },


    //   items: [
    //     {
    //       itemName: String,
    //       quantity: Number,
    //       price: Number
    //     }
    //   ],



      is_deliveryStatus: {
        type: Boolean,
        default:false
      },
      paymentMethod: {
        type: String,
        default: 'cash'
      },
    paymentStatus: {
        type: String||null,
        default: 'pending'
      },
});
const DiliverOrder = mongoose.model('DiliveryOrder', OrderSchema);
export default DiliverOrder;
