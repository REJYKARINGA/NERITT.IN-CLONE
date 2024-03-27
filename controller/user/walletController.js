require("../../db/mongoose")
const fs = require('fs')
const walletCollection = require('../../model/walletSchema')
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


// const getWallet = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Current page, default to 1 if not provided
//     const limit = 10; // Number of items per page

//     const count = await walletCollection.countDocuments({ user: req.user.id });
//     const totalPages = Math.ceil(count / limit);

//     const wallet = await walletCollection
//       .find({ user: req.user.id })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ createdAt: -1 }); 

//       console.log(wallet,'wallet founded')
//     if (!wallet || wallet.length === 0) {
//       return res.status(404).json({ message: 'Wallet not found' });
//     }

//     res.json({ wallet, totalPages, currentPage: page });
//   } catch (error) {
//     return next(error);
//   }
// };


const updateBalance = async (req, res) => {
  try {
    const { amount, process } = req.body;
    const wallet = await walletCollection.findOne({ userid: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    wallet.balance += amount;
    wallet.wallethistory.push({ process, amount });
    await wallet.save();
    res.json(wallet);
  } catch (error) {
    return next(error)
  }
};

module.exports = {
  // getWallet,
}
