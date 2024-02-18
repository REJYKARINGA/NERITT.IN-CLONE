require("../../db/mongoose")
const fs = require('fs')
const User = require('../../model/userSchema')
const School = require('../../model/schoolSchema');
const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');
const Address = require('../../model/addressSchema');
const Cart = require('../../model/cartSchema');
const Order = require('../../model/orderSchema');
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

const myAccountPage = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
      const user = await User.findById(req.session.user._id);
      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;
  
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
  
      res.render('user/myAccount', { user, msg1: { name }, isUser, cart, totalProduct, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const myAddressesPage = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
  
      const school = await School.find({ blocked: false });
      const user = await User.findById(req.session.user._id);
  
      const addresses = await Address.find({ userId: req.session.user._id });
  
      console.log(addresses, "Here is your addresses")
  
  
      const userId = req.session.user._id;
  
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
      res.render('user/myAddresses', { msg1: { name }, isUser, cart, totalProduct, user, addresses, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const AddAddress = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
      const user = await User.findById(req.session.user._id);
  
      const school = await School.find({ blocked: false });
      const addresses = await Address.find();
  
      const userId = req.session.user._id;
  
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
  
      res.render('user/myAddressAdd', { user, addresses, msg1: { name }, isUser, cart, totalProduct, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const addAddressPost = async (req, res) => {
    try {
  
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
  
      const { userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
      const newAddress = new Address({ userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
      await newAddress.save();
  
      res.redirect('/account/addresses')
  
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  }

const renderEditForm = async (req, res) => {
    try {
      const isUser = req.session.user;
  
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
      const user = await User.findById(req.session.user._id);
      const school = await School.find({ blocked: false });
  
      const name = req.session.user.name;
      const address = await Address.findById(req.params.id);
  
      const userId = req.session.user._id;
  
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
  
      res.render('user/myaddressEdit', { user, msg1: { name }, isUser, cart, totalProduct, school, address });
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  };

const updateAddress = async (req, res) => {
    try {
  
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
      const { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
      const school = await School.find({ blocked: false });
  
      await Address.findByIdAndUpdate(req.params.id, { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
      res.redirect('/account/addresses');
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  };

const deleteAddress = async (req, res) => {
    try {
  
      const isUser = req.session.user;
  
  
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
  
      await Address.findByIdAndDelete(req.params.id);
      res.redirect('/account/addresses');
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  };

const myPersonalData = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
  
      const user = await User.findById(req.session.user._id);
  
      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;
  
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
      res.render('user/myPersonalData', { user, msg1: { name }, isUser, cart, totalProduct, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const updateUserProfile = async (req, res) => {
    try {
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
      const { email, name, phone, password } = req.body;
      const userId = req.session.user._id;
  
      const existingUser = await User.findById(userId);
  
      const profileImage = req.files && req.files['profileImage'] ? req.files['profileImage'][0].path : null;
  
      existingUser.email = email;
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = password;
  
      if (profileImage) {
        existingUser.profileImage = profileImage;
  
        if (existingUser.profileImage !== req.session.user.profileImage) {
          if (fs.existsSync(req.session.user.profileImage)) {
            fs.unlinkSync(req.session.user.profileImage); 
          } else {
            console.log('Old profile image does not exist.');
          }
        }
      }
  
      await existingUser.save();
  
      res.redirect('/account/personal-data');
    } catch (error) {
      console.error(error.message);
      res.render('error');
    }
  };
  
const updateUserPassword = async (req, res) => {
    try {
      if (!req.session.user) {
        console.log('Unauthorized. Please log in.');
        return res.redirect('/login');
      }
  
      const { password, password_confirmation } = req.body;
  
      console.log(req.body.password, "hello password")
      console.log(req.body.password_confirmation, "hello password_confirmation")
      if (!password) {
        return res.status(400).send("Password is required");
      }
  
      if (password !== password_confirmation) {
        return res.status(400).send("Passwords do not match");
      }
  
      const userId = req.session.user._id;
  
      const existingUser = await User.findById(userId);
  
      existingUser.password = password;
  
      await existingUser.save();
  
      res.redirect('/account/personal-data');
    } catch (error) {
      console.error(error.message);
      res.render('error');
    }
  };
  
const myPayment = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
  
      const school = await School.find({ blocked: false });
  
      const userId = req.session.user._id;
      const user = await User.findById(req.session.user._id);
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
  
      res.render('user/myPayment', { msg1: { name }, isUser, user, cart, totalProduct, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const myOrder = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
  
      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;
      const user = await User.findById(req.session.user._id);
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
      res.render('user/myOrders', { msg1: { name }, isUser, user, cart, totalProduct, school })
  
    }
    else {
  
      res.redirect('/login')
    }
  }

const myWishlist = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
      const name = req.session.user.name;
  
      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;
      const user = await User.findById(req.session.user._id);
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
      res.render('user/myWishlist', { msg1: { name }, isUser, user, cart, totalProduct, school })
  
    }
    else {
  
  
      res.redirect('/login')
    }
  }

module.exports = {
    myAccountPage,
     myAddressesPage,
     AddAddress,
     addAddressPost,
     renderEditForm,
     updateAddress,
     deleteAddress,
     myPersonalData,
     updateUserProfile,
     updateUserPassword,
     myPayment,
     myOrder,
     myWishlist
   }