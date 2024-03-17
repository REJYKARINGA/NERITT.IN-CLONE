const mongoose = require('mongoose');
const { Schema } = mongoose;

// Product Offer Schema
const productOfferSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
});

// Category Offer Schema
const categoryOfferSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
});

// Referral Offer Schema
const referralOfferSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    discountPercentage: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
});

const ProductOffer = mongoose.model('ProductOffer', productOfferSchema);
const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);
const ReferralOffer = mongoose.model('ReferralOffer', referralOfferSchema);