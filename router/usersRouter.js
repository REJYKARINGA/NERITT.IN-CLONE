const express = require('express')
var app = express();
const router = express.Router()
const multer = require('multer');
const path = require('path')

const { body, validationResult } = require('express-validator');
const authController = require('../controller/user/authController');
const miscellaneousController = require('../controller/user/miscellaneousController');
const productController = require('../controller/user/productController');
const schoolController = require('../controller/user/schoolController');
const userProfileController = require('../controller/user/userProfileController');
const addressController = require('../controller/user/addressController');
const exampleController = require('../controller/user/errorController');
const Order = require('../model/orderSchema');
const Product = require('../model/productSchema');
router.get('/divide', exampleController.divide);
const walletController = require('../controller/user/walletController');
const Cart = require('../model/cartSchema');




const invoiceController = require('../controller/user/invoice')

// Route to generate invoice
router.get('/generate-invoice/:orderId', invoiceController.generateInvoice);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024, // 1 MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed.'));
        }
    },
});


// Authentication and User Management
router.get('/login', authController.login);
router.post('/login', authController.loginPost);
router.get('/signup', authController.signup);
router.post('/signup', authController.signupPost);
router.post('/signupVerifyOtp', authController.signupVerifyOtp);
router.post('/signResendOtp', authController.emailResendOtp);
router.get('/logout', authController.logout);
router.get('/forgotPage', authController.forgotPage);
router.get('/generate-otp', authController.getGenerateOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/generate-otp', authController.generateOtp);
router.post('/verify-otp', authController.forgotVerifyOtp);
router.get('/reset-password', authController.forgotVerifyOtp);
router.post('/resend-otp', authController.resendOtp);


// Product Display and Management
router.get('/', productController.neritt);
router.get('/getCategory', productController.category);
router.get('/shop', productController.displayProducts);


router.get('/topCategories', productController.topCategories);
router.get('/topProducts', productController.topProducts);

router.get("/set-session", productController.displayProducts);
router.get('/view-product/:id', productController.showProduct);
router.get("/login-status/:id", productController.buyProduct);
router.get('/cart', productController.showCart);
router.get('/add-to-cart/:productId', productController.addToCart);
router.post('/update-cart-quantity', productController.updateCartItemQuantity);
router.get('/checkout', productController.showCheckoutPage);
router.post('/store_checkout', productController.storeCheckout);
router.post('/store_checkoutFailed', productController.failedStoreCheckout);


router.get('/store_checkout', productController.showCheckoutPage);
router.post('/remove-from-cart/:productId', productController.removeFromCart);
router.get('/wishlist', productController.wishlist);
router.get('/wallet', productController.getWallet);
router.get('/wishlist/add/:id', productController.addToWishlist);
router.get('/wishlist/remove/:productId', productController.removeFromWishlist);

// Assuming you have imported the necessary models and middleware
router.post('/applyCoupon', productController.applyCoupon)
router.post('/removeCoupon', productController.removeCoupon);

// Order Management  
router.get('/orders', productController.getAllOrders);
router.post('/orders/:orderId', productController.deleteOrderById);
router.post('/cancel-order/:id/:productId', productController.cancelOrder);
router.post('/return-order/:id/:productId', productController.returnOrder);
router.get('/retry-order/:orderId/:productId', productController.getRetryOrder);
router.post('/retryCheckout/:orderId/:productId', productController.postRetryOrder);

// School Registration
router.get('/school-registration', schoolController.schoolRegister);
router.post('/schoolRegister', upload.fields([{ name: 'school_logo', maxCount: 1 }]), schoolController.createSchool);

// User Account Management
router.get("/myAccountPage", userProfileController.myAccountPage);
router.get("/account", userProfileController.myAccountPage);
router.get("/account/personal-data", userProfileController.myPersonalData);
router.post("/profile/update", upload.fields([{ name: 'profileImage', maxCount: 1 }]), userProfileController.updateUserProfile);
router.post("/password/update", userProfileController.updateUserPassword);
router.get("/account/addresses", addressController.myAddressesPage);
router.get("/account/AddAddress", addressController.AddAddress);
router.post("/address/add", addressController.addAddressPost);
router.get('/address/:id/edit', addressController.editAddress);
router.post('/address/:id/edit', addressController.updateAddress);
router.post('/address/:id/delete', addressController.deleteAddress);
router.get("/account/payments", userProfileController.myPayment);
router.get("/account/orders", userProfileController.myOrder);
router.get("/account/wishlist", userProfileController.myWishlist);
router.get("/account/award", userProfileController.myAccountPage); // Not Designed yet

// Test Drive Management
router.get("/test", miscellaneousController.testDrive);



module.exports = router;  