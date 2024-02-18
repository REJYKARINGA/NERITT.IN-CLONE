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

const neritt = async (req, res) => {

  const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;
    const category = await Category.find();

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
    console.log(totalProduct)

    const school = await School.find({ blocked: false });

    res.render('user/landingPage', { msg1: { name }, isUser, cart, category, school, totalProduct });

  } else {
    const category = await Category.find();

    const school = await School.find({ blocked: false });
    let totalProduct = 0
    res.render('user/landingPage', { msg1: { name: 'Login' }, category, school, totalProduct, isUser });

  }
}

const category = async (req, res) => {
  const isLogin = await User.findOne({ email: req.session.email, blocked: false })
  if (isLogin) {

    const isUser = req.session.user;

    if (req.session.user) {


      const name = req.session.user.name;
      const category = await Category.find();


      const school = await School.find({ blocked: false });


      res.render('user/allCategory', { msg1: { name }, isUser, category, school });

    } else {
      const category = await Category.find();

      const school = await School.find({ blocked: false });

      res.render('user/allCategory', { msg1: { name: 'Login' }, isUser, category, school, });

    }
  } else {
    delete req.session.user;
    const category = await Category.find();

    const school = await School.find({ blocked: false });
    isUser = ''
    res.render('user/allCategory', { msg1: { name: 'Login' }, category, school, isUser });
  }

}

const getSchoolProduct = async (req, res) => {
  const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;
    const category = await Category.find();
    const product = await Product.find({ blocked: false });
    const school = await School.find({ blocked: false });

    res.render('user/schoolProducts', { msg1: { name: 'Login' }, category, school, product });


  }
  else {
    const category = await Category.find();
    const product = await Product.find({ blocked: false });
    const school = await School.find({ blocked: false });


    res.render('user/schoolProducts', { msg1: { name: 'Login' }, category, school, product });
  }
}

const displayProducts = async (req, res) => {
  const isUser = req.session.user;

  if (req.session.user) {
    const name = req.session.user.name;

    const schoolId = req.query.sch;

    console.log(schoolId, "schoolId ");


    const products = await Product.find({ school: { $in: [schoolId] }, blocked: false })
      .populate('school') 
      .exec();

    const category = await Category.find({});
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

    res.render('user/schoolProducts', { msg1: { name }, isUser, cart, totalProduct, products, school, category });


  }
  else {
    const schoolId = req.query.sch;
    console.log(schoolId, "schoolId ");

    const products = await Product.find({ school: { $in: [schoolId] }, blocked: false })
      .populate('school').populate('category') 
      .exec();
    console.log(products)
    const category = await Category.find({});
    const school = await School.find({ blocked: false });


    res.render('user/schoolProducts', { msg1: { name: 'Login' }, isUser, products, school, category });
  }
}

const showProduct = async (req, res) => {
  const isUser = req.session.user;

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

    res.render('user/product', { msg1: { name }, isUser, cart, totalProduct, products, school, category, productsAll });


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

      res.render('user/product', { msg1: { name: 'Login' }, isUser, products, school, category, productsAll });
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }


  }
}

const showCheckoutPage = async (req, res) => {
  try {
    const isUser = req.session.user;
    const ordId = orderId();
    console.log(ordId);

   
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const userId = req.session.user._id;

    
    const addresses = await Address.find({ userId: req.session.user._id });

   
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity '
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
    const name = req.session.user.name;
    const school = await School.find({ blocked: false });
    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }

    res.render('user/checkout', {
      cart,
      addresses,
      totalAmount,
      totalCGST, totalSGST,
      totaldeliveryCost, msg1: { name }, school, isUser, totalProduct, finalAmount, ordId

    });
  } catch (error) {
    console.error('Error showing checkout page:', error);
    res.redirect('/'); 
  }
};

const storeCheckout = async (req, res) => {
  try {
    const isUser = req.session.user;

    if (!req.session.user) {
      return res.redirect('/login');
    }
    const name = req.session.user.name;
    
    const currentUser = req.session.user;
    console.log(currentUser, "huiii");

    const userId = req.session.user.id;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost quantity' 
    });

    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }
    const school = await School.find({ blocked: false });
   
    const { fatherName, studentName, email, phone, district, addressId, address, landmark, pincode, homeOrOffice, products, finalAmount, deliveryType, order_id } = req.body;
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

    
    const isExistingUser = await Cart.findOne({ user: currentUser._id }).populate('products');
    console.log(isExistingUser.products, "hello");

    const order = new Order({
      user: req.session.user._id,
      products: isExistingUser.products.map(prod => prod),
      totalAmount: finalAmount, 
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
    const ordId = order_id;
    console.log(ordId, 'ordId');

    await order.save();

     for (const product of isExistingUser.products) {
      await Product.findByIdAndUpdate(product.product._id, { $inc: { quantity: -product.quantity } });
    }

   const isCartExist = await Cart.findOneAndUpdate({ user: currentUser._id }, { products: [] });
    console.log("isexist", isCartExist);

   res.render('user/myOrderSuccess', { user: req.session.user, ordId, msg1: { name }, isUser, cart, totalProduct, school, userId });
  } catch (error) {
    console.error('Error storing checkout details:', error.message);
    res.status(500).send('Internal server error');
  }
};

const buyProduct = async (req, res) => {
  try {
    const isUser = req.session.user;
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
      res.render('user/productBuy', { user, addresses, products, msg1: { name }, isUser, ordId, cart, totalProduct, school, category });
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
    const isUser=req.session.user;

    if (!req.session.user) {

      res.redirect('/login')}
      
      const name = req.session.user.name;
      const user = await User.findById(req.session.user._id);
const orders = await Order.find({ user: req.session.user._id })
    .populate('user') 
    .populate('products.product') 
    .populate('address'); 
        console.log(orders);
        const school = await School.find({ blocked: false });
   
      res.render('user/myOrders1',{user:req.session.user._id,orders,msg1:{name},user,school, isUser})
  } catch (error) {
      console.log(error.message)
      res.render('/login')
  }
};

const cancelOrder = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const orderId = req.params.id;
    console.log(orderId, 'orderId');

    // Find the order by its ID and update its status to 'cancelled'
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    // Check if the order exists
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order status is already 'cancelled' or 'cancelledByAdmin'
    if (
      updatedOrder.status !== 'cancelled' &&
      updatedOrder.status !== 'cancelledByAdmin'
    ) {
      // Retrieve the product details from the cancelled order
      const products = updatedOrder.products;

      // Iterate over each product in the cancelled order
      for (const product of products) {
        const productId = product.product; // Extract productId from the product
        const productQuantity = product.quantity; // Extract product quantity

        // Find the product by its ID and increment the quantity
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { quantity: productQuantity } },
          { new: true }
        );
      }
    }

    console.log(updatedOrder, 'updatedOrder');
    res.redirect('/orders'); // Redirect to my orders page after cancelling the order
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
    res.render('user/wishlist', { msg1: { name }, isUser, cart, totalProduct, school })

  }
  else {
    const school = await School.find({ blocked: false });

    res.render('user/login', { msg1: { name: 'Login' }, school })
  }
}

const addToCart = async (req, res) => {
  try {
    if (!req.session.user) {
      console.log("Unauthorized login");
      return res.redirect('/login');
    }

    const productId = req.params.productId;
    const userId = req.session.user._id;

    
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery'
    });

    if (!cart) {
      
      cart = new Cart({ user: userId, products: [] });
    }
    req.session.cart = cart;
    const product = await Product.findById(productId);

     const existingProduct = cart.products.find(item => item.product.equals(productId));
    if (existingProduct) {
      return res.redirect(`/view-product/${productId}?alreadyInCart=true`);
    }

   cart.products.push({
      product: product._id,
      name: product.title,
      price: product.sales_cost,
      image: product.gallery.length > 0 ? product.gallery[0] : null
    });

    await cart.save();
    console.log("addedSuccessfully")
    return res.redirect(`/view-product/${productId}?addedSuccessfully=true`);
  } catch (error) {
    res.redirect('/')
  }
};

const showCart = async (req, res) => {
  try {
    const isUser = req.session.user;

    if (!req.session.user) {
      return res.redirect('/login');
    }

    const name = req.session.user.name;
    const school = await School.find({ blocked: false });

    const userId = req.session.user._id;
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'products.product',
      model: 'productDetails',
      select: 'title sales_cost gallery quantity stock_status'
    });

    let totalItems = 0;
    let subtotal = 0;
    if (cart) {
      for (const product of cart.products) {
        totalItems += product.quantity;
        subtotal += product.price * product.quantity;
        console.log(subtotal, "product.price");

        if (product.quantity === 0) {
          product.outOfStockMessage = 'Out of Stock';
        }
      }
    }

    let totalProduct = 0;
    if (cart && cart.products) {
      totalProduct = cart.products.length;
    }
    console.log(totalProduct, "totalProduct");

    res.render('user/cart', {
      msg1: { name }, isUser, school,
      cart: cart,
      totalItems: totalItems,
      subtotal: subtotal, 
      totalProduct
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

    
    const cart = await Cart.findOne({ user: userId });
    console.log(cart)
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
      return res.render('user/cart', { msg1: { name }, isUser, school });
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.redirect('/');
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
  const isLogin = await User.findOne({ email: req.session.email, blocked: false })
  if (isLogin) {



    if (req.session.user) {


      const name = req.session.user.name;

      const category = await Category.find();
      const product = await Product.find({ blocked: false });

      const school = await School.find({ blocked: false });


      res.render('user/allCategory', { msg1: { name }, isUser, category, school, product });

    } else {

      const category = await Category.find();
      const product = await Product.find({ blocked: false });
      const school = await School.find({ blocked: false });

      res.render('user/allCategory', { msg1: { name: 'Login' }, category, school, product });

    }
  } else {
    delete req.session.user;
    res.redirect('/login')
  }

}

module.exports = {
    neritt,
    category,
    // getSchoolProduct,
    displayProducts,
    showProduct,
    showCheckoutPage,
    storeCheckout,
    buyProduct,
    getAllOrders,
    cancelOrder,
    deleteOrderById,
    wishlist,
    addToCart,
    showCart,
    updateCartItemQuantity,
    removeFromCart,
    // schoolProducts
  }