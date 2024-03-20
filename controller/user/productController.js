require("../../db/mongoose")
const fs = require('fs')
const User = require('../../model/userSchema')
const School = require('../../model/schoolSchema');
const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');
const Address = require('../../model/addressSchema');
const Cart = require('../../model/cartSchema');
const Order = require('../../model/orderSchema');
const Wallet = require('../../model/walletSchema');
const Wishlist = require('../../model/wishlistSchema');
const Coupon = require('../../model/couponSchema');

const { ObjectId } = require('mongoose').Types;
const Swal = require('sweetalert2');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sizeOf = require('image-size');
const orderId = require('../../public/js/orderId')
const Razorpay = require('razorpay');
const dotenv = require("dotenv");
dotenv.config({ path: './view/config.env' })
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;
  return megapixels < 1;
};


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});




const neritt = async (req, res, next) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0;

    if (req.session.user) {
      const name = req.session.user.name;
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const category = await Category.find();

      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status category'
      });

      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }


      const school = await School.find({ blocked: false });

      res.render('user/landingPage', {
        msg1: { name },
        isUser,
        cart,
        category,
        school,
        totalProduct,
        walletBalance
      });

    } else {
      const category = await Category.find();
      const school = await School.find({ blocked: false });
      res.render('user/landingPage', {
        msg1: { name: 'Login' },
        category,
        school,
        totalProduct,
        isUser,
        walletBalance
      });
    }
  } catch (error) {
    return next(error);
  }
}



const category = async (req, res, next) => {
  try {
    const isLogin = await User.findOne({ email: req.session.email, blocked: false })
    if (isLogin) {

      const isUser = req.session.user;

      let walletBalance = 0;

      if (req.session.user) {


        const name = req.session.user.name;
        const category = await Category.find();


        const school = await School.find({ blocked: false });


        res.render('user/allCategory', { msg1: { name }, walletBalance, isUser, category, school });

      } else {
        const category = await Category.find();

        const school = await School.find({ blocked: false });

        res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance, isUser, category, school, });

      }
    } else {
      delete req.session.user;
      const category = await Category.find();

      const school = await School.find({ blocked: false });
      isUser = ''
      let walletBalance = 0
      res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance, category, school, isUser });
    }
  } catch (error) {
    return next(error)
  }

}

const getSchoolProduct = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {
      const name = req.session.user.name;
      const category = await Category.find();
      const product = await Product.find({ blocked: false });
      const school = await School.find({ blocked: false });

      res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance, category, school, product });


    }
    else {
      const category = await Category.find();
      const product = await Product.find({ blocked: false });
      const school = await School.find({ blocked: false });


      res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance, category, school, product });
    }
  } catch (error) {
    return next(error)
  }
}

const displayProducts = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {
      const name = req.session.user.name;

      const schoolId = req.query.sch;
      const categoryId = req.query.value || '';
      let productsQuery = { blocked: false };
      if (schoolId) {
        productsQuery.school = schoolId;
      }
      if (categoryId) {
        productsQuery.category = categoryId || '';
      }
      const products = await Product.find(productsQuery)
        .populate({
          path: 'school',
          model: 'School',
          select: 'school_name school_logo school_address'
        })
        .populate('category')
        .exec();
      const schoolData = await School.findById(schoolId)

      const category = await Category.find({});
      const school = await School.find({ blocked: false });

      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status category'
      });

      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }

      res.render('user/schoolProducts', { msg1: { name }, walletBalance, isUser, cart, totalProduct, products, school, category, schoolData });


    }
    else {
      const schoolId = req.query.sch;
      const categoryId = req.query.value || '';

      let productsQuery = { blocked: false };
      if (schoolId) {
        productsQuery.school = schoolId;
      }
      if (categoryId) {
        productsQuery.category = categoryId;
      }
      const products = await Product.find(productsQuery)
        .populate({
          path: 'school',
          model: 'School',
          select: 'school_name school_logo school_address'
        })
        .populate('category')
        .exec();
      const schoolData = await School.findById(schoolId)
      const category = await Category.find({});
      const school = await School.find({ blocked: false });


      res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance, isUser, products, school, category, schoolData });
    }
  } catch (error) {
    return next(error)
  }
}

const showProduct = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {
      const name = req.session.user.name;
      const productId = req.params.id;

      if (!productId) {

        res.status(400).send('Product ID is missing');
        return;
      }

      const products = await Product.find({ _id: productId, blocked: false })
        .populate('school').populate('category')
        .exec();

      if (products.length > 0) {
        const product = products[0];

        if (product.school.length > 0) {
          const school = product.school[0];
        }
      }
      const schoolId = products.school ? products.school._id : null;
      const productsAll = await Product.find({ school: { $in: [schoolId] }, blocked: false })
        .populate('school')
        .exec();
      const category = await Category.find({});
      const school = await School.find({ blocked: false });


      req.session.productsAll = productsAll;

      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status category'
      });

      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }
      res.render('user/product', { msg1: { name }, walletBalance, isUser, cart, totalProduct, products, school, category, productsAll });


    }
    else {
      const productId = req.params.id;
      if (!productId) {

        res.status(400).send('Product ID is missing');
        return;
      }
      try {
        const products = await Product.find({ _id: productId, blocked: false })
          .populate('school').populate('category')
          .exec();

        const schoolId = products.school ? products.school._id : null;
        const productsAll = await Product.find({ school: { $in: [schoolId] }, blocked: false })
          .populate('school')
          .exec();
        const category = await Category.find({});
        const school = await School.find({ blocked: false });

        res.render('user/product', { msg1: { name: 'Login' }, walletBalance, isUser, products, school, category, productsAll });
      } catch (error) {
        return next(error);
      }


    }
  } catch (error) {
    return next(error)
  }
}

const addToWishlist = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }

    const existingProductIndex = wishlist.products.findIndex(
      item => item.product.toString() === productId
    );

    if (existingProductIndex !== -1) {
      return res.redirect(`/view-product/${productId}?alreadyInWishlist=true`);
    }
    wishlist.products.push({
      product: productId,
      name: product.title,
      category: product.category,
      price: product.sales_cost,
      image: product.gallery.length > 0 ? product.gallery[0] : null
    });

    await wishlist.save();

    return res.redirect(`/view-product/${productId}?addedInWishlist=true`);
  } catch (error) {
    return next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.productId;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).send('Wishlist not found');
    }
    wishlist.products = wishlist.products.filter(item => item.product.toString() !== productId);
    await wishlist.save();

    res.redirect('/wishlist');
  } catch (error) {
    return next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId();

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }


    const addresses = await Address.find({ userId: req.session.user._id });


    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity category'
    });

    if (!cart || (cart.products && cart.products.length === 0)) {
      return res.redirect('/cart');
    }

    const { couponCode } = req.body;
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(400).json({ success: false, invalidCoupon: true, message: 'Invalid coupon code' });
    }

    if (coupon.usedByUsers.includes(userId)) {
      return res.status(200).json({ success: false, alreadyUsed: true, message: 'You have already used this coupon' });
    }
    coupon.usedByUsers.push(userId);

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon has reached maximum usage limit' });
    }
    const currentDate = new Date();
    if (currentDate.getTime() < coupon.startDate.getTime() || currentDate.getTime() > coupon.endDate.getTime()) {
      return res.status(400).json({ success: false, message: 'Coupon is expired' });
    }

    let totalAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totaldeliveryCost = 0;
    let finalAmount = 0;

    if (cart && cart.products) {
      for (const product of cart.products) {

        const products = await Product.find({ _id: product.product.id, blocked: false })
        const cgstValue = products[0].cgst;
        const sgstValue = products[0].sgst;
        const deliveryCharge = products[0].delivery_charge;

        totalAmount += product.price * product.quantity;
        totalCGST += (cgstValue / 100) * product.price * product.quantity;
        totalSGST += (sgstValue / 100) * product.price * product.quantity;
        totaldeliveryCost += deliveryCharge * product.quantity;
        finalAmount = totalAmount + totalCGST + totalSGST + totaldeliveryCost
      }
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (coupon.discountValue / 100) * totalAmount;
    } else if (coupon.discountType === 'fixedAmount') {
      discount = coupon.discountValue;
    }
    let discountedTotal = finalAmount - discount;

    if (discountedTotal < coupon.minimumAmount) {
      discountedTotal = coupon.minimumAmount;
    }
    coupon.usedCount += 1;

    await coupon.save();
    const name = req.session.user.name;
    const school = await School.find({ blocked: false });
    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }

    discountedTotal = discountedTotal - 1;
    res.status(200).json({ success: true, updatedTotalAmount: discountedTotal, discount });

  } catch (error) {
    return next(error);
  }
};

const removeCoupon = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { couponCode } = req.body;
console.log(couponCode,'couponCode found')
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const userId = req.session.user._id;
    if (coupon.usedByUsers.includes(userId)) {
      coupon.usedByUsers.pull(userId); // Remove the user from the coupon's usedByUsers array
      coupon.usedCount -= 1; // Decrease the usedCount
      await coupon.save();

      return res.status(200).json({ success: true, message: 'Coupon removed successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'User has not used this coupon' });
    }
  } catch (error) {
    return next(error);
  }
};



const showCheckoutPage = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId();

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const addresses = await Address.find({ userId: req.session.user._id });

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity category'
    });

    if (!cart || (cart.products && cart.products.length === 0)) {
      return res.redirect('/cart');
    }

    let totalAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totaldeliveryCost = 0;
    let finalAmount = 0;

    if (cart && cart.products) {
      for (const product of cart.products) {
        const products = await Product.find({ _id: product.product.id, blocked: false });
        const cgstValue = products[0].cgst;
        const sgstValue = products[0].sgst;
        const deliveryCharge = products[0].delivery_charge;

        totalAmount += product.price * product.quantity;
        totalCGST += (cgstValue / 100) * product.price * product.quantity;
        totalSGST += (sgstValue / 100) * product.price * product.quantity;
        totaldeliveryCost += deliveryCharge * product.quantity;
        finalAmount = totalAmount + totalCGST + totalSGST + totaldeliveryCost;

        const categories = products[0].category.map(cat => cat.category_name);
        product.category = categories;
      }
    }
    const name = req.session.user.name;
    const school = await School.find({ blocked: false });
    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }
    let discount = 0



    const coupons = await Coupon.find({
      isActive: true,
      maxUses: { $gt: 0, $ne: null },
      usedByUsers: { $ne: userId }
    });

    res.render('user/checkout', {
      cart,
      addresses,
      totalAmount,
      totalCGST,
      totalSGST,
      totaldeliveryCost,
      msg1: { name },
      walletBalance,
      school,
      isUser,
      totalProduct,
      finalAmount,
      ordId,
      discount,
      coupons
    });
  } catch (error) {
    return next(error);
  }
};


 

const storeCheckout = async (req, res, next) => {
  try {
    const isUser = req.session.user;
    let walletBalance = 0;
    const ordId = orderId();

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }
    const name = req.session.user.name;
    const currentUser = req.session.user;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity category'
    });

    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }
    const school = await School.find({ blocked: false });

    const { fatherName, studentName, email, phone, district, addressId, address, landmark, pincode, homeOrOffice, products, category, finalAmount, deliveryType, order_id, discount } = req.body;
    let offeredAmount = 5;
    const paymentTypeValue = req.body.payment_type;
    let paymentType;
    if (paymentTypeValue === '1') {
      paymentType = 'Cash on Delivery';
    } else if (paymentTypeValue === '2') {
      paymentType = 'Online Payment';
    } else if (paymentTypeValue === '3') {
      paymentType = 'Wallet';
    } else {

    }

    if (finalAmount < 1000 && paymentType === 'Cash on Delivery') {
      return res.redirect('/checkout?lessThanLimit=true');
    }

    if (paymentType === 'Wallet' && (!wallet || wallet.balance < finalAmount)) {
      return res.redirect('/checkout?outOfStock=true');
    }

    const isExistingUser = await Cart.findOne({ user: currentUser._id }).populate('products');

    const order = new Order({
      user: req.session.user._id,
      products: isExistingUser.products.map(prod => prod),
      totalAmount: finalAmount,
      discountedAmount: discount,
      offeredAmount,
      category,
      address: addressId,
      billingDetails: {
        fatherName,
        studentName,
        email,
        phone,
        district,
        address,
        landmark,
        pincode,
        homeOrOffice
      },
      payment_type: paymentType,
      orderId: order_id,
      deliveryType,
      status: 'pending'
    });

    await order.save();

    if (paymentType === 'Wallet') {
      wallet.balance -= finalAmount;
      await wallet.save();
      walletBalance = wallet.balance;
    }
    for (const product of isExistingUser.products) {
      await Product.findByIdAndUpdate(product.product._id, { $inc: { quantity: -product.quantity } });
    }
    const isCartExist = await Cart.findOneAndUpdate({ user: currentUser._id }, { products: [] });


    const isPaymentSuccessful = true;

    if (isPaymentSuccessful) {
      order.status = 'Accepted';
    } else {
      order.status = 'Failed';
    }

    await order.save();

    res.render('user/myOrderSuccess', {
      user: req.session.user,
      ordId,
      msg1: { name },
      walletBalance,
      isUser,
      cart,
      totalProduct,
      school,
      userId,
      lessThanLimit: false,
      isPaymentSuccessful
    });
  } catch (error) {
    return next(error);
  }
};





const buyProduct = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId()

    if (req.session.user) {
      const productId = req.params.id;
      const products = await Product.find({ _id: productId, blocked: false })
        .populate('school').populate('category')
        .exec();
      const name = req.session.user.name;
      const category = await Category.find();
      const school = await School.find({ blocked: false });

      const user = await User.findById(req.session.user._id);

      const addresses = await Address.find({ userId: req.session.user._id });
      const userId = req.session.user._id;

      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status category'
      });

      let totalProduct = 0;
      if (cart && cart.products) {
        totalProduct = cart.products.length;
      }
      res.render('user/productBuy', { user, addresses, products, msg1: { name }, walletBalance, isUser, ordId, cart, totalProduct, school, category });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    return next(error);
  }
}

// const getAllOrders = async (req, res, next) => {
//   try {
//     const isUser = req.session.user;
//     let totalProduct = 0;
//     let walletBalance = 0;

//     if (!req.session.user) {
//       res.redirect('/login');
//       return;
//     }

//     const userId = req.session.user._id;

//     const wallet = await Wallet.findOne({ user: userId });
//     if (wallet) {
//       walletBalance = wallet.balance;
//     }

//     const name = req.session.user.name;
//     const user = await User.findById(req.session.user._id);

//     const pageSize = 5;
//     const currentPage = parseInt(req.query.page) || 1;
//     const skip = (currentPage - 1) * pageSize;

//     const ordersPromise = Order.find({ user: userId })
//       .populate('user')
//       .populate('products.product')
//       .populate('address')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(pageSize)
//       .lean();

//     const [orders, count] = await Promise.all([
//       ordersPromise,
//       Order.countDocuments({ user: userId })
//     ]);

//     const school = await School.find({ blocked: false });

//     res.render('user/myOrders1', {
//       user: userId,
//       orders,
//       msg1: { name },
//       user,
//       school,
//       isUser,
//       currentPage,
//       totalPages: Math.ceil(count / pageSize),
//       totalProduct,
//       walletBalance
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

const getAllOrders = async (req, res, next) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0;

    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const name = req.session.user.name;
    const user = await User.findById(req.session.user._id);

    const pageSize = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const ordersPromise = Order.find({ user: userId })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const [orders, count] = await Promise.all([
      ordersPromise,
      Order.countDocuments({ user: userId })
    ]);

    const school = await School.find({ blocked: false });

    // Calculate return eligibility for each order
    const today = new Date();
    for (const order of orders) {
      const deliveryDate = order.createdAt; // Assuming createdAt field is the delivery date

      // Calculate the difference in days between today and the delivery date
      const daysDifference = Math.floor((today - deliveryDate) / (1000 * 60 * 60 * 24));

      // Set returnEligible based on the criteria (2 weeks = 14 days)
      order.returnEligible = order.status === 'completed' && daysDifference <= 14;
    }

    res.render('user/myOrders1', {
      user: userId,
      orders,
      msg1: { name },
      user,
      school,
      isUser,
      currentPage,
      totalPages: Math.ceil(count / pageSize),
      totalProduct,
      walletBalance
    });
  } catch (error) {
    return next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order_Id = order.orderId
    if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet') {
      let wallet = await Wallet.findOne({ user: req.session.user._id });

      if (!wallet) {
        wallet = new Wallet({
          user: req.session.user._id,
          balance: order.totalAmount
        });
      } else {
        wallet.balance += order.totalAmount;
      }
      wallet.walletHistory.push({
        process: 'Order cancellation',
        orderId: order_Id,
        description: 'Order cancelled',
        amount: order.totalAmount,
        balance: wallet.balance
      });

      await wallet.save();
    }

    order.status = 'cancelled';
    await order.save();

    for (const item of order.products) {
      const product = item.product;
      product.quantity += item.quantity;
      await product.save();
    }

    res.redirect('back');
  } catch (error) {
    return next(error);
  }
};

const returnOrder = async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order_Id = order.orderId

    if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet' || order.payment_type === 'Cash on Delivery') {
      let wallet = await Wallet.findOne({ user: req.session.user._id });

      if (!wallet) {
        wallet = new Wallet({
          user: req.session.user._id,
          balance: order.totalAmount
        });
      } else {
        wallet.balance += order.totalAmount;
      }

      wallet.walletHistory.push({
        process: 'Order Returned',
        orderId: order_Id,
        description: 'Order returned',
        amount: order.totalAmount,
        balance: wallet.balance
      });
      await wallet.save();
    }

    order.status = 'Return requested';
    await order.save();


    res.redirect('back');
  } catch (error) {
    return next(error);
  }
};




const deleteOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndDelete(orderId);
    res.redirect('/orders')
  } catch (error) {
    return next(error);
  }
};

const wishlist = async (req, res, next) => {
  try {
    const isUser = req.session.user;
    let walletBalance = 0;

    if (!isUser) {
      return res.redirect('/login');
    }

    const name = req.session.user.name;
    const userId = req.session.user._id;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery quantity stock_status category'
    });

    const category = await Category.find({});
    const school = await School.find({ blocked: false });

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    let totalProduct = 0;
    let paginatedProducts = [];

    if (cart && cart.products) {
      totalProduct = cart.products.length;

      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      paginatedProducts = cart.products.slice(startIndex, endIndex);
    }

    const userWishlist = await Wishlist.findOne({ user: userId }).populate('products.product');

    res.render('user/wishlist', {
      msg1: { name },
      walletBalance,
      isUser,
      cart,
      category,
      school,
      totalProduct,
      wishlist: userWishlist,
      paginatedProducts,
    });
  } catch (error) {
    return next(error);
  }
};









const showCart = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (!req.session.user) {
      return res.redirect('/login');
    }

    const name = req.session.user.name;
    const school = await School.find({ blocked: false });

    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery quantity stock_status createdAt category'
    });


    let totalItems = 0;
    let subtotal = 0;
    if (cart) {
      for (const product of cart.products) {
        totalItems += product.quantity;
        subtotal += product.price * product.quantity;

        if (product.quantity === 0) {
          product.outOfStockMessage = 'Out of Stock';
        }
      }
    }

    cart.products.sort((a, b) => {
      const dateA = new Date(a.product.createdAt);
      const dateB = new Date(b.product.createdAt);

      return dateB - dateA;
    });

    const pageSize = 2;
    const currentPage = parseInt(req.query.page) || 1;
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;

    let paginatedProducts = [];
    let totalProduct = 0;

    if (cart && cart.products) {
      totalProduct = cart.products.length;
      paginatedProducts = cart.products.slice(start, end);
    }

    const appliedCoupon = cart ? cart.appliedCoupon : null;

    res.render('user/cart', {
      msg1: { name },
      walletBalance,
      isUser,
      school,
      cart,
      totalItems,
      subtotal,
      totalProduct,
      paginatedProducts,
      currentPage,
      totalPages: Math.ceil(totalProduct / pageSize),
      appliedCoupon
    });
  } catch (error) {
    return next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const productId = req.params.productId;
    const action = req.query.action;
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }


    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartProductIndex = cart.products.findIndex(product => product.product._id.equals(productId));

    if (cartProductIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    const product = await Product.findOne({ _id: productId, blocked: false })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cartProduct = cart.products[cartProductIndex];

    if (action === 'increase') {
      if (product.stock_status === 'In Stock' && product.quantity > cartProduct.quantity) {
        cartProduct.quantity++;
      } else {
        return res.redirect('/cart?outOfStock=true');
      }
    } else if (action === 'decrease') {
      if (cartProduct.quantity > 1) {
        cartProduct.quantity--;
      } else {
        return res.redirect('/cart?defaultStock=true');
      }
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await cart.save();

    res.redirect('/cart');

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.redirect('/cart');
    }

  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const productId = req.params.productId;
    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId });
    let walletBalance = 0;
    if (wallet) {
      walletBalance = wallet.balance;
    }

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery category'
    });

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    req.session.cart = cart;
    const product = await Product.findById(productId).populate('category');

    const existingProduct = cart.products.find(item => item.product.equals(productId));
    if (existingProduct) {
      return res.redirect(`/view-product/${productId}?alreadyInCart=true`);
    }

    const categoryNames = product.category.map(cat => cat.category_name);
    cart.products.push({
      product: product._id,
      name: product.title,
      category: categoryNames[0],
      price: product.sales_cost,
      image: product.gallery.length > 0 ? product.gallery[0] : null
    });

    await cart.save();
    return res.redirect(`/view-product/${productId}?addedSuccessfully=true`);
  } catch (error) {
    return next(error);
  }
};





const removeFromCart = async (req, res, next) => {
  try {

    if (!req.session.user) {
      return res.redirect('/login')
    }

    const productId = req.params.productId;


    let cart = await Cart.findOne({ user: req.session.user._id });
    cart.products = cart.products.filter((product) => !product._id.equals(productId));

    await cart.save();

    res.redirect(`/cart`);
  } catch (error) {
    return next(error);
  }
};

const schoolProducts = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const isLogin = await User.findOne({ email: req.session.email, blocked: false })
    if (isLogin) {



      if (req.session.user) {


        const name = req.session.user.name;

        const category = await Category.find();
        const product = await Product.find({ blocked: false });

        const school = await School.find({ blocked: false });


        res.render('user/allCategory', { msg1: { name }, walletBalance, isUser, category, school, product });

      } else {

        const category = await Category.find();
        const product = await Product.find({ blocked: false });
        const school = await School.find({ blocked: false });

        res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance, category, school, product });

      }
    } else {
      delete req.session.user;
      res.redirect('/login')
    }
  } catch (error) {
    return next(error)
  }

}

const getWallet = async (req, res, next) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0;

    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    const userId = req.session.user._id;

    const wallet = await Wallet.findOne({ user: userId }).sort({ createdAt: -1 });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const name = req.session.user.name;
    const user = await User.findById(req.session.user._id);

    const pageSize = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const ordersPromise = Order.find({ user: userId })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })


    const [orders, count] = await Promise.all([
      ordersPromise,
      Order.countDocuments({ user: userId })
    ]);

    const school = await School.find({ blocked: false });
    res.render('user/wallet', {
      user: userId,
      orders,
      msg1: { name },
      user,
      walletHistory: wallet.walletHistory,
      school,
      isUser,
      currentPage,
      totalPages: Math.ceil(count / pageSize),
      totalProduct,
      walletBalance
    });
  } catch (error) {
    return next(error);
  }
};


module.exports = {
  neritt,
  category,
  displayProducts,
  showProduct,
  showCheckoutPage,
  storeCheckout,
  applyCoupon,
  removeCoupon,
  addToWishlist,
  buyProduct,
  getAllOrders,
  cancelOrder,
  returnOrder,
  deleteOrderById,
  wishlist,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  showCart,
  updateCartItemQuantity,
  removeFromCart,
  getWallet,
  storeCheckout
}  