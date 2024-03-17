require("../../db/mongoose")
const fs = require('fs')
const User = require('../../model/userSchema')
const Category = require('../../model/categorySchema');
const Swal = require('sweetalert2');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sizeOf = require('image-size');
const orderId = require('../../public/js/orderId')


const login = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {

      res.redirect('/')
    }
    else {
      res.render('user/login')
    }
  } catch (error) {
    return next(error);
  }
}

const loginPost = async (req, res, next) => {
  try {

    const email = req.body.email

    const password = req.body.password
    const userCorrect = await User.findOne({ email: email, blocked: false })
    if (!userCorrect) return res.redirect("back")
    if (!userCorrect) {
      res.render('error')
    } else {
      if (userCorrect.password == password) {
        req.session.user = userCorrect
        req.session.email = userCorrect.email

        res.redirect("/");
      } else
        if (userCorrect.blocked) {
          res.redirect('/login')
        } else {
          res.render('error')
        }
    }
  } catch (error) {
    return next(error);
  }
}

const signup = async (req, res, next) => {
  try {
    const isUser = req.session.user;

    let walletBalance = 0;

    if (req.session.user) {

      res.redirect('/')
    } else {
      const category = await Category.find();

      res.render('user/signup', { msg1: { name: 'Login' }, isUser, category });


    }
  } catch (error) {
    return next(error);
  }

}

const signupPost = async (req, res, next) => {
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
    return next(error);
  }
};

const signupVerifyOtp = async (req, res, next) => {
  try {
    let verifyEmail = ""
    const { otp } = req.body;
    if (req.session.verifyEmail) {
      verifyEmail = req.session.verifyEmail
    }
    const user = await User.findOne({ email: verifyEmail });

    if (!user) {
      console.log('User not found signupVerifyOtp')
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
    res.redirect('/login')
  } catch (error) {
    return next(error);
  }
}

const emailResendOtp = async (req, res, next) => {
  try {
    if (req.session.verifyEmail) {
      verifyEmail = req.session.verifyEmail;
    }

    const user = await User.findOne({ email: verifyEmail });

    if (!user) {
      console.log('User not found emailResendOtp');
    }
    const lastOtpRequestTime = user.otp.lastRequestTime || 0;
    const currentTime = new Date().getTime();

    if (currentTime - lastOtpRequestTime < 60000) {
      return res.status(429).json({ message: 'Wait for 60 seconds before requesting a new OTP' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    user.otp = {
      code: otpCode.toString(),
      expiration: new Date(currentTime + 1 * 60 * 1000),
      lastRequestTime: currentTime
    };

    await user.save();
    await sendOtpEmail(verifyEmail, otpCode);

    res.render('user/signupVerifyOTP');
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res, next) => {

  try {
    if (req.session.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.redirect('/');
        }
      });
    }
  } catch (error) {
    return next(error);
  }
}

const forgotPage = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect('/')

    }
    else {
      res.render('user/forgot_Password')
    }
  } catch (error) {
    return next(error);
  }
}

const getGenerateOTP = async (req, res, next) => {
  try {
    const isUser = req.session.user;



    let walletBalance = 0;

    if (req.session.user) {

      res.redirect('/')
    }

    else {

      res.redirect('/generate-otp')
    }
  } catch (error) {
    return next(error);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match')
    }
    if (req.session.forgotpasswordEmail)
      email = req.session.forgotpasswordEmail
    user = await User.findOne({ email });

    user.password = newPassword;

    await user.save();
    res.render("user/passwordChanged")
  } catch (error) {
    return next(error);
  }
}

const generateOtp = async (req, res, next) => {
  try {

    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found generateOtp' });
    }
    req.session.forgotpasswordEmail = user.email;
    const otpCode = Math.floor(100000 + Math.random() * 900000);

    user.otp = {
      code: otpCode.toString(),
      expiration: new Date(Date.now() + 1 * 60 * 1000)
    };

    await user.save();

    await sendOtpEmail(email, otpCode);
    res.render("user/verifyOTP")
  } catch (error) {
    return next(error);
  }
}

const forgotVerifyOtp = async (req, res, next) => {
  try {
    let veryEmail = ''
    const { otp } = req.body;
    if (req.session.forgotpasswordEmail) {
      veryEmail = req.session.forgotpasswordEmail
    }
    const user = await User.findOne({ email: veryEmail });

    if (!user) {
      console.log('User not found verifyOtp')
    }

    if (user.otp.expiration && user.otp.expiration < new Date()) {
      return res.status(401).json({ message: 'OTP has expired' });
    }

    if (user.otp.code !== otp) {
      return res.render('error')

    }

    user.otp = {
      code: null,
      expiration: null
    };

    await user.save();
    res.render('user/resetPassword')
  } catch (error) {
    return next(error);
  }
}

const resendOtp = async (req, res, next) => {
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

    res.render('user/verifyOTP');
  } catch (error) {
    return next(error);
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

const passwordChanged = async (req, res, next) => {
  try {
    if (req.session.forgotpasswordEmail) {
      email = req.session.forgotpasswordEmail
      res.render('user/passwordChanged')

    }
    else {
      res.redirect('/login')
    }
  } catch (error) {
    return next(error);
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