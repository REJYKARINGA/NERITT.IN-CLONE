const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./userSchema'); // Adjust the path as needed

const districtEnum = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod']
  
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDetails',
        //  // required: true
    }, 
    products: [
          {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productDetails'
      },
      name: String,
      price: Number,
      category:String,
      image: String, // Add image field for each product in the cart
      quantity: {
        type: Number,
        default: 1
      }
    }
    ],
    totalAmount: {
        type: Number,
         required: true
    },
    discountedAmount: {
        type: Number,
        defult: 0,
         required: true
    },
    offeredAmount: {
        type: Number,
        defult: 5
    },
    address: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    status: { 
        type: String,
        enum: ['pending', 'Accepted', 'shipped', 'completed', "Returned", "Return requested", 'Return Rejected', 'cancelled', 'cancelledByAdmin', 'Failed' ],
        default: 'pending'
    },
    billingDetails: {
        fatherName: {
            type: String,
             // required: true
        },
        studentName: {
            type: String,
             // required: true 
        },
        email: {
            type: String,
             // required: true
        },
        phone: {
            type: String,
             // required: true
        },
        district: {
            type: String,
            enum: districtEnum,
             // required: true
        }, 
        address: {
            type: String,
             // required: true
        },
        landmark: {
            type: String,
             // required: true
        },
        pincode: {
            type: String,
             // required: true
        },
        homeOrOffice: {
            type: String,
             // required: true
        }
    },orderId: {
        type: String, // Assuming order_id is a string
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    payment_type: {
        type: String, 
        enum: ['Cash on Delivery', 'Online Payment', 'Wallet'],
    }
});

module.exports = mongoose.model('Orders', orderSchema);