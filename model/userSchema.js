const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true},
    email:{
        type:String,
        unique:true,
        required:true
        },
    phone:{
            type:Number,
            // unique:true,
            required:true
            },
    password:{
        type:String,
        required:true
    },
    blocked: { 
        type: Boolean, 
        default: false 
    },
    profileImage:{
        type:String,
        default: '/public/images/Illustration of businessman.jpg'

    },
    otp: {
        code: {
            type: String,
            default: null
        },
        expiration: {
            type: Date,
            default: null
        }
    }
},  { timestamps: true })

const schemacollection = new mongoose.model('userDetails',schema)

module.exports =schemacollection