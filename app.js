const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const User = require('./model/userSchema')
const cate_gory = require('./model/categorySchema')
const product = require('./model/productSchema')

const adminRouter= require('./router/admin') 
const userRouter= require('./router/userrouter') 
const nocache = require('nocache')
const morgan=require('morgan')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const dotenv = require('dotenv');
dotenv.config();
// const ejs= require('ejs')
// view engine setup
require('./db/db')

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use("/public",express.static('public'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}))   


app.use(session({
  secret: "secret",
  resave:false,
  saveUninitialized: false
}))

app.use(nocache())
app.use(morgan('tiny'));
app.use(flash())
app.use('/admin',adminRouter)
app.use('/',userRouter)

app.get('*', function (req, res, next) { 
    res.locals.cart = req.session.cart;
    next(); 
}
    );

 

// Delete category route
app.get('/delete-category/:id', async (req, res) => {
  try {
      const categoryId = req.params.id;

      // Delete the category from the database
      const deletedCategory = await cate_gory.findByIdAndDelete(categoryId);
console.log(deletedCategory)
      if (!deletedCategory) {
          return res.status(404).send('Category not found');
      }

      // Redirect or send a response as needed
      res.redirect('/admin/categories'); // Redirect to the category list page
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

// Delete products route
app.get('/delete-products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
  
        // Delete the products from the database
        const deletedProduct = await product.findByIdAndDelete(productId);
  console.log(deletedProduct)
        if (!deletedProduct) {
            return res.status(404).send('Product not found');
        }
  
        // Redirect or send a response as needed
        res.redirect('/admin/products'); // Redirect to the products list page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });

  // Delete gallery route
app.get('/admin/products/update/:id', async (req, res) => {
    try {
        const galleryId = req.params.id;
  
        // Delete the gallery from the database
        const deletedGallery = await product.findByIdAndDelete(galleryId);
  console.log(deletedGallery)
        if (!deletedGallery) {
            return res.status(404).send('Gallery not found');
        }
  
        // Redirect or send a response as needed
        res.redirect('/admin/edit-products/:id'); // Redirect to the gallery list page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });


const port =4000
app.listen(port,(err)=>{
    if (err){ 
        console.log("Found Error")
    }
    console.log(`Server Running port = ${port}`)
}) 






