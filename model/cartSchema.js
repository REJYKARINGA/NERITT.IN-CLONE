// category.js (category schema/model)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDetails',
    required: true
  }, 

  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productDetails'
      },
      name: String,
      category: String, 
      price: Number,
      image: String, // Add image field for each product in the cart
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  appliedCoupon: {
    type: String,
    default: null
  }
  
});

module.exports = mongoose.model('Cart', cartSchema);