const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = new Schema({
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
          price: Number,
          image: String, // Add image field for each product in the cart
          quantity: {
            type: Number,
            default: 1
          }
        }
      ],
      
    },{ timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);