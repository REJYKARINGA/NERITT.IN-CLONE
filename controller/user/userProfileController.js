require("../../db/mongoose")
const fs = require('fs')
const User = require('../../model/userSchema')
const School = require('../../model/schoolSchema');
const Address = require('../../model/addressSchema');
const Cart = require('../../model/cartSchema');
const Wallet = require('../../model/walletSchema');
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

let walletBalance = 0;

const myAccountPage = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (req.session.user) {
      const name = req.session.user.name;
      const user = await User.findById(req.session.user._id);
      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }
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
      res.render('user/myAccount', { user, msg1: { name }, walletBalance, isUser, cart, totalProduct, school })

    }
    else {

      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }
}

const myPersonalData = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (req.session.user) {
      const name = req.session.user.name;

      const user = await User.findById(req.session.user._id);

      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

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
      res.render('user/myPersonalData', { user, msg1: { name }, walletBalance, isUser, cart, totalProduct, school })

    }
    else {

      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }
}

const updateUserProfile = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const { email, name, phone, password } = req.body;
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

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
    return next(error)
  }
};

const updateUserPassword = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { password, password_confirmation } = req.body;

    if (!password) {
      return res.status(400).send("Password is required");
    }

    if (password !== password_confirmation) {
      return res.status(400).send("Passwords do not match");
    }

    const userId = req.session.user._id;
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const existingUser = await User.findById(userId);

    existingUser.password = password;

    await existingUser.save();

    res.redirect('/account/personal-data');
  } catch (error) {
    return next(error)
  }
};

const myPayment = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (req.session.user) {
      const name = req.session.user.name;

      const school = await School.find({ blocked: false });

      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }
      const user = await User.findById(req.session.user._id);
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

      res.render('user/myPayment', { msg1: { name }, walletBalance, isUser, user, cart, totalProduct, school })

    }
    else {

      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }
}

const myOrder = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (req.session.user) {
      const name = req.session.user.name;

      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }
      const user = await User.findById(req.session.user._id);
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
      res.render('user/myOrders', { msg1: { name }, walletBalance, isUser, user, cart, totalProduct, school })

    }
    else {

      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }
}

const myWishlist = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (req.session.user) {
      const name = req.session.user.name;

      const school = await School.find({ blocked: false });
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }
      const user = await User.findById(req.session.user._id);
      const cart = await Cart.aggregate([
        {
          $match: { user: userId }
        },
        {
          $lookup: {
            from: 'productDetails',
            localField: 'products.product',
            foreignField: '_id',
            as: 'products'
          }
        },
        {
          $project: {
            products: {
              $map: {
                input: '$products',
                as: 'product',
                in: {
                  title: '$$product.title',
                  sales_cost: '$$product.sales_cost',
                  gallery: '$$product.gallery',
                  quantity: '$$product.quantity',
                  stock_status: '$$product.stock_status'
                }
              }
            }
          }
        }
      ]);

      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }
      res.render('user/myWishlist', { msg1: { name }, walletBalance, isUser, user, cart, totalProduct, school })

    }
    else {
      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  myAccountPage,
  myPersonalData,
  updateUserProfile,
  updateUserPassword,
  myPayment,
  myOrder,
  myWishlist
}