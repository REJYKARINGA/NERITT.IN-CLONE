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
dotenv.config({ path:  './view/config.env'})
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

console.log(razorpayKeyId, razorpayKeySecret,'Razorpay details')


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




const neritt = async (req, res) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0; // Default wallet balance

    if (req.session.user) {
      const name = req.session.user.name;
      const userId = req.session.user._id;

      // Fetch user's wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

      const category = await Category.find();

      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'products.product',
        model: 'productDetails',
        select: 'title sales_cost gallery quantity stock_status'
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
        walletBalance // Pass wallet balance to the view
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
        walletBalance // Pass wallet balance to the view
      });
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



const category = async (req, res) => {
  const isLogin = await User.findOne({ email: req.session.email, blocked: false })
  if (isLogin) {

    const isUser = req.session.user;

    let walletBalance = 0;
  
    if (req.session.user) {

 
      const name = req.session.user.name;
      const category = await Category.find();
 

      const school = await School.find({ blocked: false });

 
      res.render('user/allCategory', {  msg1: { name }, walletBalance ,isUser, category, school });

    } else { 
      const category = await Category.find();

      const school = await School.find({ blocked: false });

      res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance , isUser, category, school, });

    }
  } else {
    delete req.session.user;
    const category = await Category.find();

    const school = await School.find({ blocked: false });
    isUser = ''
    let walletBalance = 0
    res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance , category, school, isUser });
  }

}

const getSchoolProduct = async (req, res) => {
  const isUser = req.session.user;

    let walletBalance = 0;

  if (req.session.user) {
    const name = req.session.user.name;
    const category = await Category.find();
    const product = await Product.find({ blocked: false });
    const school = await School.find({ blocked: false });

    res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance , category, school, product });


  }
  else {
    const category = await Category.find();
    const product = await Product.find({ blocked: false });
    const school = await School.find({ blocked: false });


    res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance , category, school, product });
  }
}

const displayProducts = async (req, res) => {
  const isUser = req.session.user;

    let walletBalance = 0;

  if (req.session.user) {
    const name = req.session.user.name;

    const schoolId = req.query.sch;
    const categoryId = req.query.value || '';

    console.log(schoolId, "schoolId ", categoryId, 'categoryId');

    let productsQuery = { blocked: false };
    if (schoolId) {
      productsQuery.school = schoolId;
    }
    if (categoryId) {
      productsQuery.category = categoryId || '';  
    }
console.log(productsQuery,'productsQuery user check')
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

      // Fetch user's wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

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

    res.render('user/schoolProducts', {  msg1: { name }, walletBalance ,isUser, cart, totalProduct, products, school, category, schoolData });


  }
  else {
    const schoolId = req.query.sch;
    const categoryId = req.query.value || '';

    console.log(schoolId, "schoolId ", categoryId, 'categoryId');

    let productsQuery = { blocked: false };
    if (schoolId) {
      productsQuery.school = schoolId;
    }
    if (categoryId) {
      productsQuery.category = categoryId;
    }
console.log(productsQuery,'productsQuery check')
    const products = await Product.find(productsQuery)
    .populate({
      path: 'school',
      model: 'School',
      select: 'school_name school_logo school_address'
    })
    .populate('category')
    .exec();
  const schoolData = await School.findById(schoolId)
  // console.log(schoolData.school_name,'schoolData')
    const category = await Category.find({});
    const school = await School.find({ blocked: false });


    res.render('user/schoolProducts', { msg1: { name: 'Login' }, walletBalance , isUser, products, school, category,schoolData });
  }
}

const showProduct = async (req, res) => {
  const isUser = req.session.user;

    let walletBalance = 0;

  if (req.session.user) {
    const name = req.session.user.name;
    const productId = req.params.id;
    console.log(productId, "productId ");

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

        console.log(school.school_name);
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

      // Fetch user's wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

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

    res.render('user/product', {  msg1: { name }, walletBalance ,isUser, cart, totalProduct, products, school, category, productsAll });


  }
  else {
    const productId = req.params.id;
    console.log(productId, "productId ");

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

      res.render('user/product', { msg1: { name: 'Login' }, walletBalance , isUser, products, school, category, productsAll });
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }


  }
}

const addToWishlist = async (req, res) => {
  try {
    if (!req.session.user) {
      // User not logged in
      return res.redirect('/login');
    }

    const userId = req.session.user._id;
    const productId = req.params.id;

    // Find the product to be added to the wishlist
    const product = await Product.findById(productId);

    if (!product) {
      // Product not found
      return res.status(404).send('Product not found');
    }

    // Check if the user already has a wishlist
    let wishlist = await Wishlist.findOne({ user: userId });

    // If the user doesn't have a wishlist, create a new one
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: []
      });
    }

    // Check if the product is already in the wishlist
    const existingProductIndex = wishlist.products.findIndex(
      item => item.product.toString() === productId
    );

    if (existingProductIndex !== -1) {
      return res.redirect(`/view-product/${productId}?alreadyInWishlist=true`);
    }
console.log(product.category)
    // Add the product details to the wishlist
    wishlist.products.push({ 
      product: productId,
      name: product.title,
      category:product.category,
      price: product.sales_cost,
      image: product.gallery.length > 0 ? product.gallery[0] : null
    });

    // Save the updated wishlist
    await wishlist.save();

    return res.redirect(`/view-product/${productId}?addedInWishlist=true`);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

// Controller function to remove a product from the wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.params.productId;

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Wishlist not found
      return res.status(404).send('Wishlist not found');
    }

    // Remove the product from the wishlist
    wishlist.products = wishlist.products.filter(item => item.product.toString() !== productId);
    await wishlist.save();

    // Redirect back to the wishlist page or any other page as needed
    res.redirect('/wishlist');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




const showCheckoutPage = async (req, res) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId();
    console.log(ordId);

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    // Fetch user's wallet balance
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
        console.log(totaldeliveryCost, 'totalCGST');

        // Add category names to each product
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
   let  discount = 0

   
        // Fetch all coupons from the database
        const coupons = await Coupon.find();

        // res.render('admin/couponManagement', { coupons }); // Pass coupons to the EJS template
// console.log(product.category,'product.category')
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
    console.error('Error showing checkout page:', error);
    res.redirect('/');
  }
};


const applyCoupon =  async (req, res) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId();
    console.log(ordId);

   
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

      // Fetch user's wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

    
    const addresses = await Address.find({ userId: req.session.user._id });

   
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity '
    });

      if (!cart || (cart.products && cart.products.length === 0)) {
        return res.redirect('/cart');
      } 

      const { couponCode } = req.body;
        console.log(couponCode,'couponCode is this')

       // Validate the coupon
const coupon = await Coupon.findOne({ code: couponCode });

console.log(coupon,'coupon is this ')
if (!coupon) {
  return res.status(400).json({ success: false, message: 'Invalid coupon code' });
}



// Check if the user has already used this coupon
if (coupon.usedByUsers.includes(userId)) {
  console.log("User has already used this coupon");
  return res.status(200).json({ success: false, alreadyUsed: true, message: 'You have already used this coupon' });
}


// Update usedByUsers array with the current user
coupon.usedByUsers.push(userId);

// Check if coupon has exceeded maximum uses
if (coupon.usedCount >= coupon.maxUses) {
console.log("Coupon has reached maximum usage limit")
  return res.status(400).json({ success: false, message: 'Coupon has reached maximum usage limit' });
}

// Check if coupon is expired
const currentDate = new Date();
if (currentDate.getTime() < coupon.startDate.getTime() || currentDate.getTime() > coupon.endDate.getTime()) {
console.log(currentDate.getTime(), 'Coupon is expired')
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
  console.log(totaldeliveryCost, 'totalCGST')
}
}

// Calculate discount based on the coupon type
let discount = 0;
if (coupon.discountType === 'percentage') {
  discount = (coupon.discountValue / 100) * totalAmount;
} else if (coupon.discountType === 'fixedAmount') {
  discount = coupon.discountValue;
}

// Update finalAmount with the discount applied by the coupon
let discountedTotal = finalAmount - discount;

// Check if discounted total is less than minimum amount
if (discountedTotal < coupon.minimumAmount) {
  discountedTotal = coupon.minimumAmount;
}
console.log(discount, discountedTotal,'discountedTotal minimum amount')
// Update usedCount of the coupon
coupon.usedCount += 1;

await coupon.save(); 
     console.log(discountedTotal,'this is my first discountedTotal')
    const name = req.session.user.name;
    const school = await School.find({ blocked: false });
    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }
    
    discountedTotal = discountedTotal -1;
    res.status(200).json({ success: true, updatedTotalAmount: discountedTotal, discount});
 
  } catch (error) {
    console.error('Error showing checkout page:', error);
    res.redirect('/'); 
  }
};

const storeCheckout = async (req, res) => {
  try {
    const isUser = req.session.user;
    let walletBalance = 0;
    const ordId = orderId();
    console.log(ordId);

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    // Fetch user's wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    console.log(walletBalance, 'walletBalance walletBalance')
    const name = req.session.user.name;
    const currentUser = req.session.user;
    console.log(currentUser, "huiii");

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

    const { fatherName, studentName, email, phone, district, addressId, address, landmark, pincode, homeOrOffice, products, finalAmount, deliveryType, order_id, category, discount } = req.body;
    console.log(discount, 'discountdiscountdiscount')
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

    // Check if the order amount is less than Rs 1000 and payment type is COD
    if (finalAmount < 1000 && paymentType === 'Cash on Delivery') {
      // Send a flag to indicate that COD is not available for orders less than Rs 1000
      return res.redirect('/checkout?lessThanLimit=true');
    }

    if (paymentType === 'Wallet' && (!wallet || wallet.balance < finalAmount)) {
      // Display SweetAlert indicating insufficient wallet balance
      return res.redirect('/checkout?outOfStock=true');
    }

    const isExistingUser = await Cart.findOne({ user: currentUser._id }).populate('products');
    console.log(isExistingUser.products, "hello");

    const order = new Order({
      user: req.session.user._id,
      products: isExistingUser.products.map(prod => prod),
      totalAmount: finalAmount,
      discountedAmount: discount,
      OfferedAmount: 0,
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

    console.log(ordId, 'ordId');
    await order.save();

    // Deduct the amount from the wallet balance if payment type is 'Wallet'
    if (paymentType === 'Wallet') {
      wallet.balance -= finalAmount;
      await wallet.save();
      walletBalance = wallet.balance;
    }
    // Update product quantities and clear cart
    for (const product of isExistingUser.products) {
      await Product.findByIdAndUpdate(product.product._id, { $inc: { quantity: -product.quantity } });
    }
    const isCartExist = await Cart.findOneAndUpdate({ user: currentUser._id }, { products: [] });
    console.log("isexist", isCartExist);


    const isPaymentSuccessful = true; // Set it to true for testing

    if (isPaymentSuccessful) {
      // Payment successful, update order status
      order.status = 'Accepted'; // Or 'Completed', depending on your business logic
    } else {
      // Payment failed, update order status
      order.status = 'Failed';
    }

    await order.save();

    // Send necessary data to the template
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
      lessThanLimit: false,  // Send a flag to indicate that COD is available for this order
      isPaymentSuccessful 
    });
  } catch (error) {
    console.error('Error storing checkout details:', error.message);
    res.status(500).send('Internal server error');
  }
};







const buyProduct = async (req, res) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;
    const ordId = orderId()

    console.log(ordId, "Heloo lo");
    if (req.session.user) {
      const productId = req.params.id;
      const products = await Product.find({ _id: productId, blocked: false })
        .populate('school').populate('category') 
        .exec();
      console.log(ordId, "Heloo lo 2", productId);
      const name = req.session.user.name;
      const category = await Category.find();
      const school = await School.find({ blocked: false });
      console.log("Enter to product buy page");

      const user = await User.findById(req.session.user._id);

      const addresses = await Address.find({ userId: req.session.user._id });
      const userId = req.session.user._id;

      // Fetch user's wallet balance
      const wallet = await Wallet.findOne({ user: userId });
      if (wallet) {
        walletBalance = wallet.balance;
      }

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
      console.log(products, "hello products")
      res.render('user/productBuy', { user, addresses, products,  msg1: { name }, walletBalance ,isUser, ordId, cart, totalProduct, school, category });
    } else {
      console.log("Enter to login page");
      res.redirect('/login');
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
}

const getAllOrders = async (req, res) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0;

    if (!req.session.user) {
      res.redirect('/login');
      return; // Return here to prevent further execution of code
    }

    const userId = req.session.user._id;

    // Fetch user's wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const name = req.session.user.name;
    const user = await User.findById(req.session.user._id);

    // Pagination logic
    const pageSize = 5; // Number of orders per page
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const ordersPromise = Order.find({ user: userId })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(); // converting Mongoose document to plain JS object

    const [orders, count] = await Promise.all([
      ordersPromise,
      Order.countDocuments({ user: userId }) // Count total number of orders
    ]);

    const school = await School.find({ blocked: false });

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
    console.log(error.message);
    res.redirect('/login');
  }
};
 

const cancelOrder = async (req, res) => {
  try {
      if (!req.session.user) {
          res.redirect('/login');
          return;
      }

      const orderId = req.params.id;

      // Find the order by its ID
      const order = await Order.findById(orderId).populate('products.product');
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const order_Id = order.orderId
      console.log(order_Id,'order.orderId')
      // Check if the payment type is "Online Payment"
      if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet') {
          // Retrieve the user's wallet
          let wallet = await Wallet.findOne({ user: req.session.user._id });

          // If the wallet doesn't exist, create a new one
          if (!wallet) {
              wallet = new Wallet({
                  user: req.session.user._id,
                  balance: order.totalAmount
              });
          } else {
              // Increment the wallet balance by the order's totalAmount
              wallet.balance += order.totalAmount;
          }

          // Add the order details to the wallet history
          wallet.walletHistory.push({
              process: 'Order cancellation',
              orderId: order_Id,
              description: 'Order cancelled',
              amount: order.totalAmount,
              balance: wallet.balance
          });

          // Save the updated wallet
          await wallet.save();
      }

      // Update the order status to "cancelled"
      order.status = 'cancelled';
      await order.save();

      // Restore product quantities
      for (const item of order.products) {
          const product = item.product;
          product.quantity += item.quantity; // Increment product quantity by the cancelled order quantity
          await product.save();
      }

      res.redirect('back'); // Redirect to my orders page after cancelling the order
  } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const returnOrder = async (req, res) => {
  try {
      if (!req.session.user) {
          res.redirect('/login');
          return;
      }

      const orderId = req.params.id;

      // Find the order by its ID
      const order = await Order.findById(orderId).populate('products.product');
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const order_Id = order.orderId
      console.log(order_Id,'order.orderId')

      // Check if the payment type is "Online Payment"
      if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet' || order.payment_type === 'Cash on Delivery') {
          // Retrieve the user's wallet
          let wallet = await Wallet.findOne({ user: req.session.user._id });

          // If the wallet doesn't exist, create a new one
          if (!wallet) {
              wallet = new Wallet({
                  user: req.session.user._id,
                  balance: order.totalAmount
              });
          } else {
              // Increment the wallet balance by the order's totalAmount
              wallet.balance += order.totalAmount;
          }

          // Add the order details to the wallet history
          wallet.walletHistory.push({
              process: 'Order Returned',
              orderId: order_Id,
              description: 'Order returned',
              amount: order.totalAmount,
              balance: wallet.balance
          });

          // Save the updated wallet
          await wallet.save();
      }

      // Update the order status to "Returned"
      order.status = 'Returned';
      await order.save();

      // Restore product quantities
      for (const item of order.products) {
          const product = item.product;
          product.quantity += item.quantity; // Increment product quantity by the Returned order quantity
          await product.save();
      }

      res.redirect('back'); // Redirect to my orders page after Returning the order
  } catch (error) {
      console.error('Error Returning  order:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


// const cancelOrder = async (req, res) => {
//   try {
//       if (!req.session.user) {
//           res.redirect('/login');
//           return;
//       }

//       const orderId = req.params.id;

//       // Find the order by its ID
//       const order = await Order.findById(orderId).populate('products.product');
//       if (!order) {
//           return res.status(404).json({ message: 'Order not found' });
//       }

//       // Check if the payment type is "Online Payment"
//       if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet') {
//           // Retrieve the user's wallet
//           let wallet = await Wallet.findOne({ user: req.session.user._id });

//           // If the wallet doesn't exist, create a new one
//           if (!wallet) {
//               wallet = new Wallet({
//                   user: req.session.user._id,
//                   balance: order.totalAmount
//               });
//           } else {
//               // Increment the wallet balance by the order's totalAmount
//               wallet.balance += order.totalAmount;
//           }

//           // Add the order amount to the wallet history
//           wallet.walletHistory.push({
//               process: 'Order cancellation',
//               amount: order.totalAmount
//           });

//           // Save the updated wallet
//           await wallet.save();
//       }

//       // Update the order status to "cancelled"
//       order.status = 'cancelled';
//       await order.save();

//       // Restore product quantities
//       for (const item of order.products) {
//           const product = item.product;
//           product.quantity += item.quantity; // Increment product quantity by the cancelled order quantity
//           await product.save();
//       }

//       res.redirect('/orders'); // Redirect to my orders page after cancelling the order
//   } catch (error) {
//       console.error('Error cancelling order:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// };


// const returnOrder = async (req, res) => {
//   try {
//       if (!req.session.user) {
//           res.redirect('/login');
//           return;
//       }

//       const orderId = req.params.id;

//       // Find the order by its ID
//       const order = await Order.findById(orderId).populate('products.product');
//       if (!order) {
//           return res.status(404).json({ message: 'Order not found' });
//       }

//       // Check if the payment type is "Online Payment"
//       if (order.payment_type === 'Online Payment' || order.payment_type === 'Wallet') {
//           // Retrieve the user's wallet
//           let wallet = await Wallet.findOne({ user: req.session.user._id });

//           // If the wallet doesn't exist, create a new one
//           if (!wallet) {
//               wallet = new Wallet({
//                   user: req.session.user._id,
//                   balance: order.totalAmount
//               });
//           } else {
//               // Increment the wallet balance by the order's totalAmount
//               wallet.balance += order.totalAmount;
//           }

//           // Add the order amount to the wallet history
//           wallet.walletHistory.push({
//               process: 'Order Returned',
//               amount: order.totalAmount
//           });

//           // Save the updated wallet
//           await wallet.save();
//       }

//       // Update the order status to "Returned"
//       order.status = 'Returned';
//       await order.save();

//       // Restore product quantities
//       for (const item of order.products) {
//           const product = item.product;
//           product.quantity += item.quantity; // Increment product quantity by the Returned order quantity
//           await product.save();
//       }

//       res.redirect('/orders'); // Redirect to my orders page after Returning the order
//   } catch (error) {
//       console.error('Error Returning  order:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// };


const deleteOrderById = async (req, res) => {
  try {
      const orderId = req.params.id;
      await Order.findByIdAndDelete(orderId);
      res.redirect('/orders')
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Failed to delete order' });
  } 
};
 
const wishlist = async (req, res) => {
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
      select: 'title sales_cost gallery quantity stock_status'
    });

    const category = await Category.find({});
    const school = await School.find({ blocked: false });

    // Fetch user's wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    let totalProduct = 0;
    let paginatedProducts = [];

    if (cart && cart.products) {
      totalProduct = cart.products.length;

      // Pagination variables
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Get paginated products
      paginatedProducts = cart.products.slice(startIndex, endIndex);
    }

    // Fetch user's wishlist
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
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

 


 

 


const showCart = async (req, res) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (!req.session.user) {
      return res.redirect('/login');
    }

    const name = req.session.user.name;
    const school = await School.find({ blocked: false });

    const userId = req.session.user._id;

      // Fetch user's wallet balance
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

    // Sort products by creation date (createdAt)
    cart.products.sort((a, b) => {
      // Convert createdAt string to Date object for comparison
      const dateA = new Date(a.product.createdAt);
      const dateB = new Date(b.product.createdAt);

      // Compare the dates
      return dateB - dateA; // Sort in descending order (most recent first)
    });

    // Pagination logic
    const pageSize = 2; // Number of products per page
    const currentPage = parseInt(req.query.page) || 1;
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;

    let paginatedProducts = [];
    let totalProduct = 0;

    if (cart && cart.products) {
      totalProduct = cart.products.length;
      paginatedProducts = cart.products.slice(start, end);
    }

    // Get applied coupon code from the cart
    const appliedCoupon = cart ? cart.appliedCoupon : null;

    res.render('user/cart', {
      msg1: { name }, 
      walletBalance ,
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const productId = req.params.productId;
    const action = req.query.action; 
    const userId = req.session.user._id;

      // Fetch user's wallet balance
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
    console.error('Error updating cart quantity:', error);
    res.redirect('/');
  }
};

const addToCart = async (req, res) => {
  try {
    if (!req.session.user) {
      console.log("Unauthorized login");
      return res.redirect('/login');
    }

    const productId = req.params.productId;
    const userId = req.session.user._id;

    // Fetch user's wallet balance
    const wallet = await Wallet.findOne({ user: userId });
    let walletBalance = 0; // Initialize wallet balance
    if (wallet) {
      walletBalance = wallet.balance;
    }

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery category' // Populate category field
    });

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    req.session.cart = cart;
    const product = await Product.findById(productId).populate('category'); // Populate category field for the product

    const existingProduct = cart.products.find(item => item.product.equals(productId));
    if (existingProduct) {
      return res.redirect(`/view-product/${productId}?alreadyInCart=true`);
    }

    // Map through categories of the product and extract category names
    const categoryNames = product.category.map(cat => cat.category_name);
console.log(categoryNames[0],'categoryNames')
    cart.products.push({
      product: product._id,
      name: product.title,
      category: categoryNames[0], // Assign the array of category names to category field
      price: product.sales_cost,
      image: product.gallery.length > 0 ? product.gallery[0] : null
    });

    await cart.save();
    console.log("addedSuccessfully")
    return res.redirect(`/view-product/${productId}?addedSuccessfully=true`);
  } catch (error) {
    console.error(error.message);
    res.redirect('/')
  }
};





const removeFromCart = async (req, res) => {
  try {

    if (!req.session.user) {
      return res.redirect('/login')
    }

    const productId = req.params.productId;


    let cart = await Cart.findOne({ user: req.session.user._id });
    console.log(cart)
    cart.products = cart.products.filter((product) => !product._id.equals(productId));

    await cart.save();

    res.redirect(`/cart`);
  } catch (error) {
    console.error('Error in delete-cart-product route:', error);
    res.send(error.message)
  }
};

const schoolProducts = async (req, res) => {
  const isUser = req.session.user;

    let walletBalance = 0;
  const isLogin = await User.findOne({ email: req.session.email, blocked: false })
  if (isLogin) {



    if (req.session.user) {


      const name = req.session.user.name;

      const category = await Category.find();
      const product = await Product.find({ blocked: false });

      const school = await School.find({ blocked: false });


      res.render('user/allCategory', {  msg1: { name }, walletBalance ,isUser, category, school, product });

    } else {

      const category = await Category.find();
      const product = await Product.find({ blocked: false });
      const school = await School.find({ blocked: false });

      res.render('user/allCategory', { msg1: { name: 'Login' }, walletBalance , category, school, product });

    }
  } else {
    delete req.session.user;
    res.redirect('/login')
  }

}

const getWallet = async (req, res) => {
  try {
    const isUser = req.session.user;
    let totalProduct = 0;
    let walletBalance = 0;

    if (!req.session.user) {
      res.redirect('/login');
      return; // Return here to prevent further execution of code
    }

    const userId = req.session.user._id;

    // Fetch user's wallet balance
    const wallet = await Wallet.findOne({ user: userId }).sort({ createdAt: -1 });
    if (wallet) {
      walletBalance = wallet.balance;
    }

    const name = req.session.user.name;
    const user = await User.findById(req.session.user._id);

    // Pagination logic
    const pageSize = 5; // Number of orders per page
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const ordersPromise = Order.find({ user: userId })
      .populate('user')
      .populate('products.product')
      .populate('address')
      .sort({ createdAt: -1 })
     

    const [orders, count] = await Promise.all([
      ordersPromise,
      Order.countDocuments({ user: userId }) // Count total number of orders
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
    console.log(error.message);
    res.redirect('/login');
  }
};


module.exports = {
    neritt,
    category,
    // getSchoolProduct,
    displayProducts,
    showProduct,
    showCheckoutPage,
    storeCheckout,
    applyCoupon,
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
    // schoolProducts
  }  