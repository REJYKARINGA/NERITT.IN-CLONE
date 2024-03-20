require('express')
const dotenv = require("dotenv");
dotenv.config({ path: './.env' })
const name = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;


const login = (req, res, next) => {
  try {

    if (req.session.admin) {
      res.redirect('/admin/dashboard');
    } else {

      res.render('admin/adminLogin.ejs');
    }
  } catch (error) {
    return next(error);
  }
};


const loginValidate = (req, res, next) => {
  try {
    const { username, password } = req.body;


    if (name === username && password === req.body.password) {

      req.session.admin = true;
      return res.redirect('/admin/dashboard');
    } else {
      const error = new Error('Invalid username or password');
      error.statusCode = 400;
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};


const logout = (req, res, next) => {
  try {

    delete req.session.admin;

    res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
};



module.exports = {
  login,
  loginValidate,
  logout
}