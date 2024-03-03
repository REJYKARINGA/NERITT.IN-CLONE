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




// Get user's wallet
const getWallet = async (req, res) => {
  try {
    const wallet = await walletCollection.findOne({ userid: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user's wallet balance
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getWallet,
    // updateBalance
}
