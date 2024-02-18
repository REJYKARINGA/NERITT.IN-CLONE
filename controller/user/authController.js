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


const login = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
  
      res.redirect('/')
    }
    else {
      res.render('user/login')
    }
  }
  
  const loginPost = async (req, res) => {
    try {
  
      const email = req.body.email
      console.log(email, "email")
      const password = req.body.password
      const userCorrect = await User.findOne({ email: email, blocked: false })
      if (!userCorrect) return res.redirect("back")
  
      console.log("Blocked situation is : ", userCorrect,)
      // res.send(getemail)
      if (!userCorrect) {
        res.render('error')
      } else {
        if (userCorrect.password == password) {
          req.session.user = userCorrect
          req.session.email = userCorrect.email
          console.log(req.session.user);
  
          res.redirect("/");
        } else
          if (userCorrect.blocked) {
            console.log('User is blocked', userCorrect.blocked)
            res.redirect('/login')
          } else {
            res.render('error')
          }
      }
    } catch (error) {
      console.log(error)
      res.render('error')
    }
  }

  const signup = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
  
      res.redirect('/')
    } else {
      const category = await Category.find();
  
      const school = await School.find({ blocked: false });
  
      res.render('user/signup', { msg1: { name: 'Login' }, isUser,category, school });
  
  
    }
  
  }

const signupPost = async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
  
       const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.render('user/signup', { message: 'Email already registered.' });
      }
  
       const otpCode = Math.floor(100000 + Math.random() * 900000);
  
      const userdata = new User({
        name,
        email,
        phone,
        password,
        otp: {
          code: otpCode.toString(),
          expiration: new Date(Date.now() + 1 * 60 * 1000)
        }
      });
  
      await userdata.save();
  
       await sendOtpEmail(email, otpCode);
  
       req.session.verifyEmail = email;
  
       res.render('user/signupVerifyOTP');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error for signup' });
    }
  };

const signupVerifyOtp = async (req, res) => {
    try {
      let verifyEmail = ""
      const { otp } = req.body;
      console.log(otp)
      if (req.session.verifyEmail) {
        verifyEmail = req.session.verifyEmail
      }
      const user = await User.findOne({ email: verifyEmail });
      console.log(user, "verifyEmail in verifyOtp")
  
      if (!user) {
        console.log('User not found signupVerifyOtp')
      }
  
      // Check if OTP is expired
      if (user.otp.expiration && user.otp.expiration < new Date()) {
        return res.status(401).json({ message: 'OTP has expired' });
      }
  
      // Check if the entered OTP matches the stored OTP
      if (user.otp.code !== otp) {
        console.log('Invalid OTP, Recheck Your OTP')
        return res.render('error')
  
      }
  
      // Clear the OTP details after successful verification
      user.otp = {
        code: null,
        expiration: null
      };
  
      await user.save();
      console.log('OTP verified successfully in verifyOtp. Please Login Again')
      res.redirect('/login')
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error while verifying OTP' });
    }
  }

const emailResendOtp = async (req, res) => {
    try {
      if (req.session.verifyEmail) {
        verifyEmail = req.session.verifyEmail;
      }
  
      const user = await User.findOne({ email: verifyEmail });
  
      if (!user) {
        console.log('User not found emailResendOtp');
      }
  
      // Check if 60 seconds have passed since the last OTP request
      const lastOtpRequestTime = user.otp.lastRequestTime || 0;
      const currentTime = new Date().getTime();
  
      if (currentTime - lastOtpRequestTime < 60000) {
        return res.status(429).json({ message: 'Wait for 60 seconds before requesting a new OTP' });
      }
  
      // Generate a new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000);
  
      // Set the new OTP in the user document and update the last request time
      user.otp = {
        code: otpCode.toString(),
        expiration: new Date(currentTime + 1 * 60 * 1000),
        lastRequestTime: currentTime
      };
  
      await user.save();
  
      // Send the new OTP via email
      await sendOtpEmail(verifyEmail, otpCode);
      console.log('New OTP sent successfully');
  
      res.render('user/signupVerifyOTP'); // Redirect to the verification page
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error while resending OTP' });
    }
  };

const logout = (req, res) => {

    if (req.session.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.redirect('/');  
        }
      });
    }
  }
  
const forgotPage = async (req, res) => {
    if (req.session.user) {
      res.redirect('/')
  
    }
    else {
      res.render('user/forgot_Password')
    }
  }

  
const getGenerateOTP = async (req, res) => {
    const isUser = req.session.user;
  
    if (req.session.user) {
  
      res.redirect('/')
    }
  
    else {
  
      res.redirect('/generate-otp')
    }
  }

const resetPassword = async (req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;
  
      if (newPassword !== confirmPassword) {
        console.log('Passwords do not match')
      }
      if (req.session.forgotpasswordEmail)
        email = req.session.forgotpasswordEmail
      console.log("reset Password area ", email)
      user = await User.findOne({ email });
  
      user.password = newPassword;
  
      await user.save();
      console.log('Password reset successfully')
      res.render("user/passwordChanged")
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

const generateOtp = async (req, res) => {
    try {
  
      const email = req.body.email;
      console.log(email, "This is from generateOtp")
      const user = await User.findOne({ email });
      console.log(user, "This is from User")
      if (!user) {
        return res.status(404).json({ message: 'User not found generateOtp' });
      }
      req.session.forgotpasswordEmail = user.email
      console.log(req.session.forgotpasswordEmail, "my eamil")
       const otpCode = Math.floor(100000 + Math.random() * 900000);
  
      user.otp = {
        code: otpCode.toString(),
        expiration: new Date(Date.now() + 1 * 60 * 1000)
      };
  
      await user.save();
  
      await sendOtpEmail(email, otpCode);
      console.log('OTP sent successfully')
      res.render("user/verifyOTP")
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error for Sending OTP' });
    }
  }

const forgotVerifyOtp = async (req, res) => {
    try {
      let veryEmail = ''
      const { otp } = req.body;
      console.log(otp)
      if (req.session.forgotpasswordEmail) {
        veryEmail = req.session.forgotpasswordEmail
      }
      const user = await User.findOne({ email: veryEmail });
      console.log(user, "veryEmail in verifyOtp")
  
      if (!user) {
        console.log('User not found verifyOtp')
      }
  
      if (user.otp.expiration && user.otp.expiration < new Date()) {
        return res.status(401).json({ message: 'OTP has expired' });
      }
  
      if (user.otp.code !== otp) {
        console.log('Invalid OTP, Recheck Your OTP')
        return res.render('error')
  
      }
  
      user.otp = {
        code: null,
        expiration: null
      };
  
      await user.save();
      console.log('OTP verified successfully in verifyOtp')
      res.render('user/resetPassword')
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error while verifying OTP' });
    }
  }

const resendOtp = async (req, res) => {
    try {
      if (req.session.forgotpasswordEmail) {
        veryEmail = req.session.forgotpasswordEmail;
      }
  
      const user = await User.findOne({ email: veryEmail });
  
      if (!user) {
        console.log('User not found resendOtp');
      }
  
      const lastOtpRequestTime = user.otp.lastRequestTime || 0;
      const currentTime = new Date().getTime();
  
      if (currentTime - lastOtpRequestTime < 60000) {
        return res.status(429).json({ message: 'Wait for 60 seconds before requesting a new OTP' });
      }
  
      const otpCode = Math.floor(100000 + Math.random() * 900000);
  
      user.otp = {
        code: otpCode.toString(),
        expiration: new Date(currentTime + 5 * 60 * 1000),
        lastRequestTime: currentTime
      };
  
      await user.save();
  
      await sendOtpEmail(veryEmail, otpCode);
      console.log('New OTP sent successfully');
  
      res.render('user/verifyOTP'); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error while resending OTP' });
    }
  };

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kp.levies1972@gmail.com',
        pass: 'zwufhotkqapmulof'
      }
    });
  
    const mailOptions = {
      from: 'kp.levies1972@gmail.comm',
      to: email,
      subject: 'Verification Code for Forget Password',
      text: `Your verification code is: ${otp}`
    };
  
    return transporter.sendMail(mailOptions);
  };
  

const passwordChanged = async (req, res) => {
    if (req.session.forgotpasswordEmail) {
      email = req.session.forgotpasswordEmail
      res.render('user/passwordChanged')
  
    }
    else {
      res.redirect('/login')
    }
  }

module.exports = {
      login,
      loginPost,
      signup,
      signupPost,
      signupVerifyOtp,
      emailResendOtp,
      logout,
      forgotPage,
      getGenerateOTP,
      resetPassword,
      generateOtp,
      forgotVerifyOtp,
      resendOtp
    }