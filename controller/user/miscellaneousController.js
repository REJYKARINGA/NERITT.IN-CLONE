require("../../db/mongoose")
const fs = require('fs')
const Cart = require('../../model/cartSchema');
const Swal = require('sweetalert2');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sizeOf = require('image-size');
const orderId = require('../../public/js/orderId')

const { ObjectId } = require('mongoose').Types;

const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;
  return megapixels < 1;
};


const testDrive = async (req, res, next) => {
  try {
    const isUser = req.session.user;

  let walletBalance = 0;

  if (req.session.user) {
    const name = req.session.user.name;
    ;
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
    res.render('user/index', { msg1: { name }, isUser, cart, totalProduct })

  }
  else {
    const school = await School.find({ blocked: false });

    res.render('user/index', { msg1: { name: 'Login' }, isUser, school })
  }
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  testDrive
}