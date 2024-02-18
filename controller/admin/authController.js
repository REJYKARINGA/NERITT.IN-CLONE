require('express')



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
    const name = 'RejiMan'
    const password = '12345'
   
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