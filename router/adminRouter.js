const express = require('express')
var app = express();
const router = express.Router()
const multer = require('multer'); 
const path  = require('path')

const authController = require('../controller/admin/authController');
const userController = require('../controller/admin/userController');
const categoryController = require('../controller/admin/categoryController');
const schoolController = require('../controller/admin/schoolController');
const productController = require('../controller/admin/productController');
const orderController = require('../controller/admin/orderController');
const couponController = require('../controller/admin/couponController');
const salesController = require('../controller/admin/salesController');
  

 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') 
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
        // Add your file filter logic here
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed.'));
        }
    },
});



// Authentication Routes
router.get('/', authController.login);
router.post('/dashboard', authController.loginValidate);
router.get('/logout', authController.logout);

// Dashboard and User Management routes
router.get('/dashboard', userController.dashboard);
router.get('/admin-dashboard', userController.dashboard);
router.get('/salesReport', salesController.salesReportDate);
router.get('/sales-Report', salesController.salesReportDate);
router.post('/salesReport', salesController.sales_ReportDate );


// router.get('/sales-Report', salesController.salesReportDate);
router.get('/sales-export', salesController.salesExport);
router.get('/generate-pdf-sales-report', salesController.salesReportPdf);
 
router.get('/users', userController.users);
router.get('/users/:id/block', userController.toggleBlockStatus);

// Category Routes
router.get('/categories', categoryController.categories);
router.post('/categories/store', upload.fields([{ name: 'logo_image', maxCount: 1 }, { name: 'banner_image', maxCount: 1 }]), categoryController.createCategory);
router.get('/edit/:id', categoryController.editCategory);
router.post('/edit/:id', upload.fields([{ name: 'logo_image', maxCount: 1 }]), categoryController.updateCategory);

// Order Routes 
router.get('/orders', orderController.displayOrders);
router.get('/order-details/:orderId/:productId', orderController.getOrderDetailsById);
router.post('/updateOrderStatus/:orderId', orderController.updateOrderStatus);
router.get('/failed-orders', orderController.displayPendingOrders);
router.get('/cancelled-orders', orderController.displayCancelledOrders);

// School Routes
router.get('/schools', schoolController.displaySchools);
router.get('/schools-add', schoolController.displayCreateSchool);
router.post('/schools-add', upload.fields([{ name: 'school_logo', maxCount: 1 }]), schoolController.createSchool);
router.get('/schools/:id/block', schoolController.schoolBlockStatus);
router.get('/school-edit/:id', schoolController.editSchool);
router.post('/school-edit/:id', upload.fields([{ name: 'school_logo', maxCount: 1 }]), schoolController.updateSchool);

// Product Routes
router.get('/products', productController.displayProducts);
router.get('/add-products', productController.displayCreateProduct);
router.post('/products/store', upload.fields([{ name: 'gallery[]', maxCount: 100 }]), productController.createProduct);
router.get('/edit-products/:id', productController.editProduct);
router.post('/products/update/:id', upload.fields([{ name: 'gallery[]', maxCount: 100 }]), productController.updateProduct);
router.post('/delete-products/:id', productController.deleteProduct);
 

// Coupon Routes
router.get('/coupons', couponController.getAllCoupons);
router.post('/coupon/store', couponController.storeCoupon);
router.get('/coupon/edit/:id', couponController.editCoupon);
router.post('/coupon/edit/:id', couponController.updateCoupon);
router.get('/coupon/delete/:id', couponController.deleteCoupon);




module.exports = router;  
