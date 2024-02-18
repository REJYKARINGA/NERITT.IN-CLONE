const express = require('express')
var app = express();
const router = express.Router()
const multer = require('multer');
const path  = require('path')
const admincontroller = require('../controller/admincontroller')

 

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


router.get('/',admincontroller.login) 
router.get('/dashboard',admincontroller.dashboard)
router.post('/dashboard',admincontroller.loginValidate)
router.get('/logout',admincontroller.logout)
router.get('/salesReport',admincontroller.salesReport)



router.get('/categories',admincontroller.categories)
router.post('/categories/store', upload.fields([{ name: 'logo_image', maxCount: 1 }, { name: 'banner_image', maxCount: 1 }]), admincontroller.createCategory);
router.get('/edit/:id', admincontroller.editCategory);
router.post('/edit/:id',  upload.fields([{ name: 'logo_image', maxCount: 1 }]), admincontroller.updateCategory);

router.get('/users',admincontroller.users)
router.get('/users/:id/block', admincontroller.toggleBlockStatus);

router.get('/orders',admincontroller.displayOrders)

router.get('/order-details/:orderId/:productId', admincontroller.getOrderDetailsById);

router.post('/updateOrderStatus/:orderId', admincontroller.updateOrderStatus);



router.post('/orders',admincontroller.displaySchools)
  

router.get('/schools',admincontroller.displaySchools)
router.get('/schools-add',admincontroller.displayCreateSchool)
router.post('/schools-add', upload.fields([{ name: 'school_logo', maxCount: 1 }]), admincontroller.createSchool);
router.get('/schools/:id/block', admincontroller.schoolBlockStatus);
router.get('/school-edit/:id', admincontroller.editSchool);
router.post('/school-edit/:id', upload.fields([{ name: 'school_logo', maxCount: 1 }]), admincontroller.updateSchool);


router.get('/products',admincontroller.displayProducts)
router.get('/add-products',admincontroller.displayCreateProduct)
router.post('/products/store', upload.fields([{ name: 'gallery[]', maxCount: 100 }]), admincontroller.createProduct);
router.get('/edit-products/:id', admincontroller.editProduct);
router.post('/products/update/:id',upload.fields([{ name: 'gallery[]', maxCount: 100 }]),admincontroller.updateProduct);
router.post('/delete-products/:id',admincontroller.deleteProduct);



module.exports = router;  

