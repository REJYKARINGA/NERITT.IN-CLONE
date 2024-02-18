const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const User = require('./model/userSchema');
const Category = require('./model/categorySchema');
const Product = require('./model/productSchema');
const adminRouter = require('./router/adminRouter');
const userRouter = require('./router/userRouter');
const nocache = require('nocache');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();
require('./db/mongoose');

// Set up Express
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use("/public", express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret: "secret",
  resave:false,
  saveUninitialized: false
}));
app.use(nocache());
app.use(morgan('tiny'));
app.use(flash());

// Routes
app.use('/admin', adminRouter);
app.use('/', userRouter);

// Middleware
app.get('*', function (req, res, next) { 
    res.locals.cart = req.session.cart;
    next(); 
});

// Route handlers
app.get('/delete-category/:id', async (req, res) => {
  try {
      const categoryId = req.params.id;
      const deletedCategory = await Category.findByIdAndDelete(categoryId);
      if (!deletedCategory) {
          return res.status(404).send('Category not found');
      }
      res.redirect('/admin/categories');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/delete-products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/admin/products/update/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/admin/edit-products/:id');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start server
const port = 4000;
app.listen(port, (err) => {
    if (err) { 
        console.log("Found Error");
    }
    console.log(`Server Running port = ${port}`);
});
