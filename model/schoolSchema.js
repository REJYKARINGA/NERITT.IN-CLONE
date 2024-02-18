const mongoose = require('mongoose');
const { Schema } = mongoose;

const districtList = [
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur', 
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasargod'
];

const userRole = [
    'Manager',
    'HM',
    'Teacher',
    'Other'
];

const schoolSchema = new mongoose.Schema({
    // School Details
    school_name: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    school_address: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    school_district: {
        type: String,
        required: true,
        enum: districtList
    },
    phone_number: {
        type: Number,
        required: true
    },
    mobile_number: {
        type: Number,
    },
    school_code: {
        type: String,
        unique: true,  // Remove this line if null values are allowed
        default: null, // Provide a default value if needed
    },
    school_logo: {
        type: String,
        required: true
    },
    blocked: {
        type: Boolean,
        default: true
    },
    school_state: {
        type: String,
        default: 'Kerala'
    },
    school_city: {
        type: String,
        required: true
    },
    gst: {
        type: String
    },
    created_by:{
        type : String
    },

    // User Details
    userName: {
        type: String,
        default:"",
       
    },
    userPosition: {
        type: String,
        default:"Other",
        required: true,
        enum: userRole
    }
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);

module.exports = School;


