const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    // required: true
  },
  discountType: { 
    type: String,
    enum: ['percentage', 'fixedAmount'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minimumAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxUses: {
    type: Number,
    default: 100 // Unlimited uses
    // default: null // Unlimited uses
  },
  usedByUsers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'userDetails' 
  }], // Keep track of users who have used this coupon
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);