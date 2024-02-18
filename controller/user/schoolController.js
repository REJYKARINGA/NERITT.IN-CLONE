require("../../db/mongoose")
const fs = require('fs')
const School = require('../../model/schoolSchema');
const Cart = require('../../model/cartSchema');
const Swal = require('sweetalert2');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer'); 
const sizeOf = require('image-size'); 
const orderId = require('../../public/js/orderId')

const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;  
  return megapixels < 1;
};


const schoolRegister = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const userId = req.session.user._id;
      const name = req.session.user.name
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status'
      });
  
      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }
      console.log(totalProduct, "totalProduct")
  
      const school = await School.find({ blocked: false });
  
      res.render('user/schoolRegister', { user, msg1: { name }, isUser, cart, totalProduct, school })
    } else {
  
      const school = await School.find({ blocked: false });
  
      res.render('user/schoolRegister', { msg1: { name: 'Login' }, school })
    }
  
  }
  
const createSchool = async (req, res) => {
    try {
  
  
      const { school_name,
        email,
        school_address,
        pincode,
        school_district,
        phone_number,
        school_code,
        school_state,
        userName,
        userPosition,
        school_city,
        created_by,
        gst } = req.body;
  
       const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : null;
  
       const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;
  
       if (
        (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))) {
         console.log('Invalid image dimensions');
        if (school_logoPath) {
          fs.unlinkSync(school_logoPath); 
        }
        return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
      }
  
       const newSchool = new School({
        school_name,
        email,
        school_address,
        pincode,
        school_district,
        userName,
        userPosition,
        phone_number,
        school_code,
        school_state,
        school_city,
        created_by,
        gst,
        school_logo: school_logoPath,
      });
  
       await newSchool.save();
  
      res.redirect('/school-registration');
    } catch (error) {
      console.error('Error creating Schools:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };

module.exports = {
    schoolRegister,
      createSchool
    }