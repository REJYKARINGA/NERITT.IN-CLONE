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



const myAddressesPage = async (req, res, next) => {
  try {
    const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;

    const school = await School.find({ blocked: false });
    const user = await User.findById(req.session.user._id);

    const addresses = await Address.find({ userId: req.session.user._id });
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
    res.render('user/myAddresses', { msg1: { name }, walletBalance, isUser, cart, totalProduct, user, addresses, school })

  }
  else {

    res.redirect('/login')
  }
  } catch (error) {
    return next(error)
  }
}

const AddAddress = async (req, res, next) => {
  try {
    const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;
    const user = await User.findById(req.session.user._id);

    const school = await School.find({ blocked: false });
    const addresses = await Address.find();

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
    res.render('user/myAddressAdd', { user, addresses, msg1: { name }, walletBalance, isUser, cart, totalProduct, school })

  }
  else {

    res.redirect('/login')
  }
  } catch (error) {
    return next(error)
  }
}

const addAddressPost = async (req, res, next) => {
  try {

    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
    const newAddress = new Address({ userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
    await newAddress.save();

    res.redirect('/account/addresses')

  } catch (error) {
    return next(error);
  }
}

const editAddress = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const user = await User.findById(req.session.user._id);
    const school = await School.find({ blocked: false });

    const name = req.session.user.name;
    const address = await Address.findById(req.params.id);

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
    res.render('user/myaddressEdit', { user, msg1: { name }, walletBalance, isUser, cart, totalProduct, school, address });
  } catch (error) {
    return next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
    const school = await School.find({ blocked: false });

    await Address.findByIdAndUpdate(req.params.id, { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
    res.redirect('/account/addresses');
  } catch (error) {
    return next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {

    const isUser = req.session.user;

    if (!req.session.user) {
      return res.redirect('/login');
    }

    await Address.findByIdAndDelete(req.params.id);
    res.redirect('/account/addresses');
  } catch (error) {
    return next(error);
  }
};



module.exports = {
  myAddressesPage,
  AddAddress,
  addAddressPost,
  editAddress,
  updateAddress,
  deleteAddress
}