require('express')
const fs = require('fs')
const schoolSchema = require('../../model/schoolSchema');
const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema');
const Order = require('../../model/orderSchema');



const displayProducts = async (req, res, next) => {
  try {
    if (req.session.admin) {
      const { sortBy, sortOrder, page } = req.query;
      const pageSize = 10;
      const currentPage = parseInt(page) || 1;
      const skip = (currentPage - 1) * pageSize;

      const products = await productSchema.find()
        .populate('school')
        .populate('category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);
      const totalProducts = await productSchema.countDocuments();
      const totalPages = Math.ceil(totalProducts / pageSize);
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
    return next(error);
  }
};

const displayCreateProduct = async (req, res, next) => {
try {
  
  if (req.session.admin) {
    const getCategory = await categorySchema.find();
    const getSchool = await schoolSchema.find({ blocked: false });
    res.render('admin/productAdd', { category: getCategory, school: getSchool });
  }
  else {

    res.redirect('/admin')
  }
} catch (error) {
  return next(error)
}
}

const createProduct = async (req, res, next) => {
  try {

    if (!req.session.admin) {
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
    return next(error);
  }
};

const editProduct = async (req, res, next) => {
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
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!req.session.admin) {
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

    const parsePercentage = (percentage) => {
      const numericValue = parseFloat(percentage);
      return isNaN(numericValue) ? 0 : numericValue;
    };

    const parsedCgst = parsePercentage(cgst);
    const parsedSgst = parsePercentage(sgst);

    const existingProduct = await productSchema.findById(product_Id);

    if (!existingProduct) {
      return res.redirect('/admin/products');
    }

    const imagePath = req.files['image'] ? req.files['image'][0].path : existingProduct.image;

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
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product_Id = await categoryDetails.findById(productId);


    await categorySchema.findByIdAndDelete(product_Id);
    res.redirect('/admin/products');
  } catch (error) {
    return next(error);
  }
}


const topProducts = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin")
    }{
      const topProductsPipeline = [
        { $unwind: '$products' },
        { $group: { _id: { product: '$products.product', name: '$products.name' }, count: { $sum: '$products.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 2 },
        { $project: { _id: '$_id.product', name: '$_id.name', count: 1 } }
      ];
      const topProductsAggregationResult = await Order.aggregate(topProductsPipeline);
      const productIds = topProductsAggregationResult.map(product => product._id);
      const products = await productSchema.find({ _id: { $in: productIds } });
      res.render('admin/topProducts', {products, topProducts: topProductsAggregationResult });
    }
  } catch (error) {
    return next(error)
  }
}

const topCategories = async (req, res, next) => {
  try {
    
    if (!req.session.admin) {
      res.redirect("/admin")
    }{
        const topCategoriesPipeline = [
          { $unwind: '$products' },
          { $group: { _id: '$products.category', count: { $sum: '$products.quantity' } } },
          { $sort: { count: -1 } },
          { $limit: 2 }
        ];
        const topCategoriesAggregationResult = await Order.aggregate(topCategoriesPipeline);
        const categoryIds = topCategoriesAggregationResult.map(category => category._id);
        const category = await categorySchema.find({ category_name: categoryIds });
        console.log(category,' category founded',topCategoriesAggregationResult)
        res.render('admin/topCategories', { categories: category , count: topCategoriesAggregationResult});

      } 
  } catch (error) {
    return next(error)
  }

}


module.exports = {
  displayProducts,
  displayCreateProduct,
  createProduct,
  editProduct,
  updateProduct,
  deleteProduct,
  topProducts,
  topCategories
}