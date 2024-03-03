require('express')
const dotenv = require("dotenv");
dotenv.config({ path:  './view/config.env'})
const name =process.env.ADMIN_USERNAME;
const password =process.env.ADMIN_PASSWORD;
console.log(typeof name, typeof password,'admin details')

// Authentication and Session Management
const login = (req, res) => {
    console.log('enter');
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    }
    else {
     
      console.log('enter here  the else');
      res.render('admin/adminLogin.ejs')
    }
  
  }
  
  const loginValidate = (req, res) => {
    
   
    if (name === req.body.username && password == req.body.password) {
  
      
      req.session.admin = true;
  
      res.redirect('/admin/dashboard')
    } else {
  
      res.render('admin/aLogin')
    }
  }
  
  
  const logout = (req, res) => {
  
    delete req.session.admin
    res.redirect('/admin')
    
  
  }


  module.exports = {
    login,
    loginValidate,
    logout
  }