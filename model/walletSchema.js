const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userDetails',
        // required: true
    },
    balance:{
        type:Number,
        default:0
    },
    walletHistory:[{
        process:{
            type:String
        },
        orderId: {
            type: String
        },
        description: {
            type: String
        },
        amount:{
            type:Number
        },
        balance: {
            type: Number
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }]
});

const walletCollection = mongoose.model('Wallet', walletSchema); // Adjust model name if needed

module.exports = walletCollection;