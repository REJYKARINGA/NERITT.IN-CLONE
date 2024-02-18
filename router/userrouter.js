const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const userController = require('../controller/usercontroller')
const Cart = require('../model/cartSchema')

const multer = require('multer');
const path  = require('path')
 
// Configure multer to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') // Adjust the destination folder as needed
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

 
router.get('/',userController.neritt)
router.get('/getCategory',userController.category)
router.get('/shop',userController.displayProducts)
router.get('/view-product/:id', userController.showProduct);
router.get("/login-status/:id",userController.buyProduct)
router.get('/cart', userController.showCart);
router.get('/add-to-cart/:productId', userController.addToCart);
router.get('/update-cart-quantity/:productId', userController.updateCartItemQuantity)

router.get('/checkout', userController.showCheckoutPage);
router.get('/store_checkout', userController.showCheckoutPage);
router.post('/store_checkout', userController.storeCheckout);

router.post('/remove-from-cart/:productId', userController.removeFromCart);


router.get('/orders', userController.getAllOrders);
router.post('/orders/:orderId', userController.deleteOrderById)
router.post('/cancel-order/:id', userController.cancelOrder)


router.get('/wishlist',userController.wishlist)

router.get('/login',userController.login) 
router.post('/login',userController.loginpost) /* */
router.get('/forgotPage',userController.forgotPage) /* 1*/
router.get('/generate-otp', userController.getGenerateOTP);/*2 */
router.post('/generate-otp', userController.generateOtp);/*2 */
router.post('/resend-otp', userController.resendOtp);

router.post('/verify-otp', userController.forgotVerifyOtp);/*3*/
router.get('/reset-password', userController.forgotVerifyOtp);/*4*/
router.post('/reset-password', userController.resetPassword);/*5*/

router.get('/signup',userController.signup)


router.post('/signup',userController.signupPost)
router.post('/signupVerifyOtp', userController.signupVerifyOtp);/*3*/
router.post('/signResendOtp', userController.emailResendOtp);

  
router.get('/logout',userController.logout)
 
router.get('/school-registration',userController.schoolRegister)
router.post('/schoolRegister', upload.fields([{ name: 'school_logo', maxCount: 1 }]), userController.createSchool);


router.get("/test",userController.testDrive)



router.get("/myAccountPage",userController.myAccountPage)
router.get("/account",userController.myAccountPage)
router.get("/account/personal-data",userController.myPersonalData)
router.post("/profile/update",upload.fields([{ name: 'profileImage', maxCount: 1 }]),userController.updateUserProfile)

router.post("/password/update",userController.updateUserPassword)
router.get("/account/addresses",userController.myAddressesPage)
router.get("/account/AddAddress",userController.AddAddress)
router.post("/address/add",userController.addAddressPost)

router.get('/address/:id/edit',userController.renderEditForm);
router.post('/address/:id/edit', userController.updateAddress);
router.post('/address/:id/delete', userController.deleteAddress);

router.get("/account/payments",userController.myPayment)
router.get("/account/orders",userController.myOrder) 
router.get("/account/wishlist",userController.myWishlist)

// Not Designed yet
router.get("/account/award",userController.myAccountPage)



router.get("/set-session",userController.displayProducts)
module.exports = router; 
