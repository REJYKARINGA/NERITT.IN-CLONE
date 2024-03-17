require("../../db/mongoose")
const fs = require('fs')
const School = require('../../model/schoolSchema');
const Cart = require('../../model/cartSchema');
const Wallet = require('../../model/walletSchema');
const User = require('../../model/userSchema');
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


const schoolRegister = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {
      const userId = req.session.user._id;
      const user = await User.findOne({ user: userId })
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const name = req.session.user.name
      const userIdObject = new ObjectId(userId);

      const cart = await Cart.aggregate([
        {
          $match: { user: userIdObject }
        },
        {
          $unwind: "$products"
        },
        {
          $lookup: {
            from: "productDetails",
            localField: "products.product",
            foreignField: "_id",
            as: "products.productDetails"
          }
        },
        {
          $addFields: {
            "products.name": { $arrayElemAt: ["$products.productDetails.title", 0] },
            "products.category": { $arrayElemAt: ["$products.productDetails.category", 0] },
            "products.price": { $arrayElemAt: ["$products.productDetails.sales_cost", 0] },
            "products.image": { $arrayElemAt: ["$products.productDetails.gallery", 0] }
          }
        },
        {
          $group: {
            _id: "$_id",
            user: { $first: "$user" },
            products: { $push: "$products" },
            appliedCoupon: { $first: "$appliedCoupon" }
          }
        }
      ]);
      let totalProduct = 0;
      if (cart.length > 0 && cart[0].products) {
        totalProduct = cart[0].products.length;
      }

      const school = await School.find({ blocked: false });

      res.render('user/schoolRegister', { user, msg1: { name }, walletBalance, isUser, cart, totalProduct, school })
    } else {

      const school = await School.find({ blocked: false });

      res.render('user/schoolRegister', { msg1: { name: 'Login' }, school })
    }
  } catch (error) {
    return next(error)
  }

}

const createSchool = async (req, res, next) => {
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
    return next(error);
  }
};

module.exports = {
  schoolRegister,
  createSchool
}