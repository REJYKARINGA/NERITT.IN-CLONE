const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    short_description: {
        type: String
    },
    description: {
        type: String
    },
    sku: {
        type: String
    },
    hsn: {
        type: String
    }, 
    price: {
        type: Number
    },
    sales_cost: {
        type: Number
    },
    stock_status: {
        type: String,
        enum: ['In Stock', 'Out Of Stock']
    },
    quantity: { 
        type: Number, 
        required: true, 
        default: 1 },
    
    delivery_charge: {
        type: Number
    },
    cgst: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 100; // Assuming that CGST should be between 0 and 100
            },
            message: 'CGST must be a percentage between 0 and 100',
        }, 
    },

    sgst: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value) {
                return value >= 0 && value <= 100; // Assuming that SGST should be between 0 and 100
            },
            message: 'SGST must be a percentage between 0 and 100',
        },
    },
    gallery: [{
        type: String,
        required: true,
    }],
    image: {
        type: String

    },
    school: [{
        type: Schema.Types.ObjectId,
        ref: 'School',
    }],
    category: [{
        type: Schema.Types.ObjectId, 
        ref: 'categoryDetails'
    }],
    gender: {
        type: Number,
        enum: [0, 1, 2] // 0: GIRL, 1: BOY, 2: UNISEX
    },
    classes: [{
        type: Number,
        enum: [0, 1, 2] // 0: LKG, 1: UKG
    }],
    // agent: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Agent'
    // },
    // brand: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Brand'
    agent: {
        type: Number,
        enum: [1, 2, 3] // 0: IDEAL UNIFORMS, 1: NERITT.IN, 
    },
    brand: {
        type: String,
        default: "Neritt.in"
    },
    has_variant: {
        type: Boolean,
        default: false
    },
    "color-check": {
        type: String
    },
    "size-check": {
        type: String
    },
    color: {
        type: String
    },
    size: {
        type: String
    },
    blocked: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

const productschema = mongoose.model('productDetails', productSchema);

module.exports = productschema;