require('express')
const fs = require('fs')
const schoolSchema = require('../../model/schoolSchema');
const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema');




// Product Management
const displayProducts = async (req, res) => {
  try {
    if (req.session.admin) {
      // Extract query parameters for sorting and pagination
      const { sortBy, sortOrder, page } = req.query;
      const pageSize = 10; // Number of products per page
      const currentPage = parseInt(page) || 1;
      const skip = (currentPage - 1) * pageSize;

     
      // Fetch products from the database with sorting and pagination applied
      const products = await productSchema.find()
        .populate('school')
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      // Get the total count of products for pagination
      const totalProducts = await productSchema.countDocuments();

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalProducts / pageSize);

      // Fetch categories and schools for filtering options
      const categories = await categorySchema.find();
      const schools = await schoolSchema.find();

      res.render('admin/productsDetails', {
        products,
        categories,
        schools,
        currentPage,
        totalPages,
        sortBy,
        sortOrder
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

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

module.exports = {
  displayProducts,
  displayCreateProduct,
  createProduct,
  editProduct,
  updateProduct,
  deleteProduct
}