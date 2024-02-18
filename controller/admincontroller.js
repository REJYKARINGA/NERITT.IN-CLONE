require('express')
const database = require('../db/db')
const fs = require('fs')
const userCollection = require('../model/userSchema')
const schoolSchema = require('../model/schoolSchema');
const productSchema = require('../model/productSchema');
const categorySchema = require('../model/categorySchema');
const Product = require('../model/productSchema');
const Order = require('../model/orderSchema');
const mongoose = require('mongoose')
const sizeOf = require('image-size'); 

const dashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      const admin = await userCollection.find();

     
      req.flash('success', 'Admin data loaded successfully!');

      res.render('admin/dashboard.ejs', { success: req.flash('success'), admin }); 
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    
    req.flash('error', 'Error loading admin data');
    console.error('Error loading admin data:', error.message);
    res.render('admin/dashboard.ejs', { error: req.flash('error') }); 
  }
};


const users = async (req, res) => {
  if (req.session.admin) {
    const admin = await userCollection.find();
   
    res.render('admin/users', { admin: admin }); 
   
  } else {
    res.redirect('/admin');
  }
}




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




const deleted = async (req, res) => {
  console.log("hello i am here");
  try {
    const categoryId = req.params.id;

   
    const catId = await categoryDetails.findById(categoryId);


    await categorySchema.findByIdAndDelete(catId);

    res.redirect('/category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}




const toggleBlockStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const statusId = req.params.id;
    const user = await userCollection.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    
    user.blocked = !user.blocked;

    await user.save();

    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error toggling user status: ' + error.message);
  }
};




const salesReport = async (req, res) => {
  if (req.session.admin) {
    res.render('admin/salesReport')

  }
  else {
    res.redirect('/admin')
  }
}


const categories = async (req, res) => {
  if (req.session.admin) {
    const admin = await categorySchema.find();
    res.render('admin/categories', {
      admin: admin,
      success: req.flash('success'),
      error: req.flash('error')
    }); // Pass the admin data to the EJS template

  } else {
    res.redirect('/admin');
  }
}




const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;
  return megapixels < 1;
};

const createCategory = async (req, res) => {
  try {
    
    if (!req.session.admin) {
      req.flash('success', 'Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const { category_name, description, in_home } = req.body;
    let categoryToUpper = category_name.toUpperCase();
    const isCategoryExist = await categorySchema.findOne({ category_name: categoryToUpper });

    if (isCategoryExist) {
      req.flash('success', 'Category already exists.');
      return res.redirect('/admin/categories');
    }

   
    const logo_imagePath = req.files['logo_image'] ? req.files['logo_image'][0].path : null;

  
    const logo_dimensions = logo_imagePath ? sizeOf(logo_imagePath) : null;

    
    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {
     
      console.log('Invalid image dimensions');
      if (logo_imagePath) {
        fs.unlinkSync(logo_imagePath); 
      }
      req.flash('success', 'Invalid image dimensions. Please upload images that meet the criteria.');
      return res.redirect('/admin/categories');
    }

    const newCategory = new categorySchema({
      category_name: categoryToUpper,
      description,
      in_home: in_home === '1',
      logo_image: logo_imagePath
    });

   
    await newCategory.save();
    req.flash('success', 'Category created successfully.');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error creating category:', error);
    req.flash('error', 'Internal Server Error');
    console.log('Error flash message set:', req.flash('error'));
    res.status(500).send('Internal Server Error');
  }
};



const editCategory = async (req, res) => {
  try {
   
    const categoryId = req.params.id;
    const category = await categorySchema.findById(categoryId);

   
    res.render('admin/editCategory', { success: req.flash('success'), error: req.flash('error'), category });
  } catch (error) {
    console.error('Error rendering edit category page:', error);
    res.status(500).send('Internal Server Error');
  }
}



const updateCategory = async (req, res) => {
  let categoryId; 
  try {
   
    if (!req.session.admin) {
      return res.redirect("/admin");
    }

    categoryId = req.params.id; 

   
    const existingCategory = await categorySchema.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).send('Category not found for update');
    }

    const { category_name, description, in_home } = req.body;

   
    const isCategoryExist = await categorySchema.findOne({
      category_name: category_name.toUpperCase(),
      _id: { $ne: categoryId }
    });

    if (isCategoryExist) {
     
      req.flash('error', 'Category name already exists');
      return res.redirect(`/admin/edit/${categoryId}`); 
    }

   const logo_imagePath = req.files['logo_image'] ? req.files['logo_image'][0].path : existingCategory.logo_image;

    const logo_dimensions = logo_imagePath ? sizeOf(logo_imagePath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {
      console.log('Invalid image dimensions');
      if (logo_imagePath !== existingCategory.logo_image) {
        fs.unlinkSync(logo_imagePath); // Delete the invalid image
      }
      return res.send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

   existingCategory.category_name = category_name.toUpperCase(); // Convert to uppercase as per previous logic
    existingCategory.description = description;
    existingCategory.in_home = in_home === '1';
    existingCategory.logo_image = logo_imagePath;

   await existingCategory.save();

  req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
   req.flash('error', 'Error updating category: ' + error.message);
    res.redirect(`/admin/edit/${categoryId}`);
  }
};







const displaySchools = async (req, res) => {
  if (req.session.admin) {
    const admin = await schoolSchema.find();
    console.log(admin); 
    res.render('admin/schoolDetails', { admin: admin }); 

  } else {
    res.redirect('/admin');
  }
}

const displayCreateSchool = (req, res) => {
  console.log('create School');
  if (req.session.admin) {
    res.render('admin/schoolCreate')
  }
  else {
    
    console.log('entered to School Details Page ');
    res.render('admin/schoolDetails')
  }
}


const createSchool = async (req, res) => {
  try {
   
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.')
      return res.redirect('/admin')
    }

    const { school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst } = req.body;

    const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : null;

    const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))) {
      console.log('Invalid image dimensions');
      if (school_logoPath) {
        fs.unlinkSync(school_logoPath); 
      }
      return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

   const newSchool = new schoolSchema({
      school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst,
      school_logo: school_logoPath,
    });

   await newSchool.save();

    res.redirect('/admin/schools');
  } catch (error) {
    console.error('Error creating Schools:', error.message);
    res.status(500).send('Internal Server Error');
  }
};


const editSchool = async (req, res) => {
  try {
   if (!req.session.admin) {
      res.redirect("/admin")
    }

    const schoolId = req.params.id;
    console.log(schoolId)
    const school = await schoolSchema.findById(schoolId);

    if (!school) {
      return res.status(404).send('Category not found for Edit');
    }

    res.render('admin/schoolEdit', { school });
  } catch (error) {
    console.error('Error fetching school for edit:', error);
    res.status(500).send('Internal Server Error');
  }
};





const updateSchool = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin")
    }
    const schoolId = req.params.id;

    const school_Id = await schoolSchema.findById(schoolId);
    const { school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst } = req.body;

    const existingSchool = await schoolSchema.findById(school_Id);

    if (!existingSchool) {
      return res.status(404).send('School not found for update');
    }

    const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : existingSchool.school_logo;

    const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {
      console.log('Invalid image dimensions');
      if (school_logoPath !== existingSchool.school_logo) {
        fs.unlinkSync(school_logoPath); 
      }
      return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

    existingSchool.school_name = school_name;
    existingSchool.school_address = school_address;
    existingSchool.email = email;
    existingSchool.pincode = pincode;
    existingSchool.school_district = school_district;
    existingSchool.phone_number = phone_number;
    existingSchool.school_code = school_code;
    existingSchool.school_state = school_state;
    existingSchool.school_city = school_city;
    existingSchool.created_by = created_by
    existingSchool.gst = gst;

    existingSchool.school_logo = school_logoPath;

    await existingSchool.save();

    res.redirect('/admin/schools');
  } catch (error) {
    console.error('Error updating school Details:', error);
    res.status(500).send('Internal Server Error for Updating');
  }
};


const schoolBlockStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await schoolSchema.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.blocked = !user.blocked; 

    await user.save();

    res.redirect('/admin/schools'); 
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error toggling user status: ' + error.message);
  }
};




const displayProducts = async (req, res) => {
  if (req.session.admin) {
    const products = await productSchema.find().populate('school').populate('category');
    console.log("displayProducts loading")
   
    const category = await categorySchema.find();
    const school = await schoolSchema.find();

    res.render('admin/productsDetails', { category, school, products });
    

  } else {
    res.redirect('/admin');
  }
}


const displayCreateProduct = async (req, res) => {
  console.log('display create Product page');
  if (req.session.admin) {
    const getCategory = await categorySchema.find();
    const getSchool = await schoolSchema.find({ blocked: false });
    
    console.log(getCategory)

    res.render('admin/productAdd', { category: getCategory, school: getSchool });
  }
  else {
   
    console.log('admin login need to do ');
    res.redirect('/admin')
  }
}


const createProduct = async (req, res) => {
  try {
   
    if (!req.session.admin) {

      console.log('Unauthorized. Please log in.')
      return res.redirect('/admin')
    }

    const { title,
      short_description,
      description,
      sku,
      hsn,
      price,
      sales_cost,
      stock_status,
      quantity,
      delivery_charge,
      cgst,
      sgst,
      school,
      category,
      gender,
      classes,
      agent,
      brand,
      has_variant,
      color,
      size } = req.body;
    let titles = title.toUpperCase()
   
    const parsePercentage = (percentage) => {
      const numericValue = parseFloat(percentage);
      return isNaN(numericValue) ? 0 : numericValue;
    };

   
    const parsedCgst = parsePercentage(cgst);
    const parsedSgst = parsePercentage(sgst);
    const gallery = req.files['gallery[]'].map(file => file.path);


    const newProduct = new productSchema({
      title: titles,
      short_description,
      description,
      sku,
      hsn,
      price,
      sales_cost,
      stock_status,
      quantity,
      delivery_charge,
      cgst: parsedCgst,
      sgst: parsedSgst,
      school,
      category,
      gender,
      classes,
      agent,
      brand,
      has_variant,
      color,
      size,
      gallery,
    });

    await newProduct.save();

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error creating product:', error);
    res.send(error.message);
  }
};





const editProduct = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin")
    }


    const productId = req.params.id;

    const product = await productSchema.findById(productId);
    const category = await categorySchema.find();
    const school = await schoolSchema.find();
    if (!product) {
      return res.status(404).send('Product not found for Edit');
    }

    res.render('admin/productEdit', { product, category, school });
  } catch (error) {
    console.error('Error fetching Product for edit:', error);
    res.status(500).send('Internal Server Error ');
  }
};


const updateProduct = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const productId = req.params.id; 

    const product_Id = await productSchema.findById(productId);

    const {
      title,
      short_description,
      description,
      sku,
      hsn,
      price,
      sales_cost,
      stock_status,
      quantity,
      delivery_charge,
      cgst,
      sgst,
      school,
      category,
      gender,
      classes,
      agent,
      brand,
      has_variant,
      color,
      size,
    } = req.body;
    console.log(req.body)
    const parsePercentage = (percentage) => {
      const numericValue = parseFloat(percentage);
      return isNaN(numericValue) ? 0 : numericValue;
    };

    const parsedCgst = parsePercentage(cgst);
    const parsedSgst = parsePercentage(sgst);
    console.log("Before showing gallery and image")
   
    const existingProduct = await productSchema.findById(product_Id);

    if (!existingProduct) {
      console.log('Product not found.');
      return res.redirect('/admin/products');
    }

    console.log("existingProduct found", existingProduct.image)

    const imagePath = req.files['image'] ? req.files['image'][0].path : existingProduct.image;
    console.log(imagePath, "imagePath finding")

    if (imagePath !== existingProduct.image) {
      fs.unlinkSync(existingProduct.image); 
    }

    existingProduct.title = title.toUpperCase();;
    existingProduct.short_description = short_description;
    existingProduct.description = description;
    existingProduct.sku = sku;
    existingProduct.hsn = hsn;
    existingProduct.price = price;
    existingProduct.sales_cost = sales_cost;
    existingProduct.stock_status = stock_status;
    existingProduct.quantity = quantity;
    existingProduct.delivery_charge = delivery_charge;
    existingProduct.cgst = parsedCgst;
    existingProduct.sgst = parsedSgst;
    existingProduct.school = school;
    existingProduct.category = category;
    existingProduct.gender = gender;
    existingProduct.classes = classes;
    existingProduct.agent = agent;
    existingProduct.brand = brand;
    existingProduct.has_variant = has_variant;
    existingProduct.color = color;
    existingProduct.size = size;
    existingProduct.image = imagePath;

    await existingProduct.save();

    res.redirect('/admin/products');
  } catch (error) {
    console.log(error.message)
    console.error('Error editing product:', error.message);
    res.send(error.message);
  }
};



const deleteProduct = async (req, res) => {
  console.log("hello i am deleteProduct");
  try {
    const productId = req.params.id;

    const product_Id = await categoryDetails.findById(productId);


    await categorySchema.findByIdAndDelete(product_Id);
    console.log("deleteProduct ID done");
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
}


const displayOrders =async (req, res) => {
  try {

     if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

      const orders = await Order.find()
          .populate('user')
          .populate('products.product')
          .populate('address');

      res.render('admin/orders', { orders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Internal server error');
  }
};

const getOrderDetailsById = async (req, res) => {
  try {
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

      const { orderId, productId } = req.params;

      const order = await Order.findById(orderId);
      
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      const product = await Product.findById(productId);
      console.log(product,'product')

      if (!product) {
          return res.status(404).json({ message: 'Product not found in the order' });
      }

      res.render('admin/orderDetails',{ order, product });
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Find the order by its ID
    const order = await Order.findById(orderId);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the new status is different from the current status of the order
    if (order.status !== status) {
      // Update the order status
      await Order.findByIdAndUpdate(orderId, { status });

      // If the order status is 'cancelled' or 'cancelledByAdmin', adjust the product quantities
      if (status === 'cancelled' || status === 'cancelledByAdmin') {
        // Iterate over each product in the cancelled order
        for (const product of order.products) {
          const productId = product.product; // Extract productId from the product
          const productQuantity = product.quantity; // Extract product quantity

          // Find the product by its ID and increment the quantity
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { quantity: productQuantity } },
            { new: true }
          );
        }
      } else if (order.status !== 'cancelledByAdmin') {
        // No need to change quantity if the status changes from 'pending' to other statuses
        // Do nothing
      } else {
        // For other status changes, reduce the product quantity
        for (const product of order.products) {
          git branch -m main
          
          await Product.findByIdAndUpdate(
            product.product._id,
            { $inc: { quantity: -product.quantity } },
            { new: true }
          );
        }
      }
    }

    // Redirect to the admin orders page after updating
    res.redirect(`/admin/orders`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};







module.exports = {
  login,
  dashboard,
  loginValidate,
  logout,
  deleted,

  users,
  toggleBlockStatus,
  salesReport,

  categories,
  createCategory,
  editCategory,
  updateCategory,

  displaySchools,
  displayCreateSchool,
  createSchool,
  editSchool,
  schoolBlockStatus,
  updateSchool,

  displayOrders,
  getOrderDetailsById,
  updateOrderStatus,
  
  displayProducts,
  displayCreateProduct,
  createProduct,
  editProduct,
  // ProductBlockStatus,
  updateProduct,
  deleteProduct


}



