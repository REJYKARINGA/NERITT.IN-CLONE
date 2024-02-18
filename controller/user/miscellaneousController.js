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


const testDrive = async (req, res) => {
  const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;

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
    res.render('user/index', { msg1: { name }, isUser, cart, totalProduct, school })

  }
  else {
    const school = await School.find({ blocked: false });

    res.render('user/index', { msg1: { name: 'Login' }, isUser, school })
  }
}

module.exports = {
    testDrive
    }