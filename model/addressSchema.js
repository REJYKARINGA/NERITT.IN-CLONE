const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true,
    enum: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod']
  },
  address: {
    type: String,
    required: true
  },
  landmark: String,
  pincode: {
    type: String,
    required: true
  },
  homeOrOffice: {
    type: String,
    enum: ['home', 'office'],
    required: true
  }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
