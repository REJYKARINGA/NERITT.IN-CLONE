// require("../db/mongoose")
// const fs = require('fs')
// const User = require('../model/userSchema')
// const School = require('../model/schoolSchema');
// const Product = require('../model/productSchema');
// const Category = require('../model/categorySchema');
// const Address = require('../model/addressSchema');
// const Cart = require('../model/cartSchema');
// const Order = require('../model/orderSchema');
// const Swal = require('sweetalert2');
// const { body, validationResult } = require('express-validator');
// const nodemailer = require('nodemailer'); 
// const sizeOf = require('image-size'); 
// const orderId = require('../public/js/orderId')



// const neritt = async (req, res) => {

//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;
//     const category = await Category.find();

//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     console.log(totalProduct)

//     const school = await School.find({ blocked: false });

//     res.render('user/landingPage', { msg1: { name }, isUser, cart, category, school, totalProduct });

//   } else {
//     const category = await Category.find();

//     const school = await School.find({ blocked: false });
//     let totalProduct = 0
//     res.render('user/landingPage', { msg1: { name: 'Login' }, category, school, totalProduct, isUser });

//   }
// }

// const forgotPage = async (req, res) => {
//   if (req.session.user) {
//     res.redirect('/')

//   }
//   else {
//     res.render('user/forgot_Password')
//   }
// }



// const category = async (req, res) => {
//   const isLogin = await User.findOne({ email: req.session.email, blocked: false })
//   if (isLogin) {

//     const isUser = req.session.user;

//     if (req.session.user) {


//       const name = req.session.user.name;
//       const category = await Category.find();


//       const school = await School.find({ blocked: false });


//       res.render('user/allCategory', { msg1: { name }, isUser, category, school });

//     } else {
//       const category = await Category.find();

//       const school = await School.find({ blocked: false });

//       res.render('user/allCategory', { msg1: { name: 'Login' }, isUser, category, school, });

//     }
//   } else {
//     delete req.session.user;
//     const category = await Category.find();

//     const school = await School.find({ blocked: false });
//     isUser = ''
//     res.render('user/allCategory', { msg1: { name: 'Login' }, category, school, isUser });
//   }

// }









// const wishlist = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/wishlist', { msg1: { name }, isUser, cart, totalProduct, school })

//   }
//   else {
//     const school = await School.find({ blocked: false });

//     res.render('user/login', { msg1: { name: 'Login' }, school })
//   }
// }

// const addToCart = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       console.log("Unauthorized login");
//       return res.redirect('/login');
//     }

//     const productId = req.params.productId;
//     const userId = req.session.user._id;

    
//     let cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery'
//     });

//     if (!cart) {
      
//       cart = new Cart({ user: userId, products: [] });
//     }
//     req.session.cart = cart;
//     const product = await Product.findById(productId);

//      const existingProduct = cart.products.find(item => item.product.equals(productId));
//     if (existingProduct) {
//       return res.redirect(`/view-product/${productId}?alreadyInCart=true`);
//     }

//    cart.products.push({
//       product: product._id,
//       name: product.title,
//       price: product.sales_cost,
//       image: product.gallery.length > 0 ? product.gallery[0] : null
//     });

//     await cart.save();
//     console.log("addedSuccessfully")
//     return res.redirect(`/view-product/${productId}?addedSuccessfully=true`);
//   } catch (error) {
//     res.redirect('/')
//   }
// };

// const showCart = async (req, res) => {
//   try {
//     const isUser = req.session.user;

//     if (!req.session.user) {
//       return res.redirect('/login');
//     }

//     const name = req.session.user.name;
//     const school = await School.find({ blocked: false });

//     const userId = req.session.user._id;
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalItems = 0;
//     let subtotal = 0;
//     if (cart) {
//       for (const product of cart.products) {
//         totalItems += product.quantity;
//         subtotal += product.price * product.quantity;
//         console.log(subtotal, "product.price");

//         if (product.quantity === 0) {
//           product.outOfStockMessage = 'Out of Stock';
//         }
//       }
//     }

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct");

//     res.render('user/cart', {
//       msg1: { name }, isUser, school,
//       cart: cart,
//       totalItems: totalItems,
//       subtotal: subtotal, 
//       totalProduct
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


// const updateCartItemQuantity = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.redirect('/login');
//     }

//     const productId = req.params.productId;
//     const action = req.query.action; 
//     const userId = req.session.user._id;

    
//     const cart = await Cart.findOne({ user: userId });
//     console.log(cart)
//     if (!cart) {
//       return res.status(404).json({ error: 'Cart not found' });
//     }

//     const cartProductIndex = cart.products.findIndex(product => product.product._id.equals(productId));

//     if (cartProductIndex === -1) {
//       return res.status(404).json({ error: 'Product not found in cart' });
//     }
//     const product = await Product.findOne({ _id: productId, blocked: false })

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const cartProduct = cart.products[cartProductIndex];

//     if (action === 'increase') {
//       if (product.stock_status === 'In Stock' && product.quantity > cartProduct.quantity) {
//         cartProduct.quantity++;
//       } else {
//         return res.redirect('/cart?outOfStock=true');
//       }
//     } else if (action === 'decrease') {
//       if (cartProduct.quantity > 1) {
//         cartProduct.quantity--;
//       } else {
//         return res.redirect('/cart?defaultStock=true');
//       }
//     } else {
//       return res.status(400).json({ error: 'Invalid action' });
//     }

//     await cart.save();

//     res.redirect('/cart');

//     if (!cart || !cart.products || cart.products.length === 0) {
//       return res.render('user/cart', { msg1: { name }, isUser, school });
//     }
//   } catch (error) {
//     console.error('Error updating cart quantity:', error);
//     res.redirect('/');
//   }
// };




// const removeFromCart = async (req, res) => {
//   try {

//     if (!req.session.user) {
//       return res.redirect('/login')
//     }

//     const productId = req.params.productId;


//     let cart = await Cart.findOne({ user: req.session.user._id });
//     console.log(cart)
//     cart.products = cart.products.filter((product) => !product._id.equals(productId));

//     await cart.save();

//     res.redirect(`/cart`);
//   } catch (error) {
//     console.error('Error in delete-cart-product route:', error);
//     res.send(error.message)
//   }
// };


// const getSchoolProduct = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;
//     const category = await Category.find();
//     const product = await Product.find({ blocked: false });
//     const school = await School.find({ blocked: false });

//     res.render('user/schoolProducts', { msg1: { name: 'Login' }, category, school, product });


//   }
//   else {
//     const category = await Category.find();
//     const product = await Product.find({ blocked: false });
//     const school = await School.find({ blocked: false });


//     res.render('user/schoolProducts', { msg1: { name: 'Login' }, category, school, product });
//   }
// }



// const displayProducts = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const schoolId = req.query.sch;

//     console.log(schoolId, "schoolId ");


//     const products = await Product.find({ school: { $in: [schoolId] }, blocked: false })
//       .populate('school') 
//       .exec();

//     const category = await Category.find({});
//     const school = await School.find({ blocked: false });

//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/schoolProducts', { msg1: { name }, isUser, cart, totalProduct, products, school, category });


//   }
//   else {
//     const schoolId = req.query.sch;
//     console.log(schoolId, "schoolId ");

//     const products = await Product.find({ school: { $in: [schoolId] }, blocked: false })
//       .populate('school').populate('category') 
//       .exec();
//     console.log(products)
//     const category = await Category.find({});
//     const school = await School.find({ blocked: false });


//     res.render('user/schoolProducts', { msg1: { name: 'Login' }, isUser, products, school, category });
//   }
// }

// const showProduct = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;
//     const productId = req.params.id;
//     console.log(productId, "productId ");

//     if (!productId) {
     
//       res.status(400).send('Product ID is missing');
//       return;
//     }

//     const products = await Product.find({ _id: productId, blocked: false })
//       .populate('school').populate('category') 
//       .exec();

//     if (products.length > 0) {
//       const product = products[0];

//       if (product.school.length > 0) {
//         const school = product.school[0];

//         console.log(school.school_name);
//       }
//     }
//     const schoolId = products.school ? products.school._id : null;
//     const productsAll = await Product.find({ school: { $in: [schoolId] }, blocked: false })
//       .populate('school') 
//       .exec();
//     const category = await Category.find({});
//     const school = await School.find({ blocked: false });

    
//     req.session.productsAll = productsAll;

//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/product', { msg1: { name }, isUser, cart, totalProduct, products, school, category, productsAll });


//   }
//   else {
//     const productId = req.params.id;
//     console.log(productId, "productId ");

//     if (!productId) {
     
//       res.status(400).send('Product ID is missing');
//       return;
//     }
//     try {
//       const products = await Product.find({ _id: productId, blocked: false })
//         .populate('school').populate('category') 
//         .exec();

//       const schoolId = products.school ? products.school._id : null;
//       const productsAll = await Product.find({ school: { $in: [schoolId] }, blocked: false })
//         .populate('school') 
//         .exec();
//       const category = await Category.find({});
//       const school = await School.find({ blocked: false });

//       res.render('user/product', { msg1: { name: 'Login' }, isUser, products, school, category, productsAll });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send(error.message);
//     }


//   }
// }





// const buyProduct = async (req, res) => {
//   try {
//     const isUser = req.session.user;
//     const ordId = orderId()

//     console.log(ordId, "Heloo lo");
//     if (req.session.user) {
//       const productId = req.params.id;
//       const products = await Product.find({ _id: productId, blocked: false })
//         .populate('school').populate('category') 
//         .exec();
//       console.log(ordId, "Heloo lo 2", productId);
//       const name = req.session.user.name;
//       const category = await Category.find();
//       const school = await School.find({ blocked: false });
//       console.log("Enter to product buy page");

//       const user = await User.findById(req.session.user._id);

//       const addresses = await Address.find({ userId: req.session.user._id });
//       const userId = req.session.user._id;

//       const cart = await Cart.findOne({ user: userId }).populate({
//         path: 'products.product',
//         model: 'productDetails',
//         select: 'title sales_cost gallery quantity stock_status'
//       });

//       let totalProduct = 0;
//       if (cart && cart.products) {
//         totalProduct = cart.products.length;
//       }
//       console.log(totalProduct, "totalProduct")
//       console.log(products, "hello products")
//       res.render('user/productBuy', { user, addresses, products, msg1: { name }, isUser, ordId, cart, totalProduct, school, category });
//     } else {
//       console.log("Enter to login page");
//       res.redirect('/login');
//     }
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).send("Internal Server Error");
//   }
// }

// const showCheckoutPage = async (req, res) => {
//   try {
//     const isUser = req.session.user;
//     const ordId = orderId();
//     console.log(ordId);

   
//     if (!req.session.user) {
//       return res.redirect('/login');
//     }
//     const userId = req.session.user._id;

    
//     const addresses = await Address.find({ userId: req.session.user._id });

   
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost quantity '
//     });

//       if (!cart || (cart.products && cart.products.length === 0)) {
//         return res.redirect('/cart');
//       } 
  
   
//     let totalAmount = 0;
//     let totalCGST = 0;
//     let totalSGST = 0;
//     let totaldeliveryCost = 0;
//     let finalAmount = 0;

//     if (cart && cart.products) {
//       for (const product of cart.products) {
       
//         const products = await Product.find({ _id: product.product.id, blocked: false })
//         const cgstValue = products[0].cgst;
//         const sgstValue = products[0].sgst;
//         const deliveryCharge = products[0].delivery_charge;

//         totalAmount += product.price * product.quantity;
//         totalCGST += (cgstValue / 100) * product.price * product.quantity; 
//         totalSGST += (sgstValue / 100) * product.price * product.quantity; 
//         totaldeliveryCost += deliveryCharge * product.quantity; 
//         finalAmount = totalAmount + totalCGST + totalSGST + totaldeliveryCost
//         console.log(totaldeliveryCost, 'totalCGST')
//       }
//     }
//     const name = req.session.user.name;
//     const school = await School.find({ blocked: false });
//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }

//     res.render('user/checkout', {
//       cart,
//       addresses,
//       totalAmount,
//       totalCGST, totalSGST,
//       totaldeliveryCost, msg1: { name }, school, isUser, totalProduct, finalAmount, ordId

//     });
//   } catch (error) {
//     console.error('Error showing checkout page:', error);
//     res.redirect('/'); 
//   }
// };


// const storeCheckout = async (req, res) => {
//   try {
//     const isUser = req.session.user;

//     if (!req.session.user) {
//       return res.redirect('/login');
//     }
//     const name = req.session.user.name;
    
//     const currentUser = req.session.user;
//     console.log(currentUser, "huiii");

//     const userId = req.session.user.id;
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost quantity' 
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     const school = await School.find({ blocked: false });
   
//     const { fatherName, studentName, email, phone, district, addressId, address, landmark, pincode, homeOrOffice, products, finalAmount, deliveryType, order_id } = req.body;
//     const paymentTypeValue = req.body.payment_type; 
//     let paymentType;
//     if (paymentTypeValue === '1') {
//       paymentType = 'Cash on Delivery';
//     } else if (paymentTypeValue === '2') {
//       paymentType = 'Online Payment';
//     } else if (paymentTypeValue === '3') {
//       paymentType = 'Wallet';
//     } else {
      
//     }

    
//     const isExistingUser = await Cart.findOne({ user: currentUser._id }).populate('products');
//     console.log(isExistingUser.products, "hello");

//     const order = new Order({
//       user: req.session.user._id,
//       products: isExistingUser.products.map(prod => prod),
//       totalAmount: finalAmount, 
//       address: addressId, 
//       billingDetails: {
//         fatherName,
//         studentName,
//         email,
//         phone,
//         district,
//         address,
//         landmark,
//         pincode,
//         homeOrOffice
//       },
//       payment_type: paymentType,
//       orderId: order_id,
//       deliveryType,
//       status: 'pending' 
//     });
//     const ordId = order_id;
//     console.log(ordId, 'ordId');

//     await order.save();

//      for (const product of isExistingUser.products) {
//       await Product.findByIdAndUpdate(product.product._id, { $inc: { quantity: -product.quantity } });
//     }

//    const isCartExist = await Cart.findOneAndUpdate({ user: currentUser._id }, { products: [] });
//     console.log("isexist", isCartExist);

//    res.render('user/myOrderSuccess', { user: req.session.user, ordId, msg1: { name }, isUser, cart, totalProduct, school, userId });
//   } catch (error) {
//     console.error('Error storing checkout details:', error.message);
//     res.status(500).send('Internal server error');
//   }
// };


// const getAllOrders = async (req, res) => {
//   try {
//     const isUser=req.session.user;

//     if (!req.session.user) {

//       res.redirect('/login')}
      
//       const name = req.session.user.name;
//       const user = await User.findById(req.session.user._id);
// const orders = await Order.find({ user: req.session.user._id })
//     .populate('user') 
//     .populate('products.product') 
//     .populate('address'); 
//         console.log(orders);
//         const school = await School.find({ blocked: false });
   
//       res.render('user/myOrders1',{user:req.session.user._id,orders,msg1:{name},user,school, isUser})
//   } catch (error) {
//       console.log(error.message)
//       res.render('/login')
//   }
// };

// const cancelOrder = async (req, res) => {
//   try {
//     // Check if user is logged in
//     if (!req.session.user) {
//       return res.redirect('/login');
//     }

//     const orderId = req.params.id;
//     console.log(orderId, 'orderId');

//     // Find the order by its ID and update its status to 'cancelled'
//     const updatedOrder = await Order.findOneAndUpdate(
//       { _id: orderId },
//       { $set: { status: 'cancelled' } },
//       { new: true }
//     );

//     // Check if the order exists
//     if (!updatedOrder) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // Check if the order status is already 'cancelled' or 'cancelledByAdmin'
//     if (
//       updatedOrder.status !== 'cancelled' &&
//       updatedOrder.status !== 'cancelledByAdmin'
//     ) {
//       // Retrieve the product details from the cancelled order
//       const products = updatedOrder.products;

//       // Iterate over each product in the cancelled order
//       for (const product of products) {
//         const productId = product.product; // Extract productId from the product
//         const productQuantity = product.quantity; // Extract product quantity

//         // Find the product by its ID and increment the quantity
//         await Product.findByIdAndUpdate(
//           productId,
//           { $inc: { quantity: productQuantity } },
//           { new: true }
//         );
//       }
//     }

//     console.log(updatedOrder, 'updatedOrder');
//     res.redirect('/orders'); // Redirect to my orders page after cancelling the order
//   } catch (error) {
//     console.error('Error cancelling order:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




// const deleteOrderById = async (req, res) => {
//   try {
//       const orderId = req.params.id;
//       await Order.findByIdAndDelete(orderId);
//       res.redirect('/orders')
//   } catch (error) {
//       console.log(error.message);
//       res.status(500).json({ message: 'Failed to delete order' });
//   }
// };
 

// const login = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {

//     res.redirect('/')
//   }
//   else {
//     res.render('user/login')
//   }
// }




// const loginpost = async (req, res) => {
//   try {

//     const email = req.body.email
//     console.log(email, "email")
//     const password = req.body.password
//     const userCorrect = await User.findOne({ email: email, blocked: false })
//     if (!userCorrect) return res.redirect("back")

//     console.log("Blocked situation is : ", userCorrect,)
//     // res.send(getemail)
//     if (!userCorrect) {
//       res.render('error')
//     } else {
//       if (userCorrect.password == password) {
//         req.session.user = userCorrect
//         req.session.email = userCorrect.email
//         console.log(req.session.user);

//         res.redirect("/");
//       } else
//         if (userCorrect.blocked) {
//           console.log('User is blocked', userCorrect.blocked)
//           res.redirect('/login')
//         } else {
//           res.render('error')
//         }
//     }
//   } catch (error) {
//     console.log(error)
//     res.render('error')
//   }
// }


// const signup = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {

//     res.redirect('/')
//   } else {
//     const category = await Category.find();

//     const school = await School.find({ blocked: false });

//     res.render('user/signup', { msg1: { name: 'Login' }, isUser,category, school });


//   }

// }

// const signupPost = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//      const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.render('user/signup', { message: 'Email already registered.' });
//     }

//      const otpCode = Math.floor(100000 + Math.random() * 900000);

//     const userdata = new User({
//       name,
//       email,
//       phone,
//       password,
//       otp: {
//         code: otpCode.toString(),
//         expiration: new Date(Date.now() + 1 * 60 * 1000)
//       }
//     });

//     await userdata.save();

//      await sendOtpEmail(email, otpCode);

//      req.session.verifyEmail = email;

//      res.render('user/signupVerifyOTP');
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error for signup' });
//   }
// };



//  const logout = (req, res) => {

//   if (req.session.user) {
//     req.session.destroy((err) => {
//       if (err) {
//         console.error('Error destroying session:', err);
//       } else {
//         res.redirect('/');  
//       }
//     });
//   }
// }


// const signupVerifyOtp = async (req, res) => {
//   try {
//     let verifyEmail = ""
//     const { otp } = req.body;
//     console.log(otp)
//     if (req.session.verifyEmail) {
//       verifyEmail = req.session.verifyEmail
//     }
//     const user = await User.findOne({ email: verifyEmail });
//     console.log(user, "verifyEmail in verifyOtp")

//     if (!user) {
//       console.log('User not found signupVerifyOtp')
//     }

//     // Check if OTP is expired
//     if (user.otp.expiration && user.otp.expiration < new Date()) {
//       return res.status(401).json({ message: 'OTP has expired' });
//     }

//     // Check if the entered OTP matches the stored OTP
//     if (user.otp.code !== otp) {
//       console.log('Invalid OTP, Recheck Your OTP')
//       return res.render('error')

//     }

//     // Clear the OTP details after successful verification
//     user.otp = {
//       code: null,
//       expiration: null
//     };

//     await user.save();
//     console.log('OTP verified successfully in verifyOtp. Please Login Again')
//     res.redirect('/login')
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error while verifying OTP' });
//   }
// }


//  const emailResendOtp = async (req, res) => {
//   try {
//     if (req.session.verifyEmail) {
//       verifyEmail = req.session.verifyEmail;
//     }

//     const user = await User.findOne({ email: verifyEmail });

//     if (!user) {
//       console.log('User not found emailResendOtp');
//     }

//     // Check if 60 seconds have passed since the last OTP request
//     const lastOtpRequestTime = user.otp.lastRequestTime || 0;
//     const currentTime = new Date().getTime();

//     if (currentTime - lastOtpRequestTime < 60000) {
//       return res.status(429).json({ message: 'Wait for 60 seconds before requesting a new OTP' });
//     }

//     // Generate a new OTP
//     const otpCode = Math.floor(100000 + Math.random() * 900000);

//     // Set the new OTP in the user document and update the last request time
//     user.otp = {
//       code: otpCode.toString(),
//       expiration: new Date(currentTime + 1 * 60 * 1000),
//       lastRequestTime: currentTime
//     };

//     await user.save();

//     // Send the new OTP via email
//     await sendOtpEmail(verifyEmail, otpCode);
//     console.log('New OTP sent successfully');

//     res.render('user/signupVerifyOTP'); // Redirect to the verification page
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error while resending OTP' });
//   }
// };




// const schoolRegister = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const userId = req.session.user._id;
//     const name = req.session.user.name
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     const school = await School.find({ blocked: false });

//     res.render('user/schoolRegister', { user, msg1: { name }, isUser, cart, totalProduct, school })
//   } else {

//     const school = await School.find({ blocked: false });

//     res.render('user/schoolRegister', { msg1: { name: 'Login' }, school })
//   }

// }

// const isSquare = (width, height) => {
//   return width === height;
// };

// const isLessThan1MP = (width, height) => {
//   const megapixels = (width * height) / 1000000;  
//   return megapixels < 1;
// };


// const createSchool = async (req, res) => {
//   try {


//     const { school_name,
//       email,
//       school_address,
//       pincode,
//       school_district,
//       phone_number,
//       school_code,
//       school_state,
//       userName,
//       userPosition,
//       school_city,
//       created_by,
//       gst } = req.body;

//      const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : null;

//      const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;

//      if (
//       (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))) {
//        console.log('Invalid image dimensions');
//       if (school_logoPath) {
//         fs.unlinkSync(school_logoPath); 
//       }
//       return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
//     }

//      const newSchool = new School({
//       school_name,
//       email,
//       school_address,
//       pincode,
//       school_district,
//       userName,
//       userPosition,
//       phone_number,
//       school_code,
//       school_state,
//       school_city,
//       created_by,
//       gst,
//       school_logo: school_logoPath,
//     });

//      await newSchool.save();

//     res.redirect('/school-registration');
//   } catch (error) {
//     console.error('Error creating Schools:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// };

// const sendOtpEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'kp.levies1972@gmail.com',
//       pass: 'zwufhotkqapmulof'
//     }
//   });

//   const mailOptions = {
//     from: 'kp.levies1972@gmail.comm',
//     to: email,
//     subject: 'Verification Code for Forget Password',
//     text: `Your verification code is: ${otp}`
//   };

//   return transporter.sendMail(mailOptions);
// };


//  const generateOtp = async (req, res) => {
//   try {

//     const email = req.body.email;
//     console.log(email, "This is from generateOtp")
//     const user = await User.findOne({ email });
//     console.log(user, "This is from User")
//     if (!user) {
//       return res.status(404).json({ message: 'User not found generateOtp' });
//     }
//     req.session.forgotpasswordEmail = user.email
//     console.log(req.session.forgotpasswordEmail, "my eamil")
//      const otpCode = Math.floor(100000 + Math.random() * 900000);

//     user.otp = {
//       code: otpCode.toString(),
//       expiration: new Date(Date.now() + 1 * 60 * 1000)
//     };

//     await user.save();

//     await sendOtpEmail(email, otpCode);
//     console.log('OTP sent successfully')
//     res.render("user/verifyOTP")
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error for Sending OTP' });
//   }
// }



// const getGenerateOTP = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {

//     res.redirect('/')
//   }

//   else {

//     res.redirect('/generate-otp')
//   }
// }


// let veryEmail = ''

// const forgotVerifyOtp = async (req, res) => {
//   try {

//     const { otp } = req.body;
//     console.log(otp)
//     if (req.session.forgotpasswordEmail) {
//       veryEmail = req.session.forgotpasswordEmail
//     }
//     const user = await User.findOne({ email: veryEmail });
//     console.log(user, "veryEmail in verifyOtp")

//     if (!user) {
//       console.log('User not found verifyOtp')
//     }

//     if (user.otp.expiration && user.otp.expiration < new Date()) {
//       return res.status(401).json({ message: 'OTP has expired' });
//     }

//     if (user.otp.code !== otp) {
//       console.log('Invalid OTP, Recheck Your OTP')
//       return res.render('error')

//     }

//     user.otp = {
//       code: null,
//       expiration: null
//     };

//     await user.save();
//     console.log('OTP verified successfully in verifyOtp')
//     res.render('user/resetPassword')
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error while verifying OTP' });
//   }
// }


// const resendOtp = async (req, res) => {
//   try {
//     if (req.session.forgotpasswordEmail) {
//       veryEmail = req.session.forgotpasswordEmail;
//     }

//     const user = await User.findOne({ email: veryEmail });

//     if (!user) {
//       console.log('User not found resendOtp');
//     }

//     const lastOtpRequestTime = user.otp.lastRequestTime || 0;
//     const currentTime = new Date().getTime();

//     if (currentTime - lastOtpRequestTime < 60000) {
//       return res.status(429).json({ message: 'Wait for 60 seconds before requesting a new OTP' });
//     }

//     const otpCode = Math.floor(100000 + Math.random() * 900000);

//     user.otp = {
//       code: otpCode.toString(),
//       expiration: new Date(currentTime + 5 * 60 * 1000),
//       lastRequestTime: currentTime
//     };

//     await user.save();

//     await sendOtpEmail(veryEmail, otpCode);
//     console.log('New OTP sent successfully');

//     res.render('user/verifyOTP'); 
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error while resending OTP' });
//   }
// };






// const passwordChanged = async (req, res) => {
//   if (req.session.forgotpasswordEmail) {
//     email = req.session.forgotpasswordEmail
//     res.render('user/passwordChanged')

//   }
//   else {
//     res.redirect('/login')
//   }
// }

// const resetPassword = async (req, res) => {
//   try {
//     const { newPassword, confirmPassword } = req.body;

//     if (newPassword !== confirmPassword) {
//       console.log('Passwords do not match')
//     }
//     if (req.session.forgotpasswordEmail)
//       email = req.session.forgotpasswordEmail
//     console.log("reset Password area ", email)
//     user = await User.findOne({ email });

//     user.password = newPassword;

//     await user.save();
//     console.log('Password reset successfully')
//     res.render("user/passwordChanged")
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }


// const schoolProducts = async (req, res) => {
//   const isUser = req.session.user;
//   const isLogin = await User.findOne({ email: req.session.email, blocked: false })
//   if (isLogin) {



//     if (req.session.user) {


//       const name = req.session.user.name;

//       const category = await Category.find();
//       const product = await Product.find({ blocked: false });

//       const school = await School.find({ blocked: false });


//       res.render('user/allCategory', { msg1: { name }, isUser, category, school, product });

//     } else {

//       const category = await Category.find();
//       const product = await Product.find({ blocked: false });
//       const school = await School.find({ blocked: false });

//       res.render('user/allCategory', { msg1: { name: 'Login' }, category, school, product });

//     }
//   } else {
//     delete req.session.user;
//     res.redirect('/login')
//   }

// }



// const updateUserProfile = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }
//     const { email, name, phone, password } = req.body;
//     const userId = req.session.user._id;

//     const existingUser = await User.findById(userId);

//     const profileImage = req.files && req.files['profileImage'] ? req.files['profileImage'][0].path : null;

//     existingUser.email = email;
//     existingUser.name = name;
//     existingUser.phone = phone;
//     existingUser.password = password;

//     if (profileImage) {
//       existingUser.profileImage = profileImage;

//       if (existingUser.profileImage !== req.session.user.profileImage) {
//         if (fs.existsSync(req.session.user.profileImage)) {
//           fs.unlinkSync(req.session.user.profileImage); 
//         } else {
//           console.log('Old profile image does not exist.');
//         }
//       }
//     }

//     await existingUser.save();

//     res.redirect('/account/personal-data');
//   } catch (error) {
//     console.error(error.message);
//     res.render('error');
//   }
// };

// const updateUserPassword = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }

//     const { password, password_confirmation } = req.body;

//     console.log(req.body.password, "hello password")
//     console.log(req.body.password_confirmation, "hello password_confirmation")
//     if (!password) {
//       return res.status(400).send("Password is required");
//     }

//     if (password !== password_confirmation) {
//       return res.status(400).send("Passwords do not match");
//     }

//     const userId = req.session.user._id;

//     const existingUser = await User.findById(userId);

//     existingUser.password = password;

//     await existingUser.save();

//     res.redirect('/account/personal-data');
//   } catch (error) {
//     console.error(error.message);
//     res.render('error');
//   }
// };


// const myAccountPage = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;
//     const user = await User.findById(req.session.user._id);
//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/myAccount', { user, msg1: { name }, isUser, cart, totalProduct, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }

// const myAddressesPage = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });
//     const user = await User.findById(req.session.user._id);

//     const addresses = await Address.find({ userId: req.session.user._id });

//     console.log(addresses, "Here is your addresses")


//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/myAddresses', { msg1: { name }, isUser, cart, totalProduct, user, addresses, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }

// const AddAddress = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;
//     const user = await User.findById(req.session.user._id);

//     const school = await School.find({ blocked: false });
//     const addresses = await Address.find();

//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/myAddressAdd', { user, addresses, msg1: { name }, isUser, cart, totalProduct, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }

// const addAddressPost = async (req, res) => {
//   try {

//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }

//     const { userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
//     const newAddress = new Address({ userId, fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
//     await newAddress.save();

//     res.redirect('/account/addresses')

//   } catch (error) {
//     console.error(error);
//     res.render('error');
//   }
// };


// const renderEditForm = async (req, res) => {
//   try {
//     const isUser = req.session.user;

//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }
//     const user = await User.findById(req.session.user._id);
//     const school = await School.find({ blocked: false });

//     const name = req.session.user.name;
//     const address = await Address.findById(req.params.id);

//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/myaddressEdit', { user, msg1: { name }, isUser, cart, totalProduct, school, address });
//   } catch (error) {
//     console.error(error);
//     res.render('error');
//   }
// };


// const updateAddress = async (req, res) => {
//   try {

//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }
//     const { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice } = req.body;
//     const school = await School.find({ blocked: false });

//     await Address.findByIdAndUpdate(req.params.id, { fatherName, studentName, email, phone, district, address, landmark, pincode, homeOrOffice });
//     res.redirect('/account/addresses');
//   } catch (error) {
//     console.error(error);
//     res.render('error');
//   }
// };



// const deleteAddress = async (req, res) => {
//   try {

//     const isUser = req.session.user;


//     if (!req.session.user) {
//       console.log('Unauthorized. Please log in.');
//       return res.redirect('/login');
//     }

//     await Address.findByIdAndDelete(req.params.id);
//     res.redirect('/account/addresses');
//   } catch (error) {
//     console.error(error);
//     res.render('error');
//   }
// };

// const myPersonalData = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const user = await User.findById(req.session.user._id);

//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/myPersonalData', { user, msg1: { name }, isUser, cart, totalProduct, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }


// const myPayment = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });

//     const userId = req.session.user._id;
//     const user = await User.findById(req.session.user._id);
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")

//     res.render('user/myPayment', { msg1: { name }, isUser, user, cart, totalProduct, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }


// const myOrder = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;
//     const user = await User.findById(req.session.user._id);
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/myOrders', { msg1: { name }, isUser, user, cart, totalProduct, school })

//   }
//   else {

//     res.redirect('/login')
//   }
// }


// const myWishlist = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;
//     const user = await User.findById(req.session.user._id);
//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/myWishlist', { msg1: { name }, isUser, user, cart, totalProduct, school })

//   }
//   else {


//     res.redirect('/login')
//   }
// }



// const testDrive = async (req, res) => {
//   const isUser = req.session.user;

//   if (req.session.user) {
//     const name = req.session.user.name;

//     const school = await School.find({ blocked: false });
//     const userId = req.session.user._id;

//     const cart = await Cart.findOne({ user: userId }).populate({
//       path: 'products.product',
//       model: 'productDetails',
//       select: 'title sales_cost gallery quantity stock_status'
//     });

//     let totalProduct = 0;
//     if (cart && cart.products) {
//       totalProduct = cart.products.length;
//     }
//     console.log(totalProduct, "totalProduct")
//     res.render('user/index', { msg1: { name }, isUser, cart, totalProduct, school })

//   }
//   else {
//     const school = await School.find({ blocked: false });

//     res.render('user/index', { msg1: { name: 'Login' }, isUser, school })
//   }
// }




// module.exports = {
//   login,
//   loginpost,
//   signup,
//   signupPost,
//   signupVerifyOtp,
//   emailResendOtp,

//   logout,
//   neritt,
//   category,
//   forgotPage,
//   getGenerateOTP,
//   resetPassword,
//   getSchoolProduct,
//   displayProducts,
//   showProduct,
//   showCheckoutPage,
//   storeCheckout,
 
//   buyProduct,

//   getAllOrders,
//   cancelOrder,
//   deleteOrderById,

//   wishlist,
//   addToCart,
//   showCart,
//   updateCartItemQuantity,
//   removeFromCart,
//   // cartGet,
//   schoolRegister,
//   createSchool,

//   generateOtp,
//   forgotVerifyOtp,
//   resendOtp,

//   schoolProducts,


//   myAccountPage,
//   myAddressesPage,
//   AddAddress,
//   addAddressPost,
//   renderEditForm,
//   updateAddress,
//   deleteAddress,
//   myPersonalData,
//   updateUserProfile,
//   updateUserPassword,
//   myPayment,
//   myOrder,
//   myWishlist,


//   testDrive
// }
